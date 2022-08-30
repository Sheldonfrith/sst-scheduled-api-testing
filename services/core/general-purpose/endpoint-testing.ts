import { ConfigType } from "@serverless-stack/node/config";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { GitHubApi } from "./github-api";
import { Constants } from "../testee-api-specific/non-sensitive-constants";
import { TestableAPIEndpoint } from "./testable-api-endpoint";
import { TestableApiError } from "./testable-api-error";
import { assert } from "../util/asserts";
import { GitHubIssue } from "./github-issue";

export class TestableAPI {
  public rootDomain: string;
  public defaultHeaders: { [key: string]: string } | undefined;
  public constructor(defaultHeaders?: { [key: string]: string }) {
    this.rootDomain = Constants.TESTEE_API_ROOT_DOMAIN;
    this.defaultHeaders = defaultHeaders;
  }
}

export class EndpointTester {
  private api: TestableAPI;
  private endpoint: TestableAPIEndpoint;
  private gitHubApiForTesteeFailureReporting: GitHubApi;
  private gitHubApiForTesterFailureReporting: GitHubApi;
  private url: string;
  private config: ConfigType;
  public constructor(
    config: ConfigType,
    api: TestableAPI,
    endpoint: TestableAPIEndpoint
  ) {
    this.api = api;
    this.endpoint = endpoint;
    this.config = config;
    this.gitHubApiForTesteeFailureReporting = new GitHubApi(
      config.GITHUB_PERSONAL_ACCESS_TOKEN,
      Constants.TESTEE_API_GITHUB_REPO.OWNER,
      Constants.TESTEE_API_GITHUB_REPO.NAME
    );
    this.gitHubApiForTesterFailureReporting = new GitHubApi(
      config.GITHUB_PERSONAL_ACCESS_TOKEN,
      Constants.THIS_GITHUB_REPO.OWNER,
      Constants.THIS_GITHUB_REPO.NAME
    );
    this.url = this.api.rootDomain + this.endpoint.url;
  }
  public async runTests(namesOfTestsToRun: string[]) {
    const testsToRun = namesOfTestsToRun.map(
      (name) => async () => await this.testEndpoint(name)
    );
    await this.runApiTestsWithGitHubIssuesForErrors(testsToRun);
  }

  private async testEndpoint(testName: string) {
    assert(
      testName in this.endpoint.tests,
      "testName not in tests... " + testName
    );
    const { requestGenerator } = this.endpoint.tests[testName];
    const config: AxiosRequestConfig = {
      url: this.url,
      method: this.endpoint.method,
      params: requestGenerator().queryParams,
      //from most specific to least specific, to allow header overriding
      headers: {
        ...requestGenerator().headers,
        ...this.endpoint.headers,
        ...this.api.defaultHeaders,
      },
      data: requestGenerator().body,
      validateStatus: () => true, // we want to be able to test responses in the same way regardless of status code
    };
    const response = await axios.request(config);
    const error = this.endpoint.detectError(testName, response);
    if (error !== undefined) {
      error.customMessage = `Test: ${testName} - ${error.customMessage}`;
      throw error;
    }
  }

  private async runApiTestsWithGitHubIssuesForErrors(
    tests: (() => Promise<void>)[]
  ) {
    //NOT using Promise.all because I want to await each test individually, to avoid overloading the apis
    const issuesToPost: GitHubIssue[] = [];
    for await (const test of tests) {
      try {
        await test();
        console.log("Ran successfully!");
      } catch (error: unknown) {
        if (error instanceof TestableApiError) {
            issuesToPost.push(new GitHubIssue(error, "TESTEE_API_GITHUB_REPO"))
        } else {
          issuesToPost.push(new GitHubIssue(error as Error, "THIS_GITHUB_REPO"));
        }
      }
    }
    this.gitHubApiForTesteeFailureReporting
        .postGitHubIssues(issuesToPost.filter(issue => issue.whichRepo === 'TESTEE_API_GITHUB_REPO'))
    this.gitHubApiForTesterFailureReporting
        .postGitHubIssues(issuesToPost.filter(issue => issue.whichRepo === 'THIS_GITHUB_REPO'))
  }
}
