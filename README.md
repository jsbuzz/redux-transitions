# redux-transitions

The motivation behind the library is to keep your global state clean and simple. Temporary states can be produced as part of the transition between two valid application states, but representing these temporary states can be messy inside your store.

The most typical example is pending and error states that occur when you are accessing data from an API or other unstable source. We can infer these temporary states from the action dispatched on the store without polluting the store itself.

For examples and tests check out the demo project: [redux-transitions-demo](https://github.com/jsbuzz/redux-transitions-demo)

## Getting started

First you need to add the middleware to your redux store. Unfortunately Redux doesn't allow native access to the store itself for middleware so to get around this we need to create an instance of the action listener and manually attach the store.

This is done to make the solution compatible with multiple stores in the same application. This way we can scope the action listeners on the store itself.

**It is important to add the action listeners before redux-thunk if we want to be able to listen on thunks.**

```
import { applyMiddleware, createStore, compose } from "redux";
import { createActionListener } from "redux-transitions";
import thunk from "redux-thunk";
import reducers from "./reducers";

// create the action listener instance

const { actionListener, setStore } = createActionListener();
const store = createStore(
  reducers,
  // apply the middleware
  compose(applyMiddleware(actionListener, thunk))
);

// attach the store to the listener instance
setStore(store);

export default store;
```

## Keeping actions from hitting the reducers

Some actions will only be used to change the Transition states and by keeping them from hitting the redcuers we can avoid some re-renders. To do this you can just add a property to the action like in the following example:

```
import { STOP_PROPAGATION } from "redux-transitions";

export const uploadError = (error) => ({
  type: UPLOAD_FAILURE,
  [STOP_PROPAGATION]: true,
  error,
});
```

## Using the hooks

The library provides three hooks to interact with redux actions. They are going from very generic to specific to fit all use cases.

### useActionListeners

This is the most generic hook that allows the component to add listener callbacks to any action or thunk that is dispatched on the store.
The arguments are a list of actions/thunks followed by a callback. You can add any number of these blocks inside the argument list.

```
import { useActionListeners } from "redux-transitions";
import { FETCH_DATA_FAILURE, FETCH_DATA_SUCCESS } from "../redux/actions";
import { fetchData } from "../redux/thunks/fetchData";

// ...
export const HookedComponent = () => {
  const [isLoading, setLoading] = useState(false);

  useActionListeners(
    fetchData,
    () => setLoading(true),

    FETCH_DATA_SUCCESS,
    FETCH_DATA_FAILURE,
    () => setLoading(false)
  );
  // ...
}
```

### useTransitions

This is a more specialized hook for reducing a state from actions dispatched on the store. It expects two arguments, the first one is the list of transitionStates, the second is a reducer function that will produce the state.

Think about the temporary states your component can be in and pair the actions that will mark that state. Example for fetching data from an API:

```
const fetchStates = {
  pending: fetchData, // the thunk that starts the fetch
  success: FETCH_DATA_SUCCESS, // the success response
  failure: FETCH_DATA_FAILURE, // the error response
};
```

Or an example for uploading a file:

```
const uploadStates = {
  pending: [
    uploadFile,    // the thunk that triggers the upload
    UPLOAD_CHUNK,  // actions that get triggered periodically for chunks of data uploaded
  ],
  success: UPLOAD_SUCCESS, // the success response
  failure: UPLOAD_FAILURE, // something went wrong
};
```

The reducer will use the current transition state and the action's payload to generate a state. An example for the data fetching:

```
const fetchReducer = (state, { error }) => ({
  isFetching: state === "pending",
  fetchError: state === "failure" && error,
});
```

A reducer for the file upload process:

```
const uploadReducer = (state, { error, percentage }) => ({
  isUploading: state === "pending",
  uploadError: state === "failure" && error,
  uploadPercentage: percentage || 0,
});
```

And this is how you can use them together:

```
export const FileUpload = () => {
  // this is coming from your store as global state
  const { uploadedFiles, totalSize } = useSelector(uploadedFilesSelector);

  // this is reduced from actions triggered as local state
  const { isUploading, uploadPercentage, uploadError } = useTransitions(
    uploadStates,
    uploadReducer
  );
  // ...


export const DataFetcher = () => {
  const dispatch = useDispatch();
  const fetchMessage = "click to fetch data";

  // this is coming from your store as global state
  const data = useSelector(dataSelector);

  // this is reduced from actions triggered as local state
  const { isFetching, fetchError } = useTransitions(fetchStates, fetchReducer);

  return (
    <div className="data-fetcher">
      <button disabled={isFetching} onClick={() => dispatch(fetchData())}>
        Fetch
      </button>
      {(isFetching && "fetching...") || fetchError || data || fetchMessage}
    </div>
  );
};

```

### usePendingState

To cover the 90% of use cases there is also a very specific hook for simple processes with the three most commonly used states:

- pending
- success
- error

Using this hook is easier that setting up the states and the reducer every time you are fetching a different piece of response from an API. Usage as simple as this:

```
const [isFetching, fetchError] = usePendingState({
  pending: fetchData,
  success: FETCH_DATA_SUCCESS,
  failure: FETCH_DATA_FAILURE,
});
```

The full example:

```
export const SimpleDataFetcher = () => {
  const dispatch = useDispatch();
  const fetchMessage = "click to fetch data";
  const data = useSelector(dataSelector);
  const [isFetching, fetchError] = usePendingState({
    pending: fetchData,
    success: FETCH_DATA_SUCCESS,
    failure: FETCH_DATA_FAILURE,
  });

  return (
    <div className="data-fetcher">
      <button disabled={isFetching} onClick={() => dispatch(fetchData())}>
        Fetch
      </button>
      {(isFetching && "fetching...") || fetchError?.error || data || fetchMessage}
    </div>
  );
};
```

You can also add a failureHandler function that extracts the error message like this:

```
export const SimpleDataFetcher = () => {
  const dispatch = useDispatch();
  const fetchMessage = "click to fetch data";
  const data = useSelector(dataSelector);
  const [isFetching, fetchError] = usePendingState({
    pending: fetchData,
    success: FETCH_DATA_SUCCESS,
    failure: FETCH_DATA_FAILURE,
    failureHandler: ({ error }) => error
  });

  return (
    <div className="data-fetcher">
      <button disabled={isFetching} onClick={() => dispatch(fetchData())}>
        Fetch
      </button>
      {(isFetching && "fetching...") || fetchError || data || fetchMessage}
    </div>
  );
};
```
