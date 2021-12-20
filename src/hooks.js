import { useEffect, useState } from "react";
import { useStore } from "react-redux";
import {
  actionTypeKey,
  asArray,
  ACTION_LISTENERS,
  defaultStates,
  isThunk,
} from "./domain";

const processListeners = (listeners, actionCallback) => {
  listeners.reduce((actions, current) => {
    if (typeof current !== "function" || isThunk(current)) {
      return [...actions, current];
    }
    actions.forEach((actionType) =>
      actionCallback(actionTypeKey(actionType), current)
    );
    return [];
  }, []);
};

// hook for setting listeners on actions
export function useActionListeners(...listeners) {
  const store = useStore();
  if (!store[ACTION_LISTENERS]) {
    store[ACTION_LISTENERS] = {};
  }
  useEffect(() => {
    processListeners(listeners, (event, callback) => {
      const actionListeners = store[ACTION_LISTENERS][event];
      if (actionListeners) {
        actionListeners.push(callback);
      } else {
        store[ACTION_LISTENERS][event] = [callback];
      }
    });

    return function cleanup() {
      processListeners(listeners, (event, callback) => {
        const actionListeners = store[ACTION_LISTENERS][event];
        actionListeners.splice(actionListeners.indexOf(callback), 1);
      });
    };
  }, []);
}

// hook for a standard fetch operation with pending and error states
export function usePendingState({
  pending,
  success,
  failure,
  failureHandler = (e) => e,
} = {}) {
  const [state, setState] = useState({
    pending: false,
    error: null,
  });

  useActionListeners(
    ...asArray(pending),
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

// hook for transitions
export const useTransitions = (transitionStates, transitionReducer) => {
  const [state, setState] = useState(transitionReducer());

  let listeners = [];
  Object.keys(transitionStates).forEach((transition) => {
    listeners = [
      ...listeners,
      ...asArray(transitionStates[transition]),
      (action) => setState(transitionReducer(transition, action)),
    ];
  });

  useActionListeners(...listeners);

  return state;
};

// simple reducer
const defaultReducer = (state, error) => [
  state === defaultStates.pending,
  state === defaultStates.failure && error,
];

// reduce the state from a thunk that has withTransitionStates
export function useThunkReducer(thunkFn, reducer) {
  return useTransitions(thunkFn.transitions, reducer || defaultReducer);
}
