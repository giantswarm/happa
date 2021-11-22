import {
  RELEASES_LOAD_ERROR,
  RELEASES_LOAD_REQUEST,
  RELEASES_LOAD_SUCCESS,
} from 'model/stores/releases/constants';

export interface IReleaseState {
  error: Error | null;
  isFetching: boolean;
  items: IReleases;
}

export interface IReleaseLoadActionResponse {
  releases: IReleases;
}

export interface IReleaseLoadRequestAction {
  type: typeof RELEASES_LOAD_REQUEST;
}

export interface IReleaseLoadSuccessAction {
  type: typeof RELEASES_LOAD_SUCCESS;
  response: IReleaseLoadActionResponse;
}

export interface IReleaseLoadErrorAction {
  type: typeof RELEASES_LOAD_ERROR;
  error: Error;
}

export type ReleaseActions =
  | IReleaseLoadRequestAction
  | IReleaseLoadSuccessAction
  | IReleaseLoadErrorAction;
