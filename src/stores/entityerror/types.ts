export interface IEntityErrorState {
  [action: string]: Record<string, string>;
}

export interface IEntityErrorAction {
  id: string;
  type: string;
  error?: string;
}

export type EntityErrorActions = IEntityErrorAction;
