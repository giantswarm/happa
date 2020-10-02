import { LocationChangeAction, RouterState } from 'connected-react-router';
import { History } from 'history';

export interface IRouterState extends RouterState<History.LocationState> {}

export type RouterActions = LocationChangeAction;
