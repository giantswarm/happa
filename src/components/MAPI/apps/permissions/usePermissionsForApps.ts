import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import {
  fetchAccessForResource,
  fetchAccessForResourceKey,
} from 'MAPI/permissions/utils';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import { useEffect } from 'react';
import useSWR from 'swr';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { IAppsPermissions } from './types';

// eslint-disable-next-line no-magic-numbers
const REFRESH_INTERVAL = 60 * 1000;

export function usePermissionsForApps(
  _provider: PropertiesOf<typeof Providers>,
  namespace: string
): IAppsPermissions {
  const computed: IAppsPermissions = {
    canGet: false,
    canList: false,
    canUpdate: false,
    canCreate: false,
    canDelete: false,
  };

  const httpClientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const verbs = ['get', 'list', 'update', 'create', 'delete'] as const;
  const group = 'application.giantswarm.io';
  const resource = 'apps';

  const {
    data: appAccess,
    error,
    isValidating,
  } = useSWR<Record<typeof verbs[number], boolean>, GenericResponseError>(
    fetchAccessForResourceKey(namespace, verbs, group, resource),
    () =>
      fetchAccessForResource(
        httpClientFactory,
        auth,
        namespace,
        verbs,
        group,
        resource
      ),
    {
      refreshInterval: REFRESH_INTERVAL,
    }
  );

  useEffect(() => {
    if (error) {
      const message = extractErrorMessage(error);

      new FlashMessage(
        `Something went wrong while trying to compute your user's access to app resources.`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
    }
  }, [error]);

  const isLoading =
    typeof appAccess === 'undefined' &&
    typeof error === 'undefined' &&
    isValidating;

  if (isLoading) {
    computed.canGet = undefined;
    computed.canList = undefined;
    computed.canUpdate = undefined;
    computed.canCreate = undefined;
    computed.canDelete = undefined;

    return computed;
  }

  if (!appAccess) return computed;

  computed.canGet = appAccess.get;
  computed.canList = appAccess.list;
  computed.canUpdate = appAccess.update;
  computed.canCreate = appAccess.create;
  computed.canDelete = appAccess.delete;

  return computed;
}
