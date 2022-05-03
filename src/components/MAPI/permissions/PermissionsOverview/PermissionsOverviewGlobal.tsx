import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { getLoggedInUser } from 'model/stores/main/selectors';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import PermissionsUseCases from 'UI/Display/MAPI/permissions/PermissionsUseCases';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { IPermissionMap, IPermissionsUseCase } from '../types';
import { usePermissions } from '../usePermissions';
import {
  fetchPermissionsAtClusterScope,
  fetchPermissionsAtClusterScopeKey,
  getStatusesForUseCases,
} from '../utils';

interface IPermissionsOverviewGlobalProps {
  useCases: IPermissionsUseCase[];
}

const PermissionsOverviewGlobal: React.FC<IPermissionsOverviewGlobalProps> = ({
  useCases,
}) => {
  const provider = window.config.info.general.provider;
  const { data: permissions } = usePermissions();
  const user = useSelector(getLoggedInUser);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const permissionsAtClusterScopeKey = permissions
    ? fetchPermissionsAtClusterScopeKey(user?.email, user?.groups)
    : null;

  const { data: permissionsAtClusterScope } = useSWR<
    IPermissionMap,
    GenericResponseError
  >(permissionsAtClusterScopeKey, () =>
    fetchPermissionsAtClusterScope(
      clientFactory,
      auth,
      useCases,
      permissions!,
      user?.email,
      user?.groups
    )
  );

  const useCasesStatuses = useMemo(() => {
    if (!permissionsAtClusterScope) return undefined;

    return getStatusesForUseCases(
      permissionsAtClusterScope,
      useCases,
      provider
    );
  }, [permissionsAtClusterScope, provider, useCases]);

  return (
    <PermissionsUseCases
      useCases={useCases}
      useCasesStatuses={useCasesStatuses}
    />
  );
};

export default PermissionsOverviewGlobal;
