import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import PermissionsUseCases from '../../../UI/Display/MAPI/permissions/PermissionsUseCases';
import { IPermissionsUseCase, PermissionsUseCaseStatuses } from '../types';
import { usePermissions } from '../usePermissions';
import { getStatusesForUseCases } from '../utils';

interface IPermissionsOverviewOrganizationsProps {
  useCases: IPermissionsUseCase[];
}

const PermissionsOverviewOrganizations: React.FC<
  IPermissionsOverviewOrganizationsProps
> = ({ useCases }) => {
  const { data: permissions } = usePermissions();
  const organizations = useSelector(selectOrganizations());
  const sortedOrganizations = Object.values(organizations).sort((a, b) =>
    (a?.name || a.id).localeCompare(b?.name || b.id)
  );

  const useCasesStatuses: PermissionsUseCaseStatuses = useMemo(() => {
    if (typeof permissions === 'undefined') return {};

    return getStatusesForUseCases(permissions, useCases, sortedOrganizations);
  }, [permissions, useCases, sortedOrganizations]);

  if (typeof permissions === 'undefined') {
    return null;
  }

  return (
    <PermissionsUseCases
      useCases={useCases}
      useCasesStatuses={useCasesStatuses}
      organizations={sortedOrganizations}
    />
  );
};

export default PermissionsOverviewOrganizations;
