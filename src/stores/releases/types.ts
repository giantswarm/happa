export interface IReleaseState {
  error: Error | null;
  isFetching: boolean;
  items: IReleases;
}

export interface IReleaseActionResponse {
  releases: IReleases;
}
