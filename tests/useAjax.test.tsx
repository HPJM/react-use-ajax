import React from "react";
import { useAjax } from "../src";
import "@testing-library/jest-dom";
import { waitFor } from "@testing-library/react";

import { render, fireEvent } from "@testing-library/react";

const responseData = ["some", "values"];

jest.mock("axios", () => ({
  request: ({ url, method, data }) => {
    if (url === "localhost:3000") {
      if (method === "PATCH") {
        return Promise.resolve({ data });
      }
      return Promise.resolve({ data: responseData });
    }
  },
}));

const TestComponent = () => {
  const [getAll, { calls, successCalls, errorCalls, loading, data }] = useAjax<
    string[]
  >({ url: "localhost:3000", defaultDataValue: [] });
  const [update, { data: updated }] = useAjax<string>({
    url: "localhost:3000",
    method: "PATCH",
    defaultDataValue: "start",
  });
  const [updateWithFunc, { data: updatedWithFunc }] = useAjax<string>({
    url: "localhost:3000",
    method: "PATCH",
    defaultDataValue: "start",
  });

  return (
    <div>
      <button onClick={() => getAll()}>Fetch stuff!</button>
      <button onClick={() => update({ data: "next" })}>Update</button>
      <button onClick={() => updateWithFunc(() => ({ data: "with func" }))}>
        With func
      </button>
      {loading && <p>Loading...</p>}
      {!!data.length && <p data-testid="listResp">{data.join(", ")}</p>}
      <p data-testid="calls">{calls}</p>
      <p data-testid="successCalls">{successCalls}</p>
      <p data-testid="errorCalls">{errorCalls}</p>
      <p data-testid="updated">{updated}</p>
      <p data-testid="updatedWithFunc">{updatedWithFunc}</p>
    </div>
  );
};

describe("useAjax", () => {
  test("fetches with returned handler, incrementing calls and showing loading", async () => {
    const { queryByTestId, queryByText } = render(<TestComponent />);
    expect(queryByTestId("calls").textContent).toBe("0");
    expect(queryByTestId("successCalls").textContent).toBe("0");
    expect(queryByTestId("errorCalls").textContent).toBe("0");
    fireEvent.click(queryByText("Fetch stuff!"));
    expect(queryByText("Loading...")).toBeInTheDocument();
    await waitFor(() => {
      expect(queryByText("Loading...")).not.toBeInTheDocument();
      expect(queryByTestId("listResp").textContent).toEqual("some, values");
      expect(queryByTestId("calls").textContent).toBe("1");
      expect(queryByTestId("errorCalls").textContent).toBe("0");
      expect(queryByTestId("successCalls").textContent).toBe("1");
    });
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
});
