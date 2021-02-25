import { AxiosRequestConfig, AxiosResponse } from "axios";

export interface UseFetchOptions<T> extends AxiosRequestConfig {
  onSuccess?: (data: AxiosResponse<T>) => void;
  onError?: (data: AxiosResponse<T>) => void;
  data?: T;
  initial?: T;
  fetchImmediately?: boolean;
}

type OverrideFunc<T> = (
  config: UseFetchOptions<T>,
  merge?: boolean
) => UseFetchOptions<T>;

export type Override<T> = UseFetchOptions<T> | OverrideFunc<T>;

export type UseFetchHandler<T> = (override?: Override<T>) => void;

interface UseFetchExtra<T> {
  calls: number;
  successCalls: number;
  errorCalls: number;
  loading: boolean;
  fetched: boolean;
  data: T;
  clearSuccessCalls: () => void;
  clearErrorCalls: () => void;
  clearCalls: () => void;
}

export type UseFetch<T> = [UseFetchHandler<T>, UseFetchExtra<T>];
