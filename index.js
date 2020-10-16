import { useEffect, useState } from "react";
import { useStore } from "react-redux";

const thunkRX = /.*=>.*dispatch.*=>/i;

const thunkKey = (thunkFn) => thunkFn.toString();

const isThunk = (fn) => !!fn.toString().match(thunkRX);
const asArray = (a) => (Array.isArray(a) ? a : [a]);
const asKey = (actionKey) =>
  typeof actionKey === "function" ? thunkKey(actionKey()) : actionKey;
const actionKey = (action) =>
  typeof action === "function" ? thunkKey(action) : action.type;

export const createActionListener = () => {
  const context = {};

  return {
    // redux middleware that will call the action listeners
    actionListener: () => (next) => (action) => {
      const key = actionKey(action);
      const listeners = context.store._actionListeners[key];
      if (listeners) {
        listeners.forEach((listener) => listener(action));
      }
      if (action._stopPropagation) return;

      return next(action);
    },

    // there is no other way to access the store on the listener level
    setStore: (store) => {
      context.store = store;
    },
  };
};

const processListeners = (listeners, eventCallback) => {
  listeners.reduce((a, c) => {
    if (typeof c !== "function" || isThunk(c)) {
      return [...a, c];
    }
    a.forEach((e) => eventCallback(asKey(e), c));
    return [];
  }, []);
};

// hook for setting listeners on actions
export function useActionListeners(...listeners) {
  const store = useStore();
  if (!store._actionListeners) {
    store._actionListeners = {};
  }
  useEffect(() => {
    processListeners(listeners, (event, callback) => {
      const eventListeners = store._actionListeners[event];
      if (eventListeners) {
        eventListeners.push(callback);
      } else {
        store._actionListeners[event] = [callback];
      }
    });

    return function cleanup() {
      processListeners(listeners, (event, callback) => {
        const eventListeners = store._actionListeners[event];
        eventListeners.splice(eventListeners.indexOf(callback), 1);
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
}) {
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
export const useTransitions = (
  transitionStates,
  transitionReducer,
  stopPropagation = []
) => {
  const [state, setState] = useState({});

  let listeners = [];
  Object.keys(transitionStates).forEach((transition) => {
    listeners = [
      ...listeners,
      ...asArray(transitionStates[transition]),
      (action) => {
        setState(transitionReducer(transition, action));
        if (stopPropagation.includes(action.type)) {
          action._stopPropagation = true;
        }
      },
    ];
  });

  useActionListeners(...listeners);

  return state;
};
