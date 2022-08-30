import { StackContext, use, Cron, Function } from "@serverless-stack/resources";
import SecretsStack from "./SecretsStack";

export function CronStack({ stack }: StackContext) {
  const { TESTEE_API_AUTH_TOKEN, GITHUB_PERSONAL_ACCESS_TOKEN } =
    use(SecretsStack);

  const testSunriseSunsetLambda = new Function(
    stack,
    "testSunriseSunsetApiCronFunction",
    {
      handler: "functions/lambda.testSunriseSunsetApi",
      config: [TESTEE_API_AUTH_TOKEN, GITHUB_PERSONAL_ACCESS_TOKEN],
    }
  );

  new Cron(stack, "testSunriseSunsetApiCron", {
    //set the cron job rate here
    schedule: `rate(${process.env.ENDPOINT1_TEST_SCHEDULE || "1 day"})`,
    job: testSunriseSunsetLambda,
  });
}
