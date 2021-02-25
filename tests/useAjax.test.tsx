import React from "react";
import { useAjax } from "../src";
import { UseFetchOptions } from "../src/types";
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

const BasicFetch = (props: UseFetchOptions<string[]> = {}) => {
  const [
    fetch,
    {
      calls,
      errorCalls,
      successCalls,
      loading,
      data,
      clearSuccessCalls,
      clearCalls,
      clearErrorCalls,
      fetched,
      success,
      error,
      successMessage,
      errorMessage,
    },
  ] = useAjax({ url: URL, initial: [], ...props });

  return (
    <div>
      <button onClick={() => fetch()}>Fetch</button>
      <button onClick={() => fetch({ data: ["Bond", "James Bond"] })}>
        Fetch with override object
      </button>
      <button onClick={() => fetch(() => ({ data: ["Bond", "James Bond"] }))}>
        Fetch with override function
      </button>
      {loading && <p>Loading...</p>}
      {!!data.length && <p data-testid="data">{data.join(", ")}</p>}
      <p data-testid="calls">{calls}</p>
      <p data-testid="successCalls">{successCalls}</p>
      <p data-testid="errorCalls">{errorCalls}</p>
      <button onClick={clearErrorCalls}>Clear error calls</button>
      <button onClick={clearSuccessCalls}>Clear success calls</button>
      <button onClick={clearCalls}>Clear calls</button>
      {fetched && <p>Fetched</p>}
      {success && <p>Success</p>}
      {error && <p>Error</p>}
      {successMessage && <p>{successMessage}</p>}
      {errorMessage && <p>{errorMessage}</p>}
    </div>
  );
};

describe("useAjax", () => {
  test("fetches, increments calls and shows loading", async () => {
    const onSuccess = jest.fn();

    const { queryByTestId, queryByText } = render(
      <BasicFetch onSuccess={onSuccess} />
    );
    expect(queryByText("Fetched")).not.toBeInTheDocument();
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("successCalls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
    fireEvent.click(queryByText("Fetch"));
    expect(queryByText("Loading...")).toBeInTheDocument();
    await waitFor(() => {
      expect(queryByText("Fetched")).toBeInTheDocument();
      expect(queryByText("Loading...")).not.toBeInTheDocument();
      expect(queryByTestId("data").textContent).toBe("some, values");
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("errorCalls").textContent).toBe("0");
      expect(queryByTestId("successCalls").textContent).toBe("1");
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ data: ["some", "values"] });
  });
  test("can fetch immediately", async () => {
    const onSuccess = jest.fn();

    const { queryByTestId, queryByText } = render(
      <BasicFetch fetchImmediately onSuccess={onSuccess} />
    );
    expect(queryByTestId("calls").textContent).toBe("1");
    expect(queryByTestId("successCalls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
    await waitFor(() => {
      expect(queryByText("Loading...")).not.toBeInTheDocument();
      expect(queryByTestId("data").textContent).toBe("some, values");
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("errorCalls").textContent).toBe("0");
      expect(queryByTestId("successCalls").textContent).toBe("1");
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ data: ["some", "values"] });
  });
  test("handles errors", async () => {
    const onError = jest.fn();

    const { queryByTestId, queryByText } = render(
      <BasicFetch url={ERROR_URL} onError={onError} />
    );
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("successCalls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
    fireEvent.click(queryByText("Fetch"));
    expect(queryByText("Loading...")).toBeInTheDocument();
    await waitFor(() => {
      expect(queryByText("Loading...")).not.toBeInTheDocument();
      expect(queryByTestId("data")).not.toBeInTheDocument();
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("errorCalls").textContent).toBe("1");
      expect(queryByTestId("successCalls").textContent).toBe("0");
    });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith({ error: "some error" });
  });
  test("handler works with override object", async () => {
    const onSuccess = jest.fn();

    const { queryByTestId, queryByText } = render(
      <BasicFetch onSuccess={onSuccess} method={PATCH} />
    );
    fireEvent.click(queryByText("Fetch with override object"));
    await waitFor(() => {
      expect(queryByTestId("data").textContent).toBe("Bond, James Bond");
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ data: ["Bond", "James Bond"] });
  });
  test("handler works with override function", async () => {
    const onSuccess = jest.fn();

    const { queryByTestId, queryByText } = render(
      <BasicFetch onSuccess={onSuccess} method={PATCH} />
    );
    fireEvent.click(queryByText("Fetch with override function"));
    await waitFor(() => {
      expect(queryByTestId("data").textContent).toBe("Bond, James Bond");
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith({ data: ["Bond", "James Bond"] });
  });
  test("clears success calls", async () => {
    const { queryByTestId, queryByText } = render(<BasicFetch />);
    fireEvent.click(queryByText("Fetch"));
    await waitFor(() => {
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("successCalls").textContent).toBe("1");
    });
    fireEvent.click(queryByText("Clear calls"));
    fireEvent.click(queryByText("Clear success calls"));
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("successCalls").textContent).toBe("0");
  });
  test("clears error calls", async () => {
    const { queryByTestId, queryByText } = render(
      <BasicFetch url={ERROR_URL} />
    );
    fireEvent.click(queryByText("Fetch"));
    await waitFor(() => {
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("errorCalls").textContent).toBe("1");
    });
    fireEvent.click(queryByText("Clear calls"));
    fireEvent.click(queryByText("Clear error calls"));
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
  });
  test("shows success status after fetch from prop", async () => {
    const { queryByText } = render(<BasicFetch successMessage="Success!" />);
    fireEvent.click(queryByText("Fetch"));
    await waitFor(() => {
      expect(queryByText("Success")).toBeInTheDocument();
      expect(queryByText("Success!")).toBeInTheDocument();
    });
  });
  test("shows success status after fetch from function", async () => {
    const { queryByText } = render(
      <BasicFetch
        onSuccess={() => "Success!"}
        successMessage="shouldn't run!"
      />
    );
    fireEvent.click(queryByText("Fetch"));
    await waitFor(() => {
      expect(queryByText("Success")).toBeInTheDocument();
      expect(queryByText("Success!")).toBeInTheDocument();
    });
  });
  test("shows error status after fetch from prop", async () => {
    const { queryByText } = render(
      <BasicFetch errorMessage="Error!" url={ERROR_URL} />
    );
    fireEvent.click(queryByText("Fetch"));
    await waitFor(() => {
      expect(queryByText("Error")).toBeInTheDocument();
      expect(queryByText("Error!")).toBeInTheDocument();
    });
  });
  test("shows error status after fetch from function", async () => {
    const { queryByText } = render(
      <BasicFetch
        onError={() => "Error!"}
        errorMessage="shouldn't run!"
        url={ERROR_URL}
      />
    );
    fireEvent.click(queryByText("Fetch"));
    await waitFor(() => {
      expect(queryByText("Error")).toBeInTheDocument();
      expect(queryByText("Error!")).toBeInTheDocument();
    });
  });
});
