import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { UseFetchOptions, UseFetch, Override } from "./types";

const incCalls = (calls: number) => calls + 1;

const processOverride = <T>(
  config: UseFetchOptions<T>,
  override: Override<T>,
  merge?: boolean
) => {
  if (typeof override === "function") {
    const result = override(config);
    return merge ? { ...result, ...config } : result;
  }
  return merge
    ? {
        ...config,
        ...override,
      }
    : override;
};

export const useAjax = <T>({
  onSuccess,
  onError,
  initial,
  ...opts
}: UseFetchOptions<T>): UseFetch<T> => {
  const config: UseFetchOptions<T> = opts;

  const [calls, setCalls] = useState<number>(0);
  const [successCalls, setSuccessCalls] = useState<number>(0);
  const [errorCalls, setErrorCalls] = useState<number>(0);
  const [fetched, setFetched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<null | T>(initial || null);

  const handleSuccess = (resp: AxiosResponse<T>) => {
    if (onSuccess) {
      onSuccess(resp);
    }
    setResponseData(resp.data);
    setSuccessCalls(incCalls);
    setLoading(false);
  };
  const handleError = (resp: AxiosResponse<T>) => {
    if (onError) {
      onError(resp);
    }
    setErrorCalls(incCalls);
    setLoading(false);
  };

  const handler = (override: Override<T> = {}, merge = true) => {
    const updatedConfig = processOverride(config, override, merge);
    if (!fetched) {
      setFetched(true);
    }
    setCalls(incCalls);
    setLoading(true);
    axios.request<T>(updatedConfig).then(handleSuccess).catch(handleError);
  };

  return [
    handler,
    {
      calls,
      errorCalls,
      successCalls,
      loading,
      data: responseData,
      clearSuccessCalls: () => setSuccessCalls(0),
      clearErrorCalls: () => setErrorCalls(0),
      clearCalls: () => setCalls(0),
    },
  ];
};
