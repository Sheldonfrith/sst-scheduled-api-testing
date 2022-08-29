import { StackContext, Api, Config, use, Cron, Function } from "@serverless-stack/resources";
import SecretsStack from "./SecretsStack";

export function CronStack({ stack }: StackContext) {
  const {
    API_AUTH_TOKEN,
    API_ROOT_DOMAIN,
    GITHUB_PERSONAL_ACCESS_TOKEN,
    API_GITHUB_REPO_NAME,
    API_GITHUB_REPO_OWNER_NAME,
    API_GITHUB_REPO_ISSUE_ASSIGNEE_USERNAME,
  } = use(SecretsStack);

  const testEndpoint1Lambda = new Function(stack, "TestEndpoint1CronFunction", {
    handler: "functions/lambda.testEndpoint1",
    config:[
      API_AUTH_TOKEN,
      API_ROOT_DOMAIN,
      GITHUB_PERSONAL_ACCESS_TOKEN,
      API_GITHUB_REPO_NAME,
      API_GITHUB_REPO_OWNER_NAME,
      API_GITHUB_REPO_ISSUE_ASSIGNEE_USERNAME
    ],
  });

  new Cron(stack, "testEndpoint1Cron", {
    //set the cron job rate here
    schedule: `rate(${process.env.ENDPOINT1_TEST_SCHEDULE || '1 minutes'})`,
    job: testEndpoint1Lambda
  });
  
}
