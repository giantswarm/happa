import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Tab, Tabs } from 'UI/Display/Tabs';
import { cartesian } from 'utils/helpers';

import PermissionsUseCases from '../PermissionsUseCases';
import { IPermissionsUseCase } from '../types';
import { usePermissions } from '../usePermissions';
import { getPermissionsUseCases, hasPermission } from '../utils';

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

  const useCasesStatuses: Record<
    string,
    Record<string, boolean>
  > = useMemo(() => {
    if (typeof permissions === 'undefined') {
      return {};
    }

    const statuses: Record<string, Record<string, boolean>> = {};
    useCases.forEach((useCase) => {
      const useCasePermissions = useCase.permissions.flatMap((permission) =>
        cartesian(permission.verbs, permission.resources, permission.apiGroups)
      );

      statuses[useCase.name] = {};
      sortedOrganizations.forEach((org) => {
        const permissionsValues = useCasePermissions.map((p) => {
          const [verb, resource, apiGroup] = p as string[];

          return hasPermission(
            permissions,
            org.namespace ?? '',
            verb,
            apiGroup,
            resource
          );
        });

        statuses[useCase.name][org.id] = permissionsValues.every(
          (v) => v === true
        );
      });
    });

    return statuses;
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

const isGlobal = (useCase: IPermissionsUseCase) =>
  (useCase.scope.namespaces && useCase.scope.namespaces[0] === 'default') ||
  useCase.scope.cluster;

const PermissionsOverview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = getPermissionsUseCases();

  if (!useCases) {
    return null;
  }

  const globalUseCases = useCases.filter((useCase) => isGlobal(useCase));
  const organizationsUseCases = useCases.filter(
    (useCase) => !isGlobal(useCase)
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
