import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { IState } from 'stores/state';

import { LoggedInUserTypes } from './types';

export function getUserIsAdmin(state: IState) {
  return getLoggedInUser(state)?.isAdmin ?? false;
}

export function getProvider(state: IState): PropertiesOf<typeof Providers> {
  return state.main.info.general.provider;
}

export function getMinHAMastersVersion(state: IState): string {
  const provider = getProvider(state);
  let releaseVersion = '';

  switch (provider) {
    case Providers.AWS:
      releaseVersion = Constants.AWS_HA_MASTERS_VERSION;
      break;
  }

  if (state.main.info.features?.ha_masters?.release_version_minimum) {
    releaseVersion =
      state.main.info.features.ha_masters.release_version_minimum;
  }

  return releaseVersion;
}

export function getFirstNodePoolsRelease(state: IState): string {
  const provider = getProvider(state);
  let releaseVersion = '';

  switch (provider) {
    case Providers.AWS:
      releaseVersion = Constants.AWS_V5_VERSION;
      break;

    case Providers.AZURE:
      releaseVersion = Constants.AZURE_V5_VERSION;
      break;
  }

  if (state.main.info.features?.nodepools) {
    releaseVersion = state.main.info.features.nodepools.release_version_minimum;
  }

  return releaseVersion;
}

export function getAllowedInstanceTypeNames(state: IState): string[] {
  switch (state.main.info.general.provider) {
    case Providers.AWS:
      return state.main.info.workers.instance_type?.options ?? [];
    case Providers.AZURE:
      return state.main.info.workers.vm_size?.options ?? [];
    default:
      return [];
  }
}

export function getK8sVersionEOLDate(version: string) {
  return (state: IState): string | null => {
    if (!version) return null;

    const k8sVersions = state.main.info.general.kubernetes_versions;
    if (!k8sVersions) return null;

    const versionParts = version.split('.');
    if (versionParts.length < 2) return null;
    const minor = `${versionParts[0]}.${versionParts[1]}`;

    const versionInfo = k8sVersions.find((info) => {
      return info.minor_version === minor;
    });
    if (!versionInfo) return null;

    return versionInfo.eol_date;
  };
}

export function getLoggedInUser(state: IState): ILoggedInUser | null {
  return state.main.loggedInUser;
}

export function getHasAccessToResources(state: IState): boolean {
  const user = getLoggedInUser(state)!;
  const organizations = Object.values(state.entities.organizations.items);

  if (user.type === LoggedInUserTypes.MAPI && organizations.length < 1) {
    return false;
  }

  return true;
}
