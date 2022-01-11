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

export function usePermissionsForAppConfigs(
  _provider: PropertiesOf<typeof Providers>,
  namespace: string
) {
  const computed: Record<string, boolean | undefined> = {
    canGet: false,
    canUpdate: false,
    canCreate: false,
  };

  const httpClientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const verbs = ['get', 'update', 'create'] as const;

  const {
    data: configMapsAccess,
    error: configMapsError,
    isValidating: configMapsIsValidating,
  } = useSWR<Record<typeof verbs[number], boolean>, GenericResponseError>(
    fetchAccessForResourceKey(namespace, verbs, '', 'configmaps'),
    () =>
      fetchAccessForResource(
        httpClientFactory,
        auth,
        namespace,
        verbs,
        '',
        'configmaps'
      ),
    {
      refreshInterval: REFRESH_INTERVAL,
    }
  );

  const {
    data: secretsAccess,
    error: secretsError,
    isValidating: secretsIsValidating,
  } = useSWR<Record<typeof verbs[number], boolean>, GenericResponseError>(
    fetchAccessForResourceKey(namespace, verbs, '', 'secrets'),
    () =>
      fetchAccessForResource(
        httpClientFactory,
        auth,
        namespace,
        verbs,
        '',
        'secrets'
      ),
    {
      refreshInterval: REFRESH_INTERVAL,
    }
  );

  useEffect(() => {
    if (configMapsError || secretsError) {
      const message = extractErrorMessage(configMapsError || secretsError);

      new FlashMessage(
        `Something went wrong while trying to compute your user's access to app configuration resources.`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
    }
  }, [configMapsError, secretsError]);

  const configMapsIsLoading =
    typeof configMapsAccess === 'undefined' &&
    typeof configMapsError === 'undefined' &&
    configMapsIsValidating;

  const secretsIsLoading =
    typeof secretsAccess === 'undefined' &&
    typeof secretsError === 'undefined' &&
    secretsIsValidating;

  if (configMapsIsLoading || secretsIsLoading) {
    computed.canGet = undefined;
    computed.canUpdate = undefined;
    computed.canCreate = undefined;

    return computed;
  }

  if (!configMapsAccess || !secretsAccess) return computed;

  computed.canGet = configMapsAccess.get && secretsAccess.get;
  computed.canUpdate = configMapsAccess.update && secretsAccess.update;
  computed.canCreate = configMapsAccess.create && secretsAccess.create;

  return computed;
}
