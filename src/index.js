import {
  IS_THUNK,
  ACTION_LISTENERS,
  actionKey,
  asArray,
  STOP_PROPAGATION,
  defaultStates,
} from "./domain";

// you can use this property in your actions to mark them
// so the middleware will not propagate them to your reducers
export { STOP_PROPAGATION, defaultStates };

export const createActionListener = () => {
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
export const mockTransition = (transitionStates, transitionReducer) => (
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
export function thunk(thunkFn) {
  thunkFn[IS_THUNK] = true;
  thunkFn.withTransitionStates = (transitions) => {
    thunkFn.transitions =
      typeof transitions === "function" ? transitions(thunkFn) : transitions;

    return thunkFn;
  };
  return thunkFn;
}
