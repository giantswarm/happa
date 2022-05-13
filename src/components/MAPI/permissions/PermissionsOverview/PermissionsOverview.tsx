import React, { useState } from 'react';
import { Tab, Tabs } from 'UI/Display/Tabs';

import { getPermissionsUseCases, isGlobalUseCase } from '../utils';
import PermissionsOverviewGlobal from './PermissionsOverviewGlobal';
import PermissionsOverviewOrganizations from './PermissionsOverviewOrganizations';

const PermissionsOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = getPermissionsUseCases();

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
        <PermissionsOverviewGlobal useCases={globalUseCases} />
      </Tab>
      <Tab title='For organizations'>
        <PermissionsOverviewOrganizations useCases={organizationsUseCases} />
      </Tab>
    </Tabs>
  );
};

export default PermissionsOverview;
