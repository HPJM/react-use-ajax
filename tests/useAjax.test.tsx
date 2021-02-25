import React from "react";
import { useAjax } from "../src";
import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";

import { render, fireEvent } from "@testing-library/react";

const responseData = ["some", "values"];

const URL = "localhost:3000";
const ERROR_URL = "localhost:3000/error";
const PATCH = "PATCH";

jest.mock("axios", () => ({
  request: ({ url, method, data }) => {
    if (url === URL) {
      if (method === PATCH) {
        return Promise.resolve({ data });
      }
      return Promise.resolve({ data: responseData });
    }
    if (url === ERROR_URL) {
      return Promise.reject({ error: "some error" });
    }
  },
}));

const handleSuccess = jest.fn();
const handleError = jest.fn();

const TestComponent = () => {
  const [
    fetch,
    { calls, successCalls, loading, data, clearSuccessCalls, clearCalls },
  ] = useAjax<string[]>({
    url: URL,
    initial: [],
    onSuccess: handleSuccess,
  });

  const [fetchImmediately, { calls: immediateFetches }] = useAjax<string[]>({
    url: URL,
    fetchImmediately: true,
  });

  const [update, { data: updated }] = useAjax<string>({
    url: URL,
    method: PATCH,
    initial: "start",
  });
  const [updateWithFunc, { data: updatedWithFunc }] = useAjax<string>({
    url: URL,
    method: PATCH,
    initial: "start",
  });
  const [error, { errorCalls, clearErrorCalls }] = useAjax({
    url: ERROR_URL,
    onError: handleError,
  });

  return (
    <div>
      <button onClick={() => fetch()}>Fetch</button>
      <button onClick={clearSuccessCalls}>Clear fetch success calls</button>
      <button onClick={clearErrorCalls}>Clear error calls</button>
      <button onClick={clearCalls}>Clear fetch calls</button>
      <button onClick={() => error()}>Cause error</button>
      <button onClick={() => update({ data: "next" })}>Update</button>
      <button onClick={() => updateWithFunc(() => ({ data: "with func" }))}>
        With func
      </button>
      {loading && <p>Loading...</p>}
      {!!data.length && <p data-testid="listResp">{data.join(", ")}</p>}
      <p data-testid="calls">{calls}</p>
      <p data-testid="immediateFetches">{immediateFetches}</p>
      <p data-testid="successCalls">{successCalls}</p>
      <p data-testid="errorCalls">{errorCalls}</p>
      <p data-testid="updated">{updated}</p>
      <p data-testid="updatedWithFunc">{updatedWithFunc}</p>
    </div>
  );
};

describe("useAjax", () => {
  test("fetches with returned handler, incrementing calls and showing loading", async () => {
    // Render and check initial state
    const { queryByTestId, queryByText } = render(<TestComponent />);
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("successCalls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
    // Call fetch and error endpoints
    fireEvent.click(queryByText("Fetch"));
    fireEvent.click(queryByText("Cause error"));
    expect(queryByText("Loading...")).toBeInTheDocument();
    // Wait for changes in the UI
    await waitFor(() => {
      expect(queryByText("Loading...")).not.toBeInTheDocument();
      expect(queryByTestId("listResp").textContent).toEqual("some, values");
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("errorCalls").textContent).toBe("1");
      expect(queryByTestId("successCalls").textContent).toBe("1");
      expect(queryByTestId("immediateFetches").textContent).toBe("1");
    });
    // Check handlers called
    expect(handleSuccess).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleSuccess).toHaveBeenCalledWith({ data: ["some", "values"] });
    expect(handleError).toHaveBeenCalledWith({ error: "some error" });
  });
  test("handler works with overrides", async () => {
    const { queryByTestId, queryByText } = render(<TestComponent />);
    expect(queryByTestId("updated").textContent).toEqual("start");
    fireEvent.click(queryByText("Update"));
    await waitFor(() => {
      expect(queryByTestId("updated").textContent).toEqual("next");
    });
  });
  test("handler works with overrides as func", async () => {
    const { queryByTestId, queryByText } = render(<TestComponent />);
    expect(queryByTestId("updatedWithFunc").textContent).toEqual("start");
    fireEvent.click(queryByText("With func"));
    await waitFor(() => {
      expect(queryByTestId("updatedWithFunc").textContent).toEqual("with func");
    });
  });
  test("clears calls", async () => {
    const { queryByTestId, queryByText } = render(<TestComponent />);
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("successCalls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
    fireEvent.click(queryByText("Fetch"));
    fireEvent.click(queryByText("Cause error"));
    expect(queryByText("Loading...")).toBeInTheDocument();
    await waitFor(() => {
      expect(queryByText("Loading...")).not.toBeInTheDocument();
      expect(queryByTestId("listResp").textContent).toEqual("some, values");
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("errorCalls").textContent).toBe("1");
      expect(queryByTestId("successCalls").textContent).toBe("1");
    });
    // Invoke clear handlers
    fireEvent.click(queryByText("Clear fetch calls"));
    fireEvent.click(queryByText("Clear error calls"));
    fireEvent.click(queryByText("Clear fetch success calls"));
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("successCalls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
  });
});
