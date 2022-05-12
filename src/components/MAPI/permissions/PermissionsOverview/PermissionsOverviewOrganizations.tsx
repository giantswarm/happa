import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import PermissionsUseCases from '../../../UI/Display/MAPI/permissions/PermissionsUseCases';
import { IPermissionMap, IPermissionsUseCase } from '../types';
import { getStatusesForUseCases } from '../utils';

interface IPermissionsOverviewOrganizationsProps {
  useCases: IPermissionsUseCase[];
  permissions?: IPermissionMap;
}

const PermissionsOverviewOrganizations: React.FC<
  IPermissionsOverviewOrganizationsProps
> = ({ useCases, permissions }) => {
  const provider = window.config.info.general.provider;
  const organizations = useSelector(selectOrganizations());
  const sortedOrganizations = Object.values(organizations).sort((a, b) =>
    (a?.name || a.id).localeCompare(b?.name || b.id)
  );

  const useCasesStatuses = useMemo(() => {
    if (typeof permissions === 'undefined') return undefined;

    return getStatusesForUseCases(
      permissions,
      useCases,
      provider,
      sortedOrganizations
    );
  }, [permissions, useCases, provider, sortedOrganizations]);

  return (
    <PermissionsUseCases
      useCases={useCases}
      useCasesStatuses={useCasesStatuses}
      organizations={sortedOrganizations}
    />
  );
};

export default PermissionsOverviewOrganizations;
