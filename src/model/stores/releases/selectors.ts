import { compare } from 'lib/semver';
import { getUserIsAdmin } from 'model/stores/main/selectors';
import { IState } from 'model/stores/state';
import { createDeepEqualSelector } from 'model/stores/utils';

export function getReleasesIsFetching(state: IState): boolean {
  return state.entities.releases.isFetching;
}

export function getAllReleases(state: IState): IReleases {
  return state.entities.releases.items;
}

export function getReleasesError(state: IState): Error | null {
  return state.entities.releases.error;
}

export const getReleases = createDeepEqualSelector(
  [getUserIsAdmin, getAllReleases],
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
  (releases) => Object.keys(releases).sort(compare).reverse()
);
