import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PermissionsUseCases from 'UI/Display/MAPI/permissions/PermissionsUseCases';
import { Tab, Tabs } from 'UI/Display/Tabs';

import { useUseCasesPermissions } from '../useUseCasesPermissions';
import {
  getPermissionsUseCases,
  getStatusesForUseCases,
  isGlobalUseCase,
} from '../utils';

const PermissionsOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = getPermissionsUseCases();
  const { data: permissions } = useUseCasesPermissions(useCases);

  const provider = window.config.info.general.provider;
  const organizations = useSelector(selectOrganizations());
  const sortedOrganizations = Object.values(organizations).sort((a, b) =>
    (a?.name || a.id).localeCompare(b?.name || b.id)
  );

  const useCasesStatuses = useMemo(() => {
    if (typeof permissions === 'undefined' || !useCases) return undefined;

    return getStatusesForUseCases(
      permissions,
      useCases,
      provider,
      sortedOrganizations
    );
  }, [permissions, useCases, provider, sortedOrganizations]);

  if (!useCases) {
    return null;
  }

  const globalUseCases = useCases.filter((useCase) => isGlobalUseCase(useCase));
  const organizationsUseCases = useCases.filter(
    (useCase) => !isGlobalUseCase(useCase)
  );

  return (
    <Tabs activeIndex={activeTab} onActive={setActiveTab}>
      <Tab title='Global'>
        <PermissionsUseCases
          useCases={globalUseCases}
          useCasesStatuses={useCasesStatuses}
        />
      </Tab>
      <Tab title='For organizations'>
        <PermissionsUseCases
          useCases={organizationsUseCases}
          useCasesStatuses={useCasesStatuses}
          organizations={sortedOrganizations}
        />
      </Tab>
    </Tabs>
  );
};

export default PermissionsOverview;
