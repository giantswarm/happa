import React, { useState } from 'react';
import { Tab, Tabs } from 'UI/Display/Tabs';

import { useUseCasesPermissions } from '../useUseCasesPermissions';
import { getPermissionsUseCases, isGlobalUseCase } from '../utils';
import PermissionsOverviewGlobal from './PermissionsOverviewGlobal';
import PermissionsOverviewOrganizations from './PermissionsOverviewOrganizations';

const PermissionsOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = getPermissionsUseCases();
  const { data: permissions } = useUseCasesPermissions(useCases);

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
        <PermissionsOverviewGlobal
          useCases={globalUseCases}
          permissions={permissions}
        />
      </Tab>
      <Tab title='For organizations'>
        <PermissionsOverviewOrganizations
          useCases={organizationsUseCases}
          permissions={permissions}
        />
      </Tab>
    </Tabs>
  );
};

export default PermissionsOverview;
