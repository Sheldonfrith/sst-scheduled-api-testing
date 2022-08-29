import { APIGatewayProxyHandlerV2, Handler } from "aws-lambda";
import { Config, ConfigType } from "@serverless-stack/node/config";
import axios, {
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from "axios";
import { assert } from "../core/util/asserts";
import { GHApi } from "../core/external/github-api";
import { APIBase, GTPSinglePredictionEndpoint } from "core/external/Testable-api-endpoints";
import {runApiTestsWithGitHubIssuesForErrors, testEndpoint} from 'core/endpoint-testing'

export const checkGTPSinglePrediction: Handler = async () => {
  console.log('starting lambda')
  //setup
  //secrets and config variables
  const GTPApi: APIBase = {
    url: "https://predicting-ground-temperatures.p.rapidapi.com/",
    defaultHeaders: {
      "X-RapidAPI-Key": Config.RAPID_API_ADMIN_KEY,
      "X-RapidAPI-Host": "predicting-ground-temperatures.p.rapidapi.com",
    },
  };
  const endpoint = new GTPSinglePredictionEndpoint();
  const gitHubApiForGTPReporting: GHApi = new GHApi(
    Config.GITHUB_PERSONAL_ACCESS_TOKEN,
    Config.GITHUB_GTP_OWNER_NAME,
    Config.GITHUB_GTP_REPO_NAME,
    [Config.GITHUB_GTP_ISSUE_ASSIGNEE_NAME]
  );
  const testNamesToRun = [
    "ShouldFailDueToIncorrectValidator",
    "EverythingWrong",
    "LatitudeOutOfRange",
    "DayIsNotInteger",
    // "RapidAPIExample",
  ]
  const testsToRun = testNamesToRun.map(name => ({callback: async()=> await testEndpoint(GTPApi, endpoint, name), gitHubApi: gitHubApiForGTPReporting}));
  //run
  await runApiTestsWithGitHubIssuesForErrors( testsToRun, Config);

    //TODO add cron job that runs less frequently and uses the previously created GH issues
    // and follows their instructions to recreate the issue and tests if the issue still exists
    // if not close the issue
  return {};
};
