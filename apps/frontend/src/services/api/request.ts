export interface RequestConfig {
  signal?: AbortSignal;
  timeout?: number;
}

export const createCancelToken = (): AbortController => {
  return new AbortController();
};
