import { Config } from "@serverless-stack/node/config";
import { Handler } from "aws-lambda";
import axios from "axios";
import {
  EndpointTester,
  TestableAPI,
} from "core/general-purpose/endpoint-testing";
import { GitHubApi } from "core/general-purpose/github-api";
import { GitHubIssueBodyJson } from "core/general-purpose/github-issue";
import { SunriseSunsetJsonEndpoint } from "core/testee-api-specific/endpoints/main";
import { Constants } from "core/testee-api-specific/non-sensitive-constants";

export const testSunriseSunsetApi: Handler = async () => {
  //setup
  const api = new TestableAPI({});
  const endpoint = SunriseSunsetJsonEndpoint;
  const endpointTester = new EndpointTester(Config, api, endpoint);
  //run tests
  //* NOTE: Tests, and their names, are defined where 'endpoint' is defined, using the 'addTest' method.
  await endpointTester.runTests([
    "PostmanSiteExample",
    "malformedDate",
    "deliberateBug",
  ]);

  return {};
};

export const cleanupGitHubRepos: Handler = async () => {
  //TODO add cron job that runs less frequently and uses the previously created GH issues
  // and follows their instructions to recreate the issue and tests if the issue still exists
  // if not close the issue
  

  //TODO ALSO: quickly check for any issues with duplicate titles, and remove all except the most recent one

  const reposToClean = [
    {
      owner: Constants.THIS_GITHUB_REPO.OWNER,
      repo: Constants.THIS_GITHUB_REPO.NAME,
    },
    {
      owner: Constants.TESTEE_API_GITHUB_REPO.OWNER,
      repo: Constants.TESTEE_API_GITHUB_REPO.NAME,
    }
  ]
  reposToClean.forEach(async repoMetadata => {
    //TODO change to handle async calls within forEach properly
    const gitHubApi = new GitHubApi(
      Config.GITHUB_PERSONAL_ACCESS_TOKEN,
      repoMetadata.owner,
      repoMetadata.repo
    );
    const allIssues = await ( await gitHubApi.getAllIssues()).data;
    //remove issues with duplicate titles first
    const issuesToClose: any[] = [];
    allIssues.forEach((issue: any) => {
      const issuesWithSameTitle = allIssues.filter((i:any) => i.title === issue.title);
      if (issuesWithSameTitle.length > 1) {
        //remove the most recent issue
        issuesWithSameTitle.sort((a: any, b: any) => {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        });
        issuesWithSameTitle.pop();
        issuesToClose.push(...issuesWithSameTitle);
      }
    }
    );
    // get issues not yet set to be closed
    const issuesToCheck = allIssues.filter((issue: any) => {
      return !issuesToClose.some((i: any) => i.id === issue.id);
    });

    
    issuesToCheck.forEach(async (issue: any) => {
      //TODO change to handle async calls within forEach properly
      // Now with all remaining, non closed issues, recreate the http request from the issue body
      const issueBody = issue.body;
      const issueBodyObj: GitHubIssueBodyJson = JSON.parse(issueBody);
      //create axios request config 
      const requestConfig = {
        method: issueBodyObj.request.method,
        url: issueBodyObj.endpointUrl,
        headers: issueBodyObj.request.headers,
        data: issueBodyObj.request.body,
      };
      
      const response = await axios.request(requestConfig);
      // and check if the same problem occurs
      const responseIsSame = 
          response.data === issueBodyObj.response.body
          && response.status === issueBodyObj.response.status
          && response.headers === issueBodyObj.response.headers;
      if (responseIsSame){

        // if the same problem occurs, add a comment to the issue saying that the problem still exists with timestamp info
        const comment = `AUTO GENERATED: The problem still exists as of ${new Date().toLocaleString()}`;
        await gitHubApi.addCommentToIssue(issue.number, comment);
      } else {
        //There may still be an issue, but it's not the same as the one that was reported, and so the issue should be closed
        // the other cron job should handle creating a new issue in this case
        issuesToClose.push(issue);
      }
      
      
    });

  })

  

  return {};
}