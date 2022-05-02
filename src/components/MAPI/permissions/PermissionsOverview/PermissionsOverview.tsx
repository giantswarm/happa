import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'UI/Display/Tabs';

import PermissionsUseCases from '../PermissionsUseCases';
import { IPermissionsUseCase, PermissionsUseCaseStatuses } from '../types';
import { usePermissions } from '../usePermissions';
import {
  getPermissionsUseCases,
  getStatusesForUseCases,
  isGlobalUseCase,
} from '../utils';

interface IGlobalPermissionsOverviewProps {
  useCases: IPermissionsUseCase[];
}

const GlobalPermissionsOverview: React.FC<IGlobalPermissionsOverviewProps> = ({
  useCases,
}) => {
  const useCasesStatuses: Record<string, Record<string, boolean>> = {};
  useCases.forEach((useCase) => {
    useCasesStatuses[useCase.name] = { '': true };
  });

  return (
    <PermissionsUseCases
      useCases={useCases}
      useCasesStatuses={useCasesStatuses}
    />
  );
};

interface IOrganizationsPermissionsOverviewProps {
  useCases: IPermissionsUseCase[];
}

const OrganizationsPermissionsOverview: React.FC<
  IOrganizationsPermissionsOverviewProps
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
        <GlobalPermissionsOverview useCases={globalUseCases} />
      </Tab>
      <Tab title='For organizations'>
        <OrganizationsPermissionsOverview useCases={organizationsUseCases} />
      </Tab>
    </Tabs>
  );
};

export default PermissionsOverview;
