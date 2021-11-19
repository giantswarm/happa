export interface IEntityLoadingState {
  [action: string]: Record<string, boolean>;
}

export interface IEntityLoadingAction {
  id: string;
  type: string;
}

export type EntityLoadingActions = IEntityLoadingAction;
