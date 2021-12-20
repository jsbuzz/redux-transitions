'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const ACTION_LISTENERS = "__actionListeners";
const IS_THUNK = "is-thunk";

const thunkKey = (thunkFn) =>
  (`${thunkFn.name}`.length > 3 && thunkFn.name) || thunkFn.toString();
const asArray = (a) => (Array.isArray(a) ? a : [a]);
const actionKey = (action) =>
  typeof action === "function" ? thunkKey(action) : action.type;

const STOP_PROPAGATION = "__stopPropagation";
const defaultStates = {
  pending: "pending",
  success: "success",
  failure: "failure",
};

const createActionListener = () => {
  const context = {};

  return {
    // redux middleware that will call the action listeners
    actionListener: () => (next) => (action) => {
      if (!context.store[ACTION_LISTENERS]) return next(action);

      const key = actionKey(action);
      const listeners = context.store[ACTION_LISTENERS][key];
      if (listeners) {
        listeners.forEach((listener) => listener(action));
      }

      if (!action[STOP_PROPAGATION]) next(action);
    },

    // there is no other way to access the store on the listener level
    setStore: (store) => {
      context.store = store;
    },
  };
};

// function to calculate a transition state from an action
const mockTransition = (transitionStates, transitionReducer) => (
  action
) => {
  const transition = Object.keys(transitionStates).find(
    (transitionState) =>
      asArray(transitionStates[transitionState]).includes(action) ||
      asArray(transitionStates[transitionState]).includes(action.type)
  );

  return transitionReducer(transition, action);
};

// mark a thunk so it can be identified as an Action
function thunk(thunkFn) {
  thunkFn[IS_THUNK] = true;
  thunkFn.withTransitionStates = (transitions) => {
    thunkFn.transitions =
      typeof transitions === "function" ? transitions(thunkFn) : transitions;

    return thunkFn;
  };
  return thunkFn;
}

exports.STOP_PROPAGATION = STOP_PROPAGATION;
exports.createActionListener = createActionListener;
exports.defaultStates = defaultStates;
exports.mockTransition = mockTransition;
exports.thunk = thunk;
