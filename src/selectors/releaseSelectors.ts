import { IState } from 'reducers/types';

export const getReleasesIsFetching = (state: IState): boolean =>
  state.entities.releases.isFetching;

export const getReleases = (state: IState): IReleases =>
  state.entities.releases.items;

export const getSortedReleaseVersions = (state: IState): string[] =>
  state.entities.releases.sortedVersions;

export const getReleasesError = (state: IState): Error | null =>
  state.entities.releases.error;
