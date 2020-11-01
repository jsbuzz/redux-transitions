export const STOP_PROPAGATION: string;

export const createActionListener: () => {
  actionListener: function;
  setStore: function;
};

export type ListenerListItem = string | function;
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
  failureHandler: function
): [boolean, any];
