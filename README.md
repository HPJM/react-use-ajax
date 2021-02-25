# `useAjax`

This is a hook to make Ajax requests, which helps reduce boilerplate in your code. The actual fetch is done via [`axios`](https://github.com/axios/axios).

## Usage

The hook is configured with an options object. This is an extension of the default `axios` request config with some optional success / error handlers. See the reference below.

The hook returns a tuple comprising a function, and an object with some useful properties. The function makes the actual request, and takes an optional `override` argument. The argument can be an object, which is merged in with the initial config, or a function, which is passed the initial config as an argument. The return value of the override function is by default merged in with the initial config. If you do not wish either form to be merged with the initial config, pass `false` as the second argument to the function.

```jsx
const YourComponent = () => {
  const [list, { calls, loading, data: things }] = useAjax({
    url: "localhost:3000/api/something",
    initial: [],
  });

  const [doSomeUpdate, { loading: updateLoading, data: updated }] = useAjax({
    url: "localhost:3000/api/something/1",
    method: "PATCH",
    data: [1, 2, 3],
  });

  return (
    <div>
      <button onClick={() => list()}>Fetch!</button>
      <button onClick={() => doSomeUpdate({ data: [3, 6, 9] })}>
        Update something
      </button>
      <p>{things.join(", ")}</p>
      <p>Last updated thing: {updated}</p>
      {updateLoading && <p>Updating...</p>}
      {loading && <p>Loading...</p>}
      <p>
        Called {calls} {calls === 1 ? "time" : "times"}
      </p>
    </div>
  );
};
```

## Reference

```js
const options = {
  onSuccess: (resp) => console.log("success:", resp.data),
  onError: (resp) => console.log("error:", resp),
  data: { key: "value" }
  initial: {}
}
```

- `onSuccess()?: void` - optional callback invoked when response made successfully;
- `onError()?: void` - optional callback invoked when response errors;
- `initial?: T` - this defaults to `null` but useful for setting an initial value before the first fetch is done;
- `fetchImmediately?: boolean` - this fetches on render, defaults to false;

```js
const [handler, { calls, successCalls, errorCalls, loading, data }] = useAjax(
  options
);
```

- `handler(overrideObjectOrFunc, merge: boolean): void` - invoke this to make a request;
- `calls: number` - count of requests;
- `successCalls: number` - count of successful requests;
- `errorCalls: number` - count of failed requests;
- `loading: boolean` - whether response is being waited for;
- `data: void` - the data from the response;
- `clearSuccessCalls: () => void` - clear success calls;
- `clearErrorCalls: () => void` - clear error calls;
- `clearCalls: () => void` - clear calls;
