export interface ILoadingState {
  [key: string]: boolean;
}

export interface ILoadingAction {
  type: string;
}

export type LoadingActions = ILoadingAction;
