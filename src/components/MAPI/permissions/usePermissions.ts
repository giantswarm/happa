import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { LoggedInUserTypes } from 'model/stores/main/types';
import { selectOrganizations } from 'model/stores/organization/selectors';
import { IState } from 'model/stores/state';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { IPermissionMap } from './types';
import { fetchPermissions } from './utils';

// eslint-disable-next-line no-magic-numbers
const REFRESH_INTERVAL = 60 * 1000; // In ms.

export const usePermissionsKey = 'getUserPermissions';

export function usePermissions() {
  const user = useSelector(getLoggedInUser);

  const httpClientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const organizations = useSelector((state: IState) =>
    Object.values(selectOrganizations()(state))
  );

  const firstLoadComplete = useSelector(
    (state: IState) => state.main.firstLoadComplete
  );

  const key =
    firstLoadComplete && user?.type === LoggedInUserTypes.MAPI
      ? usePermissionsKey
      : null;
  const { data, error, isValidating } = useSWR<
    IPermissionMap,
    GenericResponseError
  >(key, () => fetchPermissions(httpClientFactory, auth, organizations), {
    refreshInterval: REFRESH_INTERVAL,
  });

  const isLoading =
    typeof data === 'undefined' && typeof error === 'undefined' && isValidating;

  useEffect(() => {
    if (error) {
      const message = extractErrorMessage(error);

      new FlashMessage(
        `Something went wrong while trying to compute your user's RBAC permissions.`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
    }
  }, [error]);

  return { data, error, isLoading };
}
