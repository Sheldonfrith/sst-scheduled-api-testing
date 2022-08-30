import { AxiosResponse } from "axios";

export class TestableApiError extends Error {
  public response: AxiosResponse;
  public customMessage: string | undefined;
  constructor(response: AxiosResponse, customMessage: string | undefined) {
    super(customMessage);
    this.name = this.constructor.name;
    this.customMessage = customMessage;
    this.response = response;
  }
}
