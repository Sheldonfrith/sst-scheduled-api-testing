import { OctokitResponse } from "@octokit/types/dist-types/OctokitResponse";
import { HttpMethod } from "aws-sdk/clients/appmesh";
import { Octokit } from "octokit";
import { GitHubIssue } from "core/general-purpose/github-issue";
export class GitHubApi {
  private ownerName: string;
  private repoName: string;
  private octokit: Octokit;

  public constructor(
    personalAccessToken: string,
    ownerName: string,
    repoName: string
  ) {
    this.ownerName = ownerName;
    this.repoName = repoName;
    this.octokit = new Octokit({
      auth: personalAccessToken,
    });
  }

  private async fetchFromGitHubApi(
    httpMethod: HttpMethod,
    urlString: string,
    body: any
  ) {
    return await this.octokit.request(`${httpMethod} ${urlString}`, body);
  }

  public async postGitHubIssue(issue: GitHubIssue) {
    const body = {
      owner: this.ownerName,
      repo: this.repoName,
      title: issue.title,
      body: issue.body,
      assignees: issue.assignees,
      labels: issue.labels,
    };

    const requestUrlString = `/repos/${this.ownerName}/${this.repoName}/issues`;
    let tries = 0;
    const maxTries = 20;
    //check if issue with same title already exists
    const allIssuesResponse = await this.fetchFromGitHubApi(
      "GET",
      requestUrlString,
      undefined
    );
    const matchingTitles = allIssuesResponse.data.filter(
      (issue: any) => issue.title === issue.title
    );
    if (matchingTitles.length > 0) {
      //DO NOT CREATE DUPLICATE ISSUE
      console.log("Issue already exists: ", issue.title);
      return;
    }
    const interval = setInterval(async () => {
      const createRequestResponse = await this.fetchFromGitHubApi(
        "POST",
        requestUrlString,
        body
      );
      const creationSuccessfull = !this.hitGHSecondaryRateLimit(
        createRequestResponse
      );
      if (creationSuccessfull || tries >= maxTries) {
        clearInterval(interval);
      }
      tries++;
    }, 3000);
  }

  private hitGHSecondaryRateLimit(response: OctokitResponse<any>) {
    return (
      response.status === 403 &&
      response.data &&
      response.data.message.includes("secondary rate limit")
    );
  }
}
