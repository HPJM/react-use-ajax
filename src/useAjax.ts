import { useState } from "react";
import axios, { AxiosResponse } from "axios";
import { UseFetchOptions, UseFetch, Override } from "./types";

const incCalls = (calls: number) => calls + 1;

export const useAjax = <T>({
  onSuccess,
  onError,
  defaultDataValue,
  ...opts
}: UseFetchOptions<T>): UseFetch<T> => {
  const config: UseFetchOptions<T> = opts;

  const [calls, setCalls] = useState<number>(0);
  const [successCalls, setSuccessCalls] = useState<number>(0);
  const [errorCalls, setErrorCalls] = useState<number>(0);
  const [fetched, setFetched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [responseData, setResponseData] = useState<null | T>(
    defaultDataValue || null
  );

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
    let updatedConfig = config;
    if (typeof override === "function") {
      const result = override(config);
      updatedConfig = merge ? { ...result, ...config } : result;
    } else {
      updatedConfig = merge
        ? {
            ...config,
            ...override,
          }
        : override;
    }
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
    },
  ];
};
