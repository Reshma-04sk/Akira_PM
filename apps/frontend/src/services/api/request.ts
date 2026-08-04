import { AxiosRequestConfig } from "axios";

export interface RequestConfig extends AxiosRequestConfig {}

export const createCancelToken = (): AbortController => {
  return new AbortController();
};
