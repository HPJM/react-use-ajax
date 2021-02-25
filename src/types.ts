import { AxiosRequestConfig, AxiosResponse } from "axios";

export interface UseFetchOptions<T> extends AxiosRequestConfig {
  onSuccess?: (data: AxiosResponse<T>) => void | string;
  onError?: (data: AxiosResponse<T>) => void | string;
  data?: T;
  initial?: T;
  fetchImmediately?: boolean;
  successMessage?: string;
  errorMessage?: string;
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
  success: boolean;
  error: boolean;
  successMessage: string;
  errorMessage: string;
  data: T;
  clearSuccessCalls: () => void;
  clearErrorCalls: () => void;
  clearCalls: () => void;
  clearSuccess?: () => void;
  clearError?: () => void;
}

export type UseFetch<T> = [UseFetchHandler<T>, UseFetchExtra<T>];
