## What

A simple sst app to test api endpoints.

When an endpoint behaves unexpectedly an issue is created automatically in it's assigned GitHub repo with all information needed to reproduce/diagnose the problem.

Current example is using this public api: https://sunrise-sunset.org/api

## How

To customize this code and use it for your own purposes follow these steps:
1. The '.env' folder contains configuration params for the 'sst' stack creation process (since Config cannot be used there). Check out the available variables in that file and change them according to your needs (names should be self explanatory).
2. The 'stacks/SecretsStack.ts' file creates secrets for use in your functions, to avoid commiting them to source control. This page details how to set and use secrets with sst: https://docs.sst.dev/environment-variables. You will need to set the value of any secrets that you plan to use in your app according to the instructions on that page.
3. Whenever you change or add lambda functions in "services/functions/lambda.ts" you will need to update the 'CronStack.ts' to point to the correct function name in that file, and you will have to add more "Function" and "Cron" definitions as you add more functions in the 'lambda.ts' file
4. When you decide what API you are going to test you need to customize the code in the 'services/core/testee-api-specific' folder. First in 'non-sensitive-constants.ts' you set your main config variables like GitHub repos and Api root url. Then in the 'endpoints' folder, following the example in 'main.ts' create new endpoint definitions and their associated tests.
5. Then you can update 'functions/lambda.ts' with functions that test your specific api, using your specific test names

## Future Plans:
1. Add an additional cron job, to run less frequently, which will programatically search though GitHub issues created by this application and attempt to recreate them, if the problem cannot be recreated the issue is closed