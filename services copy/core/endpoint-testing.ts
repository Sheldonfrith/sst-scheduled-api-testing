import { ConfigType } from "@serverless-stack/node/config";
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { GHApi } from "./external/github-api";
import { APIBase, TestableAPIEndpoint, TestableApiError } from "./external/Testable-api-endpoints";
import { assert } from "./util/asserts";

export async function testEndpoint(
    api: APIBase,
    endpoint: TestableAPIEndpoint<any, any>,
    bodyAndValidatorToTest: string
  ) {
    assert(
      endpoint.requestBodysAndResponseValidatorPairs.hasOwnProperty(
        bodyAndValidatorToTest
      )
    );
    const body = endpoint.requestBodysAndResponseValidatorPairs[bodyAndValidatorToTest].requestBody();
    const headers = api.defaultHeaders;
    const url = api.url + endpoint.url;
    // const instance = axios.create(config)
    //@ts-expect-error
    let response: AxiosResponse = {};
    switch(endpoint.method) {
      case "GET":
        response = await axios.get(url, { headers: headers, validateStatus: ()=>true });
        break;
      case "POST":
        response = await axios.post(url, body, { headers: headers, validateStatus: ()=>true });
        break;
      case "PUT":
        response = await axios.put(url, body, { headers: headers, validateStatus: ()=>true });
        break;
      case "DELETE":
        response = await axios.delete(url, { headers: headers, validateStatus: ()=>true });
        break;
      default:
        throw new Error(`Unsupported method: ${endpoint.method}`);
    }
    // console.log(response);
    const error = endpoint.requestBodysAndResponseValidatorPairs[
      bodyAndValidatorToTest
    ].responseValidator(response);
    if (error !== undefined) {
      error.customMessage = `Test: ${bodyAndValidatorToTest} - ${error.customMessage}`;
      throw error;
    }
    const apiError = endpoint.universalErrorDetection(response);
    if (apiError !== undefined) {
      throw apiError;
    }

  }


 export async function runApiTestsWithGitHubIssuesForErrors(
    tests: {
        callback:()=> void, 
        gitHubApi: GHApi}[], config: ConfigType){
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
            const gitHubApi: GHApi = await new GHApi(
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
  
  