import { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpMethod } from "aws-sdk/clients/appmesh";
import {TestableApiError} from "../testable-api-error";


interface GTPSinglePredictionBody {
  latitude: any;
  longitude: any;
  depth: any;
  month: any;
  day: any;
}
// url = "predictions/ground-temperatures/json/1";
// method = "POST";
// contentType: ContentTypes = "application/json";
export const GTPSinglePredictionEndpoint = new TestableAPIEndpoint(
  "predictions/ground-temperatures/json/1",
  "POST",
  {
    contentType: "application/json",
  }
);
GTPSinglePredictionEndpoint.addTest(
  "RapidAPIExample",
  () => {
    const b: GTPSinglePredictionBody = {
      latitude: 40,
      longitude: 20.01,
      depth: 0.43,
      month: 12,
      day: 4,
    };
    return {
      body: b,
      headers: {},
    };
  },
  (response: AxiosResponse) => {
    if (
      response.status === 200 &&
      response.data.length === 1 &&
      response.data[0] === 10.032167035727177
    ) {
      return undefined;
    }
    return new TestableApiError(
      response,
      "Response should be 200, array of length 1 and value 10.032167035727177"
    );
  }
);
GTPSinglePredictionEndpoint.addTest(
  "EverythingWrong",
  () => {
    const b: GTPSinglePredictionBody = {
      latitude: undefined,
      longitude: 20000,
      depth: false,
      month: { t: "2" },
      day: 3.3,
    };
    return {
      body: b,
      headers: {},
    };
  },
  (response: AxiosResponse) => {
    if (response.status === 400) {
      return undefined;
    }
    return new TestableApiError(response, "Response should be 400");
  }
);
GTPSinglePredictionEndpoint.addTest(
  "LatitudeOutOfRange",
  () => {
    const b: GTPSinglePredictionBody = {
      latitude: -200,
      longitude: 20.01,
      depth: 0.43,
      month: 12,
      day: 4,
    };
    return {
      body: b,
      headers: {},
    };
  },
  (response: AxiosResponse) => {
    if (
      response.status === 400 &&
      response.data.message.length === 1 &&
      response.data.message[0] === "-200 is less than the minimum of -63"
    ) {
      return undefined;
    }
    return new TestableApiError(
      response,
      "Response should be 400 and message array of length 1 and message -200 is less than the minimum of -63"
    );
  }
);
GTPSinglePredictionEndpoint.addTest(
  "DayIsNotInteger",
  () => {
    const b: GTPSinglePredictionBody = {
      latitude: 40,
      longitude: 20.01,
      depth: 0.43,
      month: 12,
      day: 3.3,
    };
    return {
      body: b,
      headers: {},
    };
  },
  (response: AxiosResponse) => {
    if (
      response.status === 400 &&
      response.data.message.length === 1 &&
      response.data.message[0] === "3.3 is not of type 'integer'"
    ) {
      return undefined;
    }
    return new TestableApiError(
      response,
      "Result should be 400 with message '3.3 is not of type 'integer'"
    );
  }
);
GTPSinglePredictionEndpoint.addTest(
  "ShouldFailDueToIncorrectValidator",
  () => {
    const b: GTPSinglePredictionBody = {
      latitude: 40,
      longitude: 20.01,
      depth: 0.43,
      month: 12,
      day: undefined,
    };
    return { body: b, headers: {} };
  },
  (response: AxiosResponse) => {
    if (response.status === 300) {
      return undefined;
    }
    return new TestableApiError(response, "Response status should be 300");
  }
);
