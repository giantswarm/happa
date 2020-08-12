import { IState } from 'reducers/types';
import cmp from 'semver-compare';

import { createDeepEqualSelector } from './selectorUtils';

export const getReleasesIsFetching = (state: IState): boolean =>
  state.entities.releases.isFetching;

export const getAllReleases = (state: IState): IReleases =>
  state.entities.releases.items;

export const getReleasesError = (state: IState): Error | null =>
  state.entities.releases.error;

export const getReleases = createDeepEqualSelector(
  // unsure why the `isAdmin` function cannot be `getUserIsAdmin` from authSelectors
  [(state: IState) => state.main.loggedInUser.isAdmin, getAllReleases],
  (isAdmin, releases) => {
    if (isAdmin) {
      return releases;
    }

    const activeReleases: IReleases = {};

    for (const release of Object.values(releases)) {
      if (release.active) {
        activeReleases[release.version] = release;
      }
    }

    return activeReleases;
  }
);

export const getSortedReleaseVersions = createDeepEqualSelector(
  [getReleases],
  (releases) => Object.keys(releases).sort(cmp).reverse()
);
