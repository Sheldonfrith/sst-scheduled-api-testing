import { Config } from "@serverless-stack/node/config";
import { Handler } from "aws-lambda";
import { EndpointTester, TestableAPI } from "core/general-purpose/endpoint-testing";
import { GTPSinglePredictionEndpoint } from "core/testee-api-specific/testable-api-endpoints";

export const checkGTPSinglePrediction: Handler = async () => {
  //setup
  const api = new TestableAPI({});
  const endpoint = GTPSinglePredictionEndpoint;
  const endpointTester = new EndpointTester(Config, api, endpoint);
  //run tests
  //* NOTE: Tests, and their names, are defined where 'endpoint' is defined usually, using the 'addTest' method.
  await endpointTester.runTests(["Example1"]);

  //TODO add cron job that runs less frequently and uses the previously created GH issues
  // and follows their instructions to recreate the issue and tests if the issue still exists
  // if not close the issue
  return {};
};
