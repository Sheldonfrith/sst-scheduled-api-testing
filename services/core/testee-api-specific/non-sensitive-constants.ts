// ! WARNING: Do not put sensitive information here, use sst's SecretsStack instead.
// !  Per: https://docs.sst.dev/environment-variables#configsecret

import { assert } from "core/util/asserts";

export const Constants = {
  //attribution: https://sunrise-sunset.org/api
  TESTEE_API_ROOT_DOMAIN: "https://api.sunrise-sunset.org/", // end with a slash please

  //* Config for GitHub:
  /*
      If you are testing an API for which you do not have a GitHub repo to which you can 
      push issues with the GitHub Api (ex. one controlled by someone else),
      you can use a dummy GitHub repo just for reporting issues on that API, or you can 
      use the same repo that THIS code is in, as long as you change the ISSUE_LABELS / ISSUE_TITLE_START 
      to differentiate which issues were created because of problems in THIS code, vs 
      problems in the API code.
  */
  // your GitHub account must have permission to create issues in both repos below
  //The api that you want to test
  TESTEE_API_GITHUB_REPO: {
    ISSUE_LABELS: ["sst-scheduled-api-testing"],
    ISSUE_TITLE_START: "Auto-Generated: ",
    NAME: "sst-scheduled-api-test-testee-repo",
    OWNER: "Sheldonfrith",
    ISSUE_ASSIGNEE: "Sheldonfrith",
  },
  //The repo that holds THIS code
  THIS_GITHUB_REPO: {
    ISSUE_LABELS: ["sst-scheduled-api-testing"],
    ISSUE_TITLE_START: "Auto-Generated: ",
    NAME: "sst-scheduled-api-testing",
    OWNER: "Sheldonfrith",
    ISSUE_ASSIGNEE: "Sheldonfrith",
  },
};

assert(
  Constants.TESTEE_API_ROOT_DOMAIN.substring(-1) === "/",
  "TESTEE_API_ROOT_DOMAIN must end with a slash"
);
