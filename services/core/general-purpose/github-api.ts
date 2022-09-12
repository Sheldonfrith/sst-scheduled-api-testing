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
    body: any,
    maxTries: number = 1
  ) {
    if (maxTries <= 1){
      return await this.octokit.request(`${httpMethod} ${urlString}`, body);
    }else {
      const timeBetweenTries = 3000;
      let tries= 0;
      const interval = setInterval(async () => {
        const response = await this.octokit.request(`${httpMethod} ${urlString}`, body);
        const successfull = !this.hitGHSecondaryRateLimit(response);
        if (successfull || tries >= maxTries) {
          clearInterval(interval);
        }
        tries++;
      }, timeBetweenTries);
    }

  }

  public async postGitHubIssues(issues: GitHubIssue[]) {
    //timeout to reduce race condition creating duplicate issues
    const timeout = setTimeout(async () => {
      //remove duplicates to reduce GH API calls
      const uniqueIssues = issues.filter(
        (issue, index, self) =>
          index ===
          self.findIndex(
            (t) => t.title === issue.title
          )
      );
      for (const issue of uniqueIssues) {
        await this.postGitHubIssue(issue);
      }
      clearTimeout(timeout);
    }, this.avoidRaceCondition());
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
    const allIssuesResponse = await this.getAllIssues();
    if (!allIssuesResponse) return;
    const matchingTitles = allIssuesResponse.data.filter(
      (issue: any) => issue.title === issue.title
    );
    if (matchingTitles.length > 0) {
      //DO NOT CREATE DUPLICATE ISSUE
      console.log("Issue already exists: ", issue.title);
      return;
    }
    const createRequestResponse = await this.fetchFromGitHubApi(
      "POST",
      requestUrlString,
      body,
      maxTries
    );
  }

  private hitGHSecondaryRateLimit(response: OctokitResponse<any>) {
    return (
      response.status === 403 &&
      response.data &&
      response.data.message.includes("secondary rate limit")
    );
  }
  private avoidRaceCondition() {
    // many instances of the lambda may be operational at the same time, as a temporary solution to reduce
    // duplicate GH issue creation, choose a random time to wait before sending the issues to GitHub
    const maxWaitMs = 5000;
    const randomTime = Math.floor(Math.random() * maxWaitMs);
    return randomTime;
  }

  public async getAllIssues(){
    const requestUrlString = `/repos/${this.ownerName}/${this.repoName}/issues`;
    const emptyBody = {data: []};
    return await this.fetchFromGitHubApi(
      "GET",
      requestUrlString,
      undefined
    ) || emptyBody;
  }
  public async addCommentToIssue(issueNumber: number,comment: string){
    const requestUrlString = `/repos/${this.ownerName}/${this.repoName}/issues/${issueNumber}/comments`;
    //need to allow multiple tries as these requests can trigger GH api secondary rate limit
    return await this.fetchFromGitHubApi('POST',requestUrlString,{body: comment}, 20);
  }
  public async closeIssue(issueNumber: number, comment?: string){
    //GH API docs dont say this will trigger secondary rate limit, but I think it will, so add additional tries
    return await this.fetchFromGitHubApi('PATCH',
    `/repos/${this.ownerName}/${this.repoName}/issues/${issueNumber}`,
    comment?{state: 'closed', body: comment}: {state: 'closed'},
    20
    );
  }
}
