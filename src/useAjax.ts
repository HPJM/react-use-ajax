import { useState, useEffect } from "react";
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
  fetchImmediately = false,
  successTimeout,
  errorTimeout,
  ...opts
}: UseFetchOptions<T>): UseFetch<T> => {
  const config: UseFetchOptions<T> = opts;

  const [calls, setCalls] = useState<number>(0);
  const [successCalls, setSuccessCalls] = useState<number>(0);
  const [errorCalls, setErrorCalls] = useState<number>(0);
  const [fetched, setFetched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [responseData, setResponseData] = useState<null | T>(initial || null);

  const clearError = () => {
    setError(false);
    setErrorMessage("");
  };

  const clearSuccess = () => {
    setSuccess(false);
    setSuccessMessage("");
  };

  const handleSuccess = (resp: AxiosResponse<T>) => {
    setSuccess(true);
    if (error) {
      setError(false);
      setErrorMessage("");
    }
    if (onSuccess) {
      const successMessage = onSuccess(resp) || opts.successMessage;
      if (successMessage && typeof successMessage === "string") {
        setSuccessMessage(successMessage);
      }
    } else if (opts.successMessage) {
      setSuccessMessage(opts.successMessage);
    }
    if (Number.isFinite(successTimeout)) {
      setTimeout(clearSuccess, successTimeout);
    }
    setResponseData(resp.data);
    setSuccessCalls(incCalls);
    setLoading(false);
  };
  const handleError = (resp: AxiosResponse<T>) => {
    setError(true);
    if (success) {
      setSuccess(false);
      setSuccessMessage("");
    }
    if (onError) {
      const errorMessage = onError(resp) || opts.errorMessage;
      if (errorMessage && typeof errorMessage === "string") {
        setErrorMessage(errorMessage);
      }
    } else if (opts.errorMessage) {
      setErrorMessage(opts.errorMessage);
    }
    if (Number.isFinite(errorTimeout)) {
      setTimeout(clearError, errorTimeout);
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

  useEffect(() => {
    if (fetchImmediately) {
      handler();
    }
  }, []);

  return [
    handler,
    {
      fetched,
      calls,
      errorCalls,
      successCalls,
      loading,
      data: responseData,
      clearSuccessCalls: () => setSuccessCalls(0),
      clearErrorCalls: () => setErrorCalls(0),
      clearCalls: () => setCalls(0),
      error,
      success,
      errorMessage,
      successMessage,
      clearError,
      clearSuccess,
    },
  ];
};
