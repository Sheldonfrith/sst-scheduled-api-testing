import axios, {
  AxiosBasicCredentials,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  AxiosResponseHeaders,
  Method,
  responseEncoding,
  ResponseType,
} from "axios";
import { assert } from "vitest";
import _ from "lodash";

type InvalidKeyAndMessage = {
  key: string;
  message: string;
};

export type AxiosRequestConfigSerializable = {
  method?: Method | string;
  baseURL?: string;
  headers?: AxiosRequestHeaders;
  params?: any;
  data?: any;
  timeout?: number;
  timeoutErrorMessage?: string;
  withCredentials?: boolean; // unsure about this one
  auth?: AxiosBasicCredentials;
  responseType?: ResponseType | undefined;
  responseEncoding?: responseEncoding | string;
  xsrfCookieName?: string;
  xsrfHeaderName?: string;
  maxContentLength?: number;
  maxBodyLength?: number;
  maxRedirects?: number;
  //   proxy?: AxiosProxyConfig | false;
  decompress?: boolean;
};

export class AxiosRequestSerializer {
  request: AxiosRequestConfig;
  invalidRequestKeys = [
    "transformRequest",
    "transformResponse",
    "paramsSerializer",
    "adapter",
    "onUploadProgress",
    "onDownloadProgress",
    "beforeRedirect",
  ];
  notImplementedRequestKeys = [
    "validateStatus",
    "proxy",
    "httpAgent",
    "httpsAgent",
    "cancelToken",
  ];
  keysIndicatingThisIsNotAUserDefinedConfig = ["signal", "env"];

  public serialize(
    requestConfig: AxiosRequestConfig,
    handleInvalidKeysDetected: (invalidKeys: InvalidKeyAndMessage[]) => void = (
      keys
    ) => {
      throw new Error("Invalid keys detected: " + JSON.stringify(keys));
    }
  ): string {
    assert(
      Object.keys(requestConfig).some(
        (key) => !this.keysIndicatingThisIsNotAUserDefinedConfig.includes(key)
      ),
      "This is not a user defined AXIOS Config object, it has properties that should only be defined by axios"
    );
    const invalidKeys: InvalidKeyAndMessage[] = [];
    this.invalidRequestKeys.forEach((key) => {
      if (requestConfig[key]) {
        invalidKeys.push({
          key,
          message: "This property is invalid for a serializable axios request",
        });
      }
    });
    this.notImplementedRequestKeys.forEach((key) => {
      if (requestConfig[key]) {
        invalidKeys.push({
          key,
          message:
            "This property is not implemented for a serializable axios request",
        });
      }
    });
    handleInvalidKeysDetected(invalidKeys);
    return JSON.stringify(this.toSerializable(requestConfig));
  }

  public deserialize(serialized: string): AxiosRequestConfig {
    const deserialized = JSON.parse(serialized);
    return deserialized;
  }

  public toSerializable(
    requestConfig: AxiosRequestConfig
  ): AxiosRequestConfigSerializable {
    return {
      method: requestConfig.method,
      baseURL: requestConfig.baseURL,
      headers: requestConfig.headers,
      params: requestConfig.params,
      data: requestConfig.data,
      timeout: requestConfig.timeout,
      timeoutErrorMessage: requestConfig.timeoutErrorMessage,
      withCredentials: requestConfig.withCredentials,
      auth: requestConfig.auth,
      responseType: requestConfig.responseType,
      responseEncoding: requestConfig.responseEncoding,
      xsrfCookieName: requestConfig.xsrfCookieName,
      xsrfHeaderName: requestConfig.xsrfHeaderName,
      maxContentLength: requestConfig.maxContentLength,
      maxBodyLength: requestConfig.maxBodyLength,
      maxRedirects: requestConfig.maxRedirects,
      decompress: requestConfig.decompress,
    };
  }
}

//TODO STOPPED HERE
export type AxiosResponseSerializable = {
  data: any;
  status: number;
  statusText: string;
  headers: AxiosResponseHeaders;
};

export class AxiosResponseSerializer {
  public serialize(response: AxiosResponse): string {
    const serializable = this.toSerializable(response);
    return JSON.stringify(serializable);
  }
  public deserialize(serialized: string): AxiosResponseSerializable {
    return JSON.parse(serialized);
  }
  public toSerializable(response: AxiosResponse): AxiosResponseSerializable {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }
}

export class AxiosComparitor {
  public async sendNewRequestAndCompareToOldResponse(
    originalRequestSerialized: string,
    originalResponseSerialized: string
  ) {
    const originalRequestConfig = new AxiosRequestSerializer().deserialize(
      originalRequestSerialized
    );
    const originalResponse = new AxiosResponseSerializer().deserialize(
      originalResponseSerialized
    );
    const newResponse = await axios.request(originalRequestConfig);
    const newResponseSerializable =
      new AxiosResponseSerializer().toSerializable(newResponse);
    return this.compare(originalResponse, newResponseSerializable);
  }
  private compare(
    response1: AxiosResponseSerializable,
    response2: AxiosResponseSerializable
  ) {
    return (
      this.responseBodiesAreSame(response1.data, response2.data) &&
      response1.status == response2.status &&
      response1.statusText == response2.statusText &&
      this.responseHeadersAreSame(response1.headers, response2.headers)
    );
  }

  private responseBodiesAreSame(response1: any, response2: any): boolean {
    const res = _.isEqual(response1, response2);
    return res;
  }
  private responseHeadersAreSame(response1: any, response2: any) {
    //! We ignore the date header because it will always be different
    const res = _.isEqualWith(response1, response2, (obj1Val, obj2Val, key) => {
      if (key == "date") return true;
      return obj1Val == obj2Val;
    });
    return res;
  }
}
