import { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpMethod } from "aws-sdk/clients/appmesh";
import { TestableAPIEndpoint } from "../general-purpose/testable-api-endpoint";
import { TestableApiError } from "../general-purpose/testable-api-error";

export const GTPSinglePredictionEndpoint = new TestableAPIEndpoint(
  "predictions/ground-temperatures/json/1",
  "POST",
  {
    contentType: "application/json",
  }
);
GTPSinglePredictionEndpoint.addTest(
  "Example1",
  () => ({
    body: "request body as plain text",
    headers: {
      contentType: "text/plain",
    },
  }),
  (response: AxiosResponse) => {
    if (
      response.status === 200 &&
      response.data.length === 1 &&
      response.data[0] === "SUCCESS"
    ) {
      return undefined;
    }
    return new TestableApiError(
      response,
      "Response should be 200, array of length 1 and value 'SUCCESS'"
    );
  }
);
