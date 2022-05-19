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

import { SubjectType } from './SubjectForm';
import { IPermissionMap, IPermissionsUseCase } from './types';
import { usePermissions } from './usePermissions';
import { useSubjectPermissions } from './useSubjectPermissions';
import {
  fetchPermissionsAtClusterScope,
  fetchPermissionsAtClusterScopeKey,
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
  useCases: IPermissionsUseCase[] | null,
  subjectName: string = '',
  subjectType: SubjectType = SubjectType.Myself
): {
  data: IPermissionMap | undefined;
  error: GenericResponseError | undefined;
  isLoading: boolean;
} {
  const currentSubject = useMemo(() => {
    if (subjectName === '') return undefined;

    switch (subjectType) {
      case SubjectType.User:
        return { user: subjectName };
      case SubjectType.Group:
        return { groups: [subjectName] };
      default:
        return undefined;
    }
  }, [subjectName, subjectType]);

  const {
    data: ownPermissions,
    error: ownPermissionsError,
    isLoading: ownPermissionsIsLoading,
  } = usePermissions();
  const {
    data: subjectPermissions,
    error: subjectPermissionsError,
    isLoading: subjectPermissionsIsLoading,
  } = useSubjectPermissions(currentSubject);
  const namespacePermissions =
    subjectType === SubjectType.Myself ? ownPermissions : subjectPermissions;

  const loggedInUser = useSelector(getLoggedInUser);
  const impersonation = useSelector(
    (state: IState) => state.main.impersonation
  );

  const currentUser = useMemo(() => {
    if (subjectType === SubjectType.Myself) {
      return (
        impersonation || {
          user: loggedInUser?.email,
          groups: loggedInUser?.groups,
        }
      );
    }

    return currentSubject;
  }, [currentSubject, impersonation, loggedInUser, subjectType]);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const clusterScopeUseCases = useCases?.filter((useCase) =>
    isClusterScopeUseCase(useCase)
  );
  const permissionsAtClusterScopeKey =
    namespacePermissions && clusterScopeUseCases
      ? fetchPermissionsAtClusterScopeKey(
          currentUser?.user,
          currentUser?.groups
        )
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
        currentUser?.user,
        currentUser?.groups
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

  const error =
    ownPermissionsError ||
    subjectPermissionsError ||
    permissionsAtClusterScopeError;
  const isLoading =
    ownPermissionsIsLoading ||
    subjectPermissionsIsLoading ||
    permissionsAtClusterScopeIsLoading;

  const combinedPermissions = useMemo(() => {
    if (!permissionsAtClusterScope || !namespacePermissions) return undefined;

    return getCombinedPermissions(
      permissionsAtClusterScope,
      namespacePermissions
    );
  }, [namespacePermissions, permissionsAtClusterScope]);

  return { data: combinedPermissions, error, isLoading };
}
