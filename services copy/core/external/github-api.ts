import { OctokitResponse } from "@octokit/types/dist-types/OctokitResponse";
import { HttpMethod } from "aws-sdk/clients/appmesh";
import axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import { assert } from "core/util/asserts";
import { Octokit } from "octokit";
import { TestableApiError } from "./Testable-api-endpoints";

export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[] | undefined;
  assignees: string[] | undefined;
}

type GitHubIssueBodyJson = {
  userDefinedErrorMessage: string | undefined;
  endpointUrl: string;
  request: {
    headers: AxiosRequestHeaders;
    body: string;
  };
  response: {
    status: number;
    headers: AxiosRequestHeaders;
    body: string;
  };
};

export class GHApi {
  private personalAccessToken: string;
  private ownerName: string;
  private repoName: string;
  private allIssueAssignees: string[] | undefined;
  private octokit: Octokit;
  public constructor(
    personalAccessToken: string,
    ownerName: string,
    repoName: string,
    allIssueAssignees: string[] | undefined
  ) {
    this.personalAccessToken = personalAccessToken;
    this.ownerName = ownerName;
    this.repoName = repoName;
    this.allIssueAssignees = allIssueAssignees;
    this.octokit = new Octokit({
      auth: personalAccessToken,
    });
  }

  private async fetchFromGHApi(
    httpMethod: HttpMethod,
    urlString: string,
    body: any
  ) {
    return await this.octokit.request(`${httpMethod} ${urlString}`, body);
  }

  public async createGitHubIssue(issue: GitHubIssue) {
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
    const allIssuesResponse = await this.fetchFromGHApi("GET", requestUrlString, undefined);
    const matchingTitles = allIssuesResponse.data.filter((issue: any) => issue.title === issue.title);
    if (matchingTitles.length > 0) {
      //DO NOT CREATE DUPLICATE ISSUE
      console.log("Issue already exists: ", issue.title);
      return;
    }
    const interval = setInterval(async () => {
      const createRequestResponse = await this.fetchFromGHApi(
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
    // HTTP/2 403
    // > Content-Type: application/json; charset=utf-8
    // > Connection: close

    // > {
    // >   "message": "You have exceeded a secondary rate limit and have been temporarily blocked from content creation. Please retry your request again later.",
    // >   "documentation_url": "https://docs.github.com/rest/overview/resources-in-the-rest-api#secondary-rate-limits"
    // > }
    return (
      response.status === 403 &&
      response.data &&
      response.data.message.includes("secondary rate limit")
    );
  }

  public testableApiErrorToGitHubIssue(error: TestableApiError): GitHubIssue {
    assert(error.response.config.url);
    assert(error.response.config.method);
    return {
      title: this.createGitHubIssueTitle(
        error.response.config.url,
        error.response.config.method,
        error.response,
        error.customMessage
      ),
      body: JSON.stringify(this.createGitHubIssueBody(error)),
      labels: ["failedTest", "bot"],
      assignees: this.allIssueAssignees,
    };
  }

  public anyErrorToGitHubIssue(error: Error) {
    return {
      title: `BOT-DETECTED-ERROR: ${error.name} - ${error.message.substring(
        error.message.length - 50,
        error.message.length
      )}`,

      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        name: error.name,
      }),
      labels: ["failedTest", "bot"],
      assignees: this.allIssueAssignees,
    };
  }

  private createGitHubIssueTitle(
    url: string,
    method: HttpMethod,
    response: AxiosResponse,
    errorMessage: string | undefined
  ) {
    let lastPartOfUrl = url.split("/").pop();
    if (!lastPartOfUrl || lastPartOfUrl?.length < 6){
      lastPartOfUrl = url.substring(url.length - 6);
    }
    let bodyStr = JSON.stringify(response.data);
    let endOfBody = bodyStr.substring(bodyStr.length - 50, bodyStr.length);
    const bodyStringHasValidLastLine =
      endOfBody.includes("\n") && (bodyStr.split("\n").pop() || "").length > 0;
    if (bodyStringHasValidLastLine) {
      bodyStr = bodyStr.split("\n").pop() || "";
      endOfBody =
        bodyStr.substring(bodyStr.length - 50, bodyStr.length) ||
        "Body string parsing error in test code";
    }
    return `BOT-DETECTED-ERROR: ${lastPartOfUrl} - ${method} - ${
      response.status
    } - ${errorMessage || endOfBody}`;
  }
  private createGitHubIssueBody(error: TestableApiError): GitHubIssueBodyJson {
    assert(error.response.config.url);
    assert(error.response.config.method);
    return {
      userDefinedErrorMessage: error.customMessage,
      endpointUrl: error.response.config.url,
      response: {
        status: error.response.status,
        headers: error.response.headers,
        body: JSON.stringify(error.response.data),
      },
      request: {
        headers: error.response.config.headers || {},
        body: JSON.stringify(error.response.config.data),
      },
    };
  }
}
