# sst-scheduled-api-testing

A simple sst app to test api endpoints.

When an endpoint behaves unexpectedly an issue is created automatically in it's assigned GitHub repo with all information needed to reproduce/diagnose the problem.

This is an example repo, meant to be customized for your specific API testing scenario.

If you clone this repo and run it, it will send its test failures to this dummy repository, and you can see example issues there from my previous runs: https://github.com/Sheldonfrith/sst-scheduled-api-test-testee-repo/issues?q=is%3Aissue+is%3Aopen

*Current example is testing the main endpoint at this public API: https://sunrise-sunset.org/api*


----

## How to Customize

To customize this code and use it for your own purposes follow these steps:
1. The '.env' folder contains configuration params for the 'sst' stack creation process (since Config cannot be used there). Check out the available variables in that file and change them according to your needs (names should be self explanatory).
2. The 'stacks/SecretsStack.ts' file creates secrets for use in your functions, to avoid commiting them to source control. This page details how to set and use secrets with sst: https://docs.sst.dev/environment-variables. You will need to set the value of any secrets that you plan to use in your app according to the instructions on that page.
3. Whenever you change or add lambda functions in "services/functions/lambda.ts" you will need to update the 'CronStack.ts' to point to the correct function name in that file, and you will have to add more "Function" and "Cron" definitions as you add more functions in the 'lambda.ts' file
4. When you decide what API you are going to test you need to customize the code in the 'services/core/testee-api-specific' folder. First in 'non-sensitive-constants.ts' you set your main config variables like GitHub repos and Api root url. Then in the 'endpoints' folder, following the example in 'main.ts' create new endpoint definitions and their associated tests.
5. Then you can update 'functions/lambda.ts' with functions that test your specific api, using your specific test names

## TODO:
1. Add an additional cron job, to run less frequently, which will programatically search though GitHub issues created by this application and attempt to recreate them, if the problem cannot be recreated the issue is closed
2. It seems GH Api does not offer an obvious way to avoid creating duplicate issues (since in the time it takes for a request-to-see-all-issues to complete and be processed more issues may have been added), so as a temporary solution run another cron job that simply removes issues in the repos with the exact same title, as long as they fit the format of a title generated programatically by this app