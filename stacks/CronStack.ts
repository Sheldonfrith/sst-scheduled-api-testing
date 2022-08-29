import {
  StackContext,
  Api,
  Config,
  use,
  Cron,
  Function,
} from "@serverless-stack/resources";
import SecretsStack from "./SecretsStack";

export function CronStack({ stack }: StackContext) {
  const { TESTEE_API_AUTH_TOKEN, GITHUB_PERSONAL_ACCESS_TOKEN } =
    use(SecretsStack);

  const testEndpoint1Lambda = new Function(stack, "TestEndpoint1CronFunction", {
    handler: "functions/lambda.testEndpoint1",
    config: [TESTEE_API_AUTH_TOKEN, GITHUB_PERSONAL_ACCESS_TOKEN],
  });

  new Cron(stack, "testEndpoint1Cron", {
    //set the cron job rate here
    schedule: `rate(${process.env.ENDPOINT1_TEST_SCHEDULE || "1 minutes"})`,
    job: testEndpoint1Lambda,
  });
}
