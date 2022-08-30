import { Config } from "@serverless-stack/node/config";
import { Handler } from "aws-lambda";
import {
  EndpointTester,
  TestableAPI,
} from "core/general-purpose/endpoint-testing";
import { SunriseSunsetJsonEndpoint } from "core/testee-api-specific/endpoints/main";

export const testSunriseSunsetApi: Handler = async () => {
  //setup
  const api = new TestableAPI({});
  const endpoint = SunriseSunsetJsonEndpoint;
  const endpointTester = new EndpointTester(Config, api, endpoint);
  //run tests
  //* NOTE: Tests, and their names, are defined where 'endpoint' is defined, using the 'addTest' method.
  await endpointTester.runTests([
    "PostmanSiteExample",
    "malformedDate",
    "deliberateBug",
  ]);

  //TODO add cron job that runs less frequently and uses the previously created GH issues
  // and follows their instructions to recreate the issue and tests if the issue still exists
  // if not close the issue
  return {};
};
