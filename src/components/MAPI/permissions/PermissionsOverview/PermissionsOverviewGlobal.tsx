import React, { useMemo } from 'react';
import PermissionsUseCases from 'UI/Display/MAPI/permissions/PermissionsUseCases';

import { IPermissionMap, IPermissionsUseCase } from '../types';
import { getStatusesForUseCases } from '../utils';

interface IPermissionsOverviewGlobalProps {
  useCases: IPermissionsUseCase[];
  permissions?: IPermissionMap;
}

const PermissionsOverviewGlobal: React.FC<IPermissionsOverviewGlobalProps> = ({
  useCases,
  permissions,
}) => {
  const provider = window.config.info.general.provider;

  const useCasesStatuses = useMemo(() => {
    if (!permissions) return undefined;

    return getStatusesForUseCases(permissions, useCases, provider);
  }, [permissions, provider, useCases]);

  return (
    <PermissionsUseCases
      useCases={useCases}
      useCasesStatuses={useCasesStatuses}
    />
  );
};

export default PermissionsOverviewGlobal;
