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

// eslint-disable-next-line no-magic-numbers
const REFRESH_INTERVAL = 60 * 1000;

export function usePermissionsForOrganizations(
  _provider: PropertiesOf<typeof Providers>,
  _namespace: string
) {
  const computed: Record<string, boolean | undefined> = {
    canGet: undefined,
    canList: undefined,
    canUpdate: undefined,
    canCreate: undefined,
    canDelete: undefined,
  };

  const httpClientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const verbs = ['create', 'delete'] as const;

  const {
    data: orgsAccess,
    error,
    isValidating,
  } = useSWR<Record<typeof verbs[number], boolean>, GenericResponseError>(
    fetchAccessForResourceKey(
      '',
      verbs,
      'security.giantswarm.io',
      'organizations'
    ),
    () =>
      fetchAccessForResource(
        httpClientFactory,
        auth,
        '',
        verbs,
        'security.giantswarm.io',
        'organizations'
      ),
    {
      refreshInterval: REFRESH_INTERVAL,
    }
  );

  useEffect(() => {
    if (error) {
      const message = extractErrorMessage(error);

      new FlashMessage(
        `Something went wrong while trying to compute your user's access to organizations resources.`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
    }
  }, [error]);

  const isLoading =
    typeof orgsAccess === 'undefined' &&
    typeof error === 'undefined' &&
    isValidating;

  if (isLoading) {
    return computed;
  }

  if (!orgsAccess) return computed;

  computed.canCreate = orgsAccess.create;
  computed.canDelete = orgsAccess.delete;

  return computed;
}
