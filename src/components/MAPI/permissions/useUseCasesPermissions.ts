import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { extractErrorMessage } from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { IState } from 'model/stores/state';
import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { IPermissionsSubject, SubjectTypes } from './types';
import { IPermissionMap } from './types';
import { usePermissions } from './usePermissions';
import { useSubjectPermissions } from './useSubjectPermissions';
import {
  fetchPermissionsAtClusterScope,
  fetchPermissionsAtClusterScopeKey,
  getPermissionsUseCases,
  isClusterScopeUseCase,
  optimizeNamespacePermissions,
} from './utils';

function getCombinedPermissions(
  clusterScopePermissions: IPermissionMap,
  namespacePermissions: IPermissionMap
): IPermissionMap {
  for (const [namespace, permissions] of Object.entries(namespacePermissions)) {
    namespacePermissions[namespace] = optimizeNamespacePermissions({
      ...permissions,
      ...clusterScopePermissions[''],
    });
  }

  return { ...namespacePermissions, ...clusterScopePermissions };
}

export function useUseCasesPermissions(
  subjectName: string = '',
  subjectType: SubjectTypes = SubjectTypes.Myself
): {
  data: IPermissionMap | undefined;
  error: GenericResponseError | undefined;
  isLoading: boolean;
} {
  const loggedInUser = useSelector(getLoggedInUser);
  const impersonation = useSelector(
    (state: IState) => state.main.impersonation
  );

  const currentSubject: IPermissionsSubject | undefined = useMemo(() => {
    if (subjectName === '' && subjectType !== SubjectTypes.Myself)
      return undefined;

    switch (subjectType) {
      case SubjectTypes.Myself:
        return (
          impersonation || {
            user: loggedInUser?.email,
            groups: loggedInUser?.groups,
          }
        );
      case SubjectTypes.User:
        return { user: subjectName };
      case SubjectTypes.Group:
        return { groups: [subjectName] };
      case SubjectTypes.ServiceAccount:
        return { serviceAccount: subjectName };
      default:
        return undefined;
    }
  }, [impersonation, loggedInUser, subjectName, subjectType]);

  const useNamespacePermissions =
    subjectType === SubjectTypes.Myself
      ? usePermissions
      : useSubjectPermissions;
  const {
    data: namespacePermissions,
    error: namespacePermissionsError,
    isLoading: namespacePermissionsIsLoading,
  } = useNamespacePermissions(currentSubject);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const provider = window.config.info.general.provider;
  const useCases = useMemo(() => getPermissionsUseCases(provider), [provider]);

  const clusterScopeUseCases = useCases?.filter((useCase) =>
    isClusterScopeUseCase(useCase)
  );
  const permissionsAtClusterScopeKey =
    namespacePermissions && clusterScopeUseCases && currentSubject
      ? fetchPermissionsAtClusterScopeKey(currentSubject)
      : null;
  const {
    data: permissionsAtClusterScope,
    error: permissionsAtClusterScopeError,
    isValidating: permissionsAtClusterScopeIsValidating,
  } = useSWR<IPermissionMap, GenericResponseError>(
    permissionsAtClusterScopeKey,
    () =>
      fetchPermissionsAtClusterScope(
        clientFactory,
        auth,
        clusterScopeUseCases!,
        namespacePermissions!,
        currentSubject!
      )
  );

  useEffect(() => {
    if (permissionsAtClusterScopeError) {
      new FlashMessage(
        `Something went wrong while trying to compute your user's RBAC permissions at the cluster scope.`,
        messageType.ERROR,
        messageTTL.LONG,
        extractErrorMessage(permissionsAtClusterScopeError)
      );

      ErrorReporter.getInstance().notify(permissionsAtClusterScopeError);
    }
  }, [permissionsAtClusterScopeError]);

  const permissionsAtClusterScopeIsLoading =
    typeof permissionsAtClusterScope === 'undefined' &&
    typeof permissionsAtClusterScopeError === 'undefined' &&
    permissionsAtClusterScopeIsValidating;

  const error = namespacePermissionsError || permissionsAtClusterScopeError;
  const isLoading =
    namespacePermissionsIsLoading || permissionsAtClusterScopeIsLoading;

  const combinedPermissions = useMemo(() => {
    if (!permissionsAtClusterScope || !namespacePermissions) return undefined;

    return getCombinedPermissions(
      permissionsAtClusterScope,
      namespacePermissions
    );
  }, [namespacePermissions, permissionsAtClusterScope]);

  return { data: combinedPermissions, error, isLoading };
}
