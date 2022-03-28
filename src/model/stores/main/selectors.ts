import { Constants, Providers } from 'model/constants';
import { IState } from 'model/stores/state';

export function getUserIsAdmin(state: IState) {
  return getLoggedInUser(state)?.isAdmin ?? false;
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

/**
 * Impersonation is set, and the current impersonated user does not belong
 * to the admin group
 */
export function getIsImpersonatingNonAdmin(state: IState): boolean {
  return (
    state.main.impersonation !== null &&
    !state.main.impersonation?.groups?.includes(
      window.config.mapiAuthAdminGroup
    )
  );
}
