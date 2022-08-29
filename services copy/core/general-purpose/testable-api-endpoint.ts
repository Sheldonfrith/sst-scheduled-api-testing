import { HttpMethod } from "aws-sdk/clients/appmesh";
import { AxiosResponse } from "axios";
import { TestableApiError } from "./testable-api-error";

type RequestGenerator = () => {
    body: any;
    headers: { [key: string]: string } | undefined;
  };
  
  type ResponseValidator = (
    response: AxiosResponse
  ) => TestableApiError | undefined;
  
  export type ContentTypes =
    | "application/json"
    | "application/x-www-form-urlencoded"
    | "application/xml"
    | "text/plain"
    | "multipart/form-data";
  
  export class TestableAPIEndpoint {
    public url: string;
    public method: HttpMethod;
    public headers: {
      contentType: ContentTypes;
      [key: string]: string;
    };
    public tests: Record<
      string,
      { requestGenerator: RequestGenerator; responseValidator: ResponseValidator }
    > = {};
    private universalValidators: Record<string, ResponseValidator> = {};
    public constructor(
      url: string,
      method: HttpMethod,
      headers: {
        contentType: ContentTypes;
        [key: string]: string;
      }
    ) {
      this.url = url;
      this.method = method;
      this.headers = headers;
    }
    public detectError(
      testName: string,
      response: AxiosResponse
    ): TestableApiError | undefined {
      const errorFromTest = this.tests[testName].responseValidator(response);
      if (errorFromTest) return errorFromTest;
      const firstTriggeredUniversalValidator = Object.keys(
        this.universalValidators
      ).find((key) => {
        return this.universalValidators[key](response) !== undefined;
      });
      return firstTriggeredUniversalValidator
        ? this.universalValidators[firstTriggeredUniversalValidator](response)
        : undefined;
    }
    public addTest(
      name: string,
      requestGenerator: RequestGenerator,
      responseValidator: ResponseValidator
    ) {
      this.tests[name] = {
        requestGenerator: requestGenerator,
        responseValidator: responseValidator,
      };
    }
    public addUniversalTest(name: string, responseValidator: ResponseValidator) {
      this.universalValidators[name] = responseValidator;
    }
  }