## What

A simple sst app to test api endpoints.

When an endpoint behaves unexpectedly an issue is created automatically in it's assigned GitHub repo with all information needed to reproduce/diagnose the problem.

## Next Step:
1. Add an additional cron job, to run less frequently, which will programatically search though GitHub issues created by this application and attempt to recreate them, if the problem cannot be recreated the issue is closed