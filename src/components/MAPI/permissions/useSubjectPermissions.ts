import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { selectOrganizations } from 'model/stores/organization/selectors';
import { IState } from 'model/stores/state';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { IPermissionMap, IPermissionsSubject } from './types';
import {
  fetchPermissionsForSubject,
  fetchPermissionsForSubjectKey,
} from './utils';

export function useSubjectPermissions(subject?: IPermissionsSubject) {
  const httpClientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const organizations = useSelector((state: IState) =>
    Object.values(selectOrganizations()(state))
  );

  const key = subject ? fetchPermissionsForSubjectKey(subject) : null;

  const { data, error, isValidating } = useSWR<
    IPermissionMap,
    GenericResponseError
  >(key, () =>
    fetchPermissionsForSubject(httpClientFactory, auth, organizations, subject!)
  );

  const isLoading =
    typeof data === 'undefined' && typeof error === 'undefined' && isValidating;

  useEffect(() => {
    if (error) {
      const message = extractErrorMessage(error);

      new FlashMessage(
        `Something went wrong while trying to compute RBAC permissions for the subject.`,
        messageType.ERROR,
        messageTTL.LONG,
        message
      );
    }
  }, [error]);

  return { data, error, isLoading };
}
