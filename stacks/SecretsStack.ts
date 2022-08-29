import { Config, StackContext } from "@serverless-stack/resources";

export default function SecretsStack({ stack }: StackContext) {
  const TESTEE_API_AUTH_TOKEN = new Config.Secret(
    stack,
    "TESTEE_API_AUTH_TOKEN"
  );
  const GITHUB_PERSONAL_ACCESS_TOKEN = new Config.Secret(
    stack,
    "GITHUB_PERSONAL_ACCESS_TOKEN"
  );

  return {
    TESTEE_API_AUTH_TOKEN,
    GITHUB_PERSONAL_ACCESS_TOKEN,
  };
}
