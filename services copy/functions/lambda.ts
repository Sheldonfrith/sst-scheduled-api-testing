import { APIGatewayProxyHandlerV2, Handler } from "aws-lambda";
import { Config, ConfigType } from "@serverless-stack/node/config";
import { assert } from "../core/util/asserts";
import { GHApi } from "../core/external/github-api";
import { APIBase, GTPSinglePredictionEndpoint } from "core/external/Testable-api-endpoints";
import {runApiTestsWithGitHubIssuesForErrors, testEndpoint} from 'core/endpoint-testing'

export const checkGTPSinglePrediction: Handler = async () => {
  //setup
  //secrets and config variables
  
    //TODO add cron job that runs less frequently and uses the previously created GH issues
    // and follows their instructions to recreate the issue and tests if the issue still exists
    // if not close the issue
  return {};
};
