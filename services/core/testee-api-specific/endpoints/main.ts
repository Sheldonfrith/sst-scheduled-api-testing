import { AxiosRequestConfig, AxiosResponse } from "axios";
import { HttpMethod } from "aws-sdk/clients/appmesh";
import { TestableAPIEndpoint } from "../../general-purpose/testable-api-endpoint";
import { TestableApiError } from "../../general-purpose/testable-api-error";

// Using this api: https://sunrise-sunset.org/api

export const SunriseSunsetJsonEndpoint = new TestableAPIEndpoint(
  "json",
  "GET",
  {}
);

SunriseSunsetJsonEndpoint.addTest(
  "PostmanSiteExample",
  () => ({
    queryParams: {
      lat: "36.7201600",
      lng: "-4.4203400",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);
SunriseSunsetJsonEndpoint.addTest(
  "RandomValidLocation",
  () => ({
    queryParams: {
      // get valid latitude and longitude randomly
      lat: (Math.random() * 180 - 90).toFixed(4),
      lng: (Math.random() * 360 - 180).toFixed(4),
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);
SunriseSunsetJsonEndpoint.addTest(
  "RandomInvalidLocation",
  () => ({
    queryParams: {
      // get invalid latitude and longitude randomly
      lat: (
        (Math.random() * 100000 + 90) *
        (Math.random() > 0.5 ? -1 : 1)
      ).toFixed(4),
      lng: (
        (Math.random() * 100000 + 180) *
        (Math.random() > 0.5 ? -1 : 1)
      ).toFixed(4),
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "zeroLatAndLong",
  () => ({
    queryParams: {
      lat: "0",
      lng: "0",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "zeroLatAndLong",
  () => ({
    queryParams: {
      lat: "0",
      lng: "0",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "zeroLatAndLong",
  () => ({
    queryParams: {
      lat: "0",
      lng: "0",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "zeroLatAndLong",
  () => ({
    queryParams: {
      lat: "0",
      lng: "0",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "emptyStringLatAndLong",
  () => ({
    queryParams: {
      lat: "",
      lng: "",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "emptyStringLatAndLong",
  () => ({
    queryParams: {
      lat: "",
      lng: "",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "emptyStringLatAndLong",
  () => ({
    queryParams: {
      lat: "",
      lng: "",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "emptyStringLatAndLong",
  () => ({
    queryParams: {
      lat: "",
      lng: "",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);
SunriseSunsetJsonEndpoint.addTest(
  "noLatAndLong",
  () => ({
    queryParams: {},
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyMalformedMessage(response),
      statusIncorrectMessage(response, "OK"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);
//HOW do I make this API fail?!
SunriseSunsetJsonEndpoint.addTest(
  "malformedDate",
  () => ({
    queryParams: {
      lat: "40",
      lng: "-73",
      date: "not a date",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      responseBodyNotEmptyObjMessage(response),
      statusIncorrectMessage(response, "INVALID_DATE"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

SunriseSunsetJsonEndpoint.addTest(
  "deliberateBug",
  () => ({
    queryParams: {
      lat: "40",
      lng: "-73",
    },
    body: undefined,
    headers: {},
  }),
  (response: AxiosResponse) => {
    const errors = [
      //these are incorrect, on purpose, as the request defined above should return with no problems
      responseBodyNotEmptyObjMessage(response),
      statusIncorrectMessage(response, "INVALID_DATE"),
    ];
    const firstErrorMessage = errors.find((e) => e !== undefined);
    if (firstErrorMessage) {
      return new TestableApiError(response, firstErrorMessage);
    }
    return undefined;
  }
);

//helper functions

function statusIncorrectMessage(
  response: AxiosResponse,
  expectedStatus: string
) {
  if (response.data.status !== expectedStatus) {
    return `Expected status ${expectedStatus}, got ${response.status}`;
  }
  return undefined;
}
function responseBodyNotEmptyObjMessage(response: AxiosResponse) {
  if (
    Object.keys(response.data).length !== 0 ||
    response.data.constructor !== Object
  ) {
    return "Response body is not an empty object empty";
  }
  return undefined;
}

function responseBodyMalformedMessage(
  response: AxiosResponse
): string | undefined {
  return response.status === 200 &&
    "results" in response.data &&
    "status" in response.data &&
    "sunrise" in response.data.results &&
    "nautical_twilight_end" in response.data.results
    ? undefined
    : "Response did not match expected: code 200 , data is obj with keys results, status, sunrise, nautical_twilight_end";
}
