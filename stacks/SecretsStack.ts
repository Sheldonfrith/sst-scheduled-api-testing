import { Config, StackContext } from "@serverless-stack/resources";

export default function SecretsStack({ stack }: StackContext) {
  const API_AUTH_TOKEN = new Config.Secret(stack, "API_AUTH_TOKEN");
  const API_ROOT_DOMAIN = new Config.Secret(stack, "API_ROOT_DOMAIN");
  const GITHUB_PERSONAL_ACCESS_TOKEN = new Config.Secret(
    stack,
    "GITHUB_PERSONAL_ACCESS_TOKEN"
  );
  const API_GITHUB_REPO_NAME = new Config.Secret(stack, "API_GITHUB_REPO_NAME");
  const API_GITHUB_REPO_OWNER_NAME = new Config.Secret(
    stack,
    "API_GITHUB_REPO_OWNER_NAME"
  );
  const API_GITHUB_REPO_ISSUE_ASSIGNEE_USERNAME = new Config.Secret(
    stack,
    "API_GITHUB_REPO_ISSUE_ASSIGNEE_USERNAME"
  );

  return {
    API_AUTH_TOKEN,
    API_ROOT_DOMAIN,
    GITHUB_PERSONAL_ACCESS_TOKEN,
    API_GITHUB_REPO_NAME,
    API_GITHUB_REPO_OWNER_NAME,
    API_GITHUB_REPO_ISSUE_ASSIGNEE_USERNAME,
  };
}
