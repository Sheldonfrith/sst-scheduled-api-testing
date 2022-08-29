import { ConfigType } from "@serverless-stack/node/config";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { GitHubApi } from "./external/github-api";
import { APIBase, TestableAPIEndpoint, TestableApiError } from "./external/Testable-api-endpoints";
import { assert } from "./util/asserts";


export class TestableAPI {
  public rootDomain: string;
  public defaultHeaders: { [key: string]: string } | undefined;
  public constructor(config: ConfigType, defaultHeaders?: { [key: string]: string }) {
    this.rootDomain = config.API_ROOT_DOMAIN;
    this.defaultHeaders = defaultHeaders;
  }
}

export class EndpointTester {
  private api: TestableAPI;
  private endpoint: TestableAPIEndpoint<any,any>;
  private gitHubApiForFailureReporting: GitHubApi;
  private config: ConfigType;
  public constructor(
    config: ConfigType,
    api: TestableAPI, 
    endpoint: TestableAPIEndpoint<any,any>) {
    this.api = api;
    this.endpoint = endpoint;
    this.config = config;
      this.gitHubApiForFailureReporting = new GitHubApi(
        config.GITHUB_PERSONAL_ACCESS_TOKEN,
        config.API_GITHUB_REPO_OWNER_NAME,
        config.API_GITHUB_REPO_NAME,
        config.API_GITHUB_REPO_ISSUE_ASSIGNEE_USERNAME?[config.API_GITHUB_GTP_ISSUE_ASSIGNEE_USERNAME]: undefined
      );
  }
      public runTests(namesOfTestsToRun: string[]){
        const testsToRun = namesOfTestsToRun.map(
          name => async()=> await this.testEndpoint(name),
        );

        await runApiTestsWithGitHubIssuesForErrors(testsToRun)
      }
    
      private async testEndpoint(
        api: APIBase,
        endpoint: TestableAPIEndpoint<any, any>,
        bodyAndValidatorToTest: string
    ) {
      assert(
        endpoint.requestBodysAndResponseValidatorPairs.hasOwnProperty(
          testName
        )
      );
      const pair = endpoint.requestBodysAndResponseValidatorPairs[bodyAndValidatorToTest];
      const body = pair.requestBody();
      const url = api.url + endpoint.url;
      const config: AxiosRequestConfig = {
        url: url,
        method: endpoint.method,
        headers: {
          ...api.defaultHeaders
          ...this.endpoint.headers
        },
        data: body,
        validateStatus: ()=> true // we want to be able to test responses in the same way regardless of status code
      }
      const response = await axios.request(config);
      const error = endpoint.detectError(testName, response)
      if (error !== undefined) {
        error.customMessage = `Test: ${bodyAndValidatorToTest} - ${error.customMessage}`;
        throw error;
      }
      const apiError = endpoint.universalErrorDetection(response);
      if (apiError !== undefined) {
        throw apiError;
      }
  
    }

  }
    


 export async function runApiTestsWithGitHubIssuesForErrors(
    tests: {
        callback:()=> void, 
        gitHubApi: GitHubApi}[], config: ConfigType){
    //NOT using Promise.all because I want to await each test individually, to avoid overloading the apis
    for await(const  test of tests){
        try {
            try {
              await test.callback()
              console.log("Ran successfully!")
            } catch (error: unknown) {
              if (error instanceof TestableApiError) {
                // console.log(JSON.stringify(error))
                // // ! uncomment to activate
                test.gitHubApi.createGitHubIssue(test.gitHubApi.testableApiErrorToGitHubIssue(error));
              } else {
                throw error;
              }
            }
          } catch (error) {
            const gitHubApi: GitHubApi = await new GitHubApi(
              config.GITHUB_PERSONAL_ACCESS_TOKEN,
              config.GITHUB_THIS_OWNER_NAME,
              config.GITHUB_THIS_REPO_NAME,
              [config.GITHUB_THIS_ISSUE_ASSIGNEE_NAME]
            );
            // console.log(JSON.stringify(error))
            // // ! uncomment to activate
            gitHubApi.createGitHubIssue(gitHubApi.anyErrorToGitHubIssue(error as Error));
          }
        }
  }
  
  