import Auth from 'lib/auth0';
import { isJwtExpired } from 'lib/helpers';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  AuthorizationTypes,
  Constants,
  Providers,
  StatusCodes,
} from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { auth0Login } from 'stores/main/actions';
import { IState } from 'stores/state';

import { LoggedInUserTypes } from './types';

export interface ISSOError {
  status: number;
}

export function getUserIsAdmin(state: IState) {
  return state.main.loggedInUser?.isAdmin ?? false;
}

export function getProvider(state: IState): PropertiesOf<typeof Providers> {
  return state.main.info.general.provider;
}

/**
 * Select the currently stored authentication token, or a renewed one,
 * if the current one is expired.
 * @param dispatch
 */
export const selectAuthToken = (
  dispatch: ThunkDispatch<IState, void, AnyAction>
) => {
  return async (
    state: IState
  ): Promise<
    [token: string, scheme: PropertiesOf<typeof AuthorizationTypes>]
  > => {
    // TODO(axbarsan): Remove async logic.

    const user = state.main.loggedInUser;
    if (!user) {
      return Promise.reject(new Error('You are not logged in.'));
    }

    let currentToken = user.auth.token;

    try {
      /**
       * Renew the token if the user is logged in via SSO,
       * and the current token is expired.
       * */
      if (user.type === LoggedInUserTypes.Auth0 && isJwtExpired(currentToken)) {
        const newAuthData = await Auth.getInstance().renewToken();
        currentToken = newAuthData.accessToken;

        await dispatch(auth0Login(newAuthData));
      }

      return [currentToken, user.auth.scheme];
    } catch (err: unknown) {
      const newErr: ISSOError = Object.assign({}, err, {
        status: StatusCodes.Unauthorized,
      });

      return Promise.reject(newErr);
    }
  };
};

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
