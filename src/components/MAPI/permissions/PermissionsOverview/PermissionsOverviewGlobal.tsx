import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { getLoggedInUser } from 'model/stores/main/selectors';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import PermissionsUseCases from 'UI/Display/MAPI/permissions/PermissionsUseCases';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { IPermissionMap, IPermissionsUseCase } from '../types';
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
  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();
  const user = useSelector(getLoggedInUser);

  const { data: permissionsAtClusterScope } = useSWR<
    IPermissionMap,
    GenericResponseError
  >(fetchPermissionsAtClusterScopeKey(user?.email, user?.groups), () =>
    fetchPermissionsAtClusterScope(
      clientFactory,
      auth,
      user?.email,
      user?.groups
    )
  );

  const useCasesStatuses = useMemo(() => {
    if (typeof permissionsAtClusterScope === 'undefined') return undefined;

    return getStatusesForUseCases(permissionsAtClusterScope, useCases);
  }, [permissionsAtClusterScope, useCases]);

  return (
    <PermissionsUseCases
      useCases={useCases}
      useCasesStatuses={useCasesStatuses}
    />
  );
};

export default PermissionsOverviewGlobal;
