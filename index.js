import { useEffect, useState } from "react";

const actionListeners = {};

const thunkRX = /.*=>.*dispatch.*=>/i;

const isThunk = (fn) => !!fn.toString().match(thunkRX);
const asArray = (a) => (Array.isArray(a) ? a : [a]);
const asKey = (str) => (typeof str === "function" ? str().toString() : str);
const actionKey = (action) =>
  typeof action === "function" ? action.toString() : action.type;

// redux middleware that will call the action listeners
export const actionListener = () => (next) => (action) => {
  const key = actionKey(action);
  const listeners = actionListeners[key];
  if (listeners) {
    listeners.forEach((listener) => listener(action));
  }
  return next(action);
};

const processListeners = (listeners, eventCallback) => {
  listeners.reduce((a, c) => {
    if (typeof c === "function" && !isThunk(c)) {
      a.forEach((e) => {
        const key = asKey(e);
        eventCallback(key, c);
      });
      return [];
    }
    return [...a, c];
  }, []);
};

// hook for setting listeners on actions
export function useActionListeners(...listeners) {
  useEffect(() => {
    processListeners(listeners, (event, callback) => {
      const eventListeners = actionListeners[event];
      if (eventListeners) {
        eventListeners.push(callback);
      } else {
        actionListeners[event] = [callback];
      }
    });

    return function cleanup() {
      processListeners(listeners, (event, callback) => {
        const eventListeners = actionListeners[event];
        eventListeners.splice(eventListeners.indexOf(callback), 1);
      });
    };
    // eslint-disable-next-line
  }, []);
}

// hook for a standard fetch operation with pending and error states
export function useFetchState({
  fetch,
  success,
  failure,
  failureHandler = (e) => e,
}) {
  const [state, setState] = useState({
    pending: false,
    error: null,
  });

  useActionListeners(
    ...asArray(fetch),
    () =>
      setState({
        pending: true,
        error: null,
      }),

    ...asArray(success),
    () =>
      setState({
        pending: false,
        error: null,
      }),

    ...asArray(failure),
    (errorAction) =>
      setState({
        pending: false,
        error: failureHandler(errorAction),
      })
  );

  return [state.pending, state.error];
}

// hook as an experiment
// modifies the thunk and makes it trigger the pending state
export const withPendingState = (thunk) => (...done) => {
  const [loading, setLoading] = useState(false);

  useActionListeners(...done, () => setLoading(false));

  return [
    loading,
    (...a) => {
      setLoading(true);
      return thunk(...a);
    },
  ];
};
