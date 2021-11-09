import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getLoggedInUser } from 'stores/main/selectors';
import { LoggedInUserTypes } from 'stores/main/types';
import { selectOrganizations } from 'stores/organization/selectors';
import { IState } from 'stores/state';
import useSWR from 'swr';

import { IPermissionMap } from './types';
import { fetchPermissions } from './utils';

// eslint-disable-next-line no-magic-numbers
const REFRESH_INTERVAL = 60 * 1000; // In ms.

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
      ? 'getUserPermissions'
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
