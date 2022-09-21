import { HttpMethod } from "aws-sdk/clients/appmesh";
import { AxiosAdapter, AxiosBasicCredentials, AxiosProxyConfig, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse, CancelToken, Method, responseEncoding, ResponseType, TransitionalOptions } from "axios";
import { Constants } from "../testee-api-specific/non-sensitive-constants";
import { assert } from "../util/asserts";
import { TestableApiError } from "./testable-api-error";
import {parse, stringify, toJSON, fromJSON} from 'flatted';

export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[] | undefined;
  assignees: string[] | undefined;
}

export type GitHubIssueBodyHalfSerialized = {
  userDefinedErrorMessage: string | undefined;
  endpointUrl: string;
  request: string
  response: string
}
export type GitHubIssueBodyJson = {
  userDefinedErrorMessage: string | undefined;
  endpointUrl: string;
  request: AxiosRequestConfig 
  response: AxiosResponse
};


export type RepoChoices = "THIS_GITHUB_REPO" | "TESTEE_API_GITHUB_REPO";
export class GitHubIssue implements GitHubIssue {

  static bodyFromString(body: string): GitHubIssueBodyHalfSerialized {
    const parsedBody = JSON.parse(body) as GitHubIssueBodyHalfSerialized;
    return parsedBody;
  }

  public title!: string;
  public body!: string;
  public labels: string[] | undefined;
  public assignees: string[] | undefined;
  public whichRepo: RepoChoices;
  // from TestableApiError
  public constructor(error: Error, whichRepo: RepoChoices) {
    this.whichRepo = whichRepo;
    this.labels = Constants[this.whichRepo].ISSUE_LABELS;
    this.assignees = Constants[this.whichRepo].ISSUE_ASSIGNEE
      ? [Constants[this.whichRepo].ISSUE_ASSIGNEE]
      : undefined;
    if (error.name === "TestableApiError") {
      this.fromTestableApiError(error as TestableApiError);
    } else {
      this.fromGenericError(error);
    }
    //these are because of the ts 'definite assignment assertions' for these properties above, extra safety
    assert(this.title, "issue title is nullish");
    assert(this.body, "issue body is nullish");
  }
  private fromTestableApiError(error: TestableApiError) {
    assert(error.response.config.url, "error response url is nullish");
    assert(error.response.config.method, "error response method is nullish");
    this.title = this.createGitHubIssueTitle(
      error.response.config.url,
      error.response.config.method,
      error.response,
      error.customMessage
    );
    this.body = JSON.stringify(this.createGitHubIssueBody(error));
  }
  // from any error
  private fromGenericError(error: Error) {
    this.title = `${Constants[this.whichRepo].ISSUE_TITLE_START} ${
      error.name
    } - ${error.message.substring(
      error.message.length - 50,
      error.message.length
    )}`;

    this.body = JSON.stringify({
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
  }
  private createGitHubIssueBody(error: TestableApiError): GitHubIssueBodyHalfSerialized {
    assert(error.response.config.url, "error response url is nullish");
    assert(error.response.config.method, "error response method is nullish");
    return {
      userDefinedErrorMessage: error.customMessage,
      endpointUrl: error.response.config.url,
      response: stringify(error.response),
      request: stringify(error.response.config)
    };
  }

  private createGitHubIssueTitle(
    url: string,
    method: HttpMethod,
    response: AxiosResponse,
    errorMessage: string | undefined
  ) {
    let lastPartOfUrl = url.split("/").pop();
    if (!lastPartOfUrl || lastPartOfUrl?.length < 6) {
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
    return `${
      Constants[this.whichRepo].ISSUE_TITLE_START
    } ${lastPartOfUrl} - ${method} - ${response.status} - ${
      errorMessage || endOfBody
    }`;
  }
}
