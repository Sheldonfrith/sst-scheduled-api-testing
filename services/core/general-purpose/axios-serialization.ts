import {
  AxiosBasicCredentials,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  Method,
  responseEncoding,
  ResponseType,
} from "axios";
import { assert } from "vitest";

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
    return JSON.stringify(this.getSerializable(requestConfig));
  }

  public deserialize(serialized: string): AxiosRequestConfig {
    const deserialized = JSON.parse(serialized);
    return deserialized;
    }



  private getSerializable(requestConfig: AxiosRequestConfig): AxiosRequestConfigSerializable {
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


//TODO STOPPED HER
export type AxiosResponseSerializable = {

}
export class AxiosResponseSerializer {
    public serialize(response: any): string {
        return JSON.stringify(response);
    }
    
    public deserialize(serialized: string): any {
        return JSON.parse(serialized);
    }
}
