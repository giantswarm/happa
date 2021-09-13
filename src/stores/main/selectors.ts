import { Constants, Providers } from 'shared/constants';
import { IState } from 'stores/state';

import { LoggedInUserTypes } from './types';
import { hasNamespacePermission, hasPermission } from './utils';

export function getUserIsAdmin(state: IState) {
  return getLoggedInUser(state)?.isAdmin ?? false;
}

export function getMinHAMastersVersion(_state: IState): string {
  const provider = window.config.info.general.provider;
  let releaseVersion = '';

  switch (provider) {
    case Providers.AWS:
      releaseVersion = Constants.AWS_HA_MASTERS_VERSION;
      break;
  }

  return releaseVersion;
}

export function getFirstNodePoolsRelease(_state: IState): string {
  const provider = window.config.info.general.provider;
  let releaseVersion = '';

  switch (provider) {
    case Providers.AWS:
      releaseVersion = Constants.AWS_V5_VERSION;
      break;

    case Providers.AZURE:
      releaseVersion = Constants.AZURE_V5_VERSION;
      break;
  }

  return releaseVersion;
}

export function getAllowedInstanceTypeNames(): string[] {
  switch (window.config.info.general.provider) {
    case Providers.AWS:
      return window.config.info.workers.instanceType.options;
    case Providers.AZURE:
      return window.config.info.workers.vmSize.options;
    default:
      return [];
  }
}

export function getLoggedInUser(state: IState): ILoggedInUser | null {
  return state.main.loggedInUser;
}

export function selectHasPermission(
  namespace: string,
  verb: string,
  group: string,
  resource: string,
  resourceName?: string
) {
  return (state: IState) => {
    return hasPermission(
      state.main.permissions,
      namespace,
      verb,
      group,
      resource,
      resourceName
    );
  };
}

export function selectHasAppAccesInNamespace(namespace: string) {
  return (state: IState) => {
    const { permissions } = state.main;

    switch (true) {
      case hasNamespacePermission(
        permissions[namespace],
        'list',
        'cluster.x-k8s.io',
        'clusters'
      ):
      case hasNamespacePermission(
        permissions[namespace],
        'get',
        'cluster.x-k8s.io',
        'clusters'
      ):
        return true;
      default:
        return false;
    }
  };
}

export function selectHasAppAccess(state: IState): boolean {
  const user = getLoggedInUser(state);
  if (!user) return false;
  if (user.type !== LoggedInUserTypes.MAPI) return true;

  const namespaces = Object.keys(state.main.permissions);
  for (const namespace of namespaces) {
    if (selectHasAppAccesInNamespace(namespace)(state)) {
      return true;
    }
  }

  return false;
}
