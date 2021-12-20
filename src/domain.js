export const ACTION_LISTENERS = "__actionListeners";
export const IS_THUNK = "is-thunk";
export const thunkRX = /^([^=]+|\([^)]+\))[\s]*=>[\s]*([^=]+|\([^)]+\))[\s]*=>[\s]*|^function[\s]*[^(]*\([^)]*\)[\s]*{[\s]*return[\s]+function[\s]*\([^)]*\)/i;

export const thunkKey = (thunkFn) =>
  (`${thunkFn.name}`.length > 3 && thunkFn.name) || thunkFn.toString();

export const isThunk = (fn) => fn[IS_THUNK] || !!fn.toString().match(thunkRX);
export const asArray = (a) => (Array.isArray(a) ? a : [a]);
export const actionKey = (action) =>
  typeof action === "function" ? thunkKey(action) : action.type;
export const actionTypeKey = (actionType) =>
  typeof actionType === "function" ? thunkKey(actionType()) : actionType;

export const STOP_PROPAGATION = "__stopPropagation";
export const defaultStates = {
  pending: "pending",
  success: "success",
  failure: "failure",
};
