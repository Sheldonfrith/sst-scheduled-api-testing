import { CronStack } from "./CronStack";
import { App, DebugStack } from "@serverless-stack/resources";
import { Tags } from "aws-cdk-lib";
import SecretsStack from "./SecretsStack";



export default function (app: App) {
  app.setDefaultFunctionProps({
    runtime: "nodejs16.x",
    srcPath: "services",
    bundle: {
      format: "esm",
    },
  });
  if (process.env.AWS_RESOURCE_TAG_KEY) {
    Tags.of(app).add(process.env.AWS_RESOURCE_TAG_KEY, process.env.AWS_RESOURCE_TAG_VALUE||"");
  }
  app.stack(SecretsStack);
  app.stack(CronStack);
  
}

//explicitly defining debug stack to apply optional AWS tags to it
export function debugApp(app: App) {
  // Make sure to create the DebugStack when using the debugApp callback
  new DebugStack(app, "debug-stack");
  if (process.env.AWS_RESOURCE_TAG_KEY) {
    Tags.of(app).add(process.env.AWS_RESOURCE_TAG_KEY, process.env.AWS_RESOURCE_TAG_VALUE||"");
  }
}
