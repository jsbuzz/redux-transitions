'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');
var reactRedux = require('react-redux');

const ACTION_LISTENERS = "__actionListeners";
const IS_THUNK = "is-thunk";
const thunkRX = /^([^=]+|\([^)]+\))[\s]*=>[\s]*([^=]+|\([^)]+\))[\s]*=>[\s]*|^function[\s]*[^(]*\([^)]*\)[\s]*{[\s]*return[\s]+function[\s]*\([^)]*\)/i;

const thunkKey = (thunkFn) =>
  (`${thunkFn.name}`.length > 3 && thunkFn.name) || thunkFn.toString();

const isThunk = (fn) => fn[IS_THUNK] || !!fn.toString().match(thunkRX);
const asArray = (a) => (Array.isArray(a) ? a : [a]);
const actionTypeKey = (actionType) =>
  typeof actionType === "function" ? thunkKey(actionType()) : actionType;
const defaultStates = {
  pending: "pending",
  success: "success",
  failure: "failure",
};

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
function useActionListeners(...listeners) {
  const store = reactRedux.useStore();
  if (!store[ACTION_LISTENERS]) {
    store[ACTION_LISTENERS] = {};
  }
  react.useEffect(() => {
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
function usePendingState({
  pending,
  success,
  failure,
  failureHandler = (e) => e,
} = {}) {
  const [state, setState] = react.useState({
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
const useTransitions = (transitionStates, transitionReducer) => {
  const [state, setState] = react.useState(transitionReducer());

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
function useThunkReducer(thunkFn, reducer) {
  return useTransitions(thunkFn.transitions, reducer || defaultReducer);
}

exports.useActionListeners = useActionListeners;
exports.usePendingState = usePendingState;
exports.useThunkReducer = useThunkReducer;
exports.useTransitions = useTransitions;
