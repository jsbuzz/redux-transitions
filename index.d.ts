export const STOP_PROPAGATION: string;

export const createActionListener: () => {
  actionListener: () => void;
  setStore: (store: object) => void;
};

export type ListenerListItem = string | (() => void);
export function useActionListeners(...args: ListenerListItem[]): void;

export interface TransitionStates {
  [key: string]: ListenerListItem | ListenerListItem[];
}
export type TransitionReducer<T> = (transition: string, action: object) => T;

export function useTransitions<T>(
  transitionStates: TransitionStates,
  transitionReducer: TransitionReducer<T>
): T;
export function mockTransition<T>(
  transitionStates: TransitionStates,
  transitionReducer: TransitionReducer<T>
): (action: ListenerListItem) => T;

export function usePendingState(
  pending: ListenerListItem | ListenerListItem[],
  success: ListenerListItem | ListenerListItem[],
  failure: ListenerListItem | ListenerListItem[],
  failureHandler: (error: object) => any
): [boolean, any];

export type Thunk = () => void;
export interface ThunkApi {
  withTransitionStates: (states: object | ((a: Thunk) => void)) => Thunk;
}
export function thunk(thunkFn: () => void): ThunkApi;

export function useThunkReducer<T>(
  thunk: Thunk,
  reducer: TransitionReducer<T>
): T;
