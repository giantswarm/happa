import {
  RouterActions as RFHRouterActions,
  RouterState,
} from 'redux-first-history';

export interface IRouterState extends RouterState {}

export type RouterActions = RFHRouterActions;
