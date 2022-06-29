import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PermissionsUseCases from 'UI/Display/MAPI/permissions/PermissionsUseCases';
import { Tab, Tabs } from 'UI/Display/Tabs';

import InspectPermissionsGuide from '../guides/InspectPermissionsGuide';
import { SubjectTypes } from '../types';
import { useUseCasesPermissions } from '../useUseCasesPermissions';
import {
  appAccessUseCase,
  getPermissionsUseCases,
  getStatusesForUseCases,
  getStatusForAppAccessUseCase,
  isGlobalUseCase,
} from '../utils';

export interface IPermissionsOverviewProps {
  subjectType?: SubjectTypes;
  subjectName?: string;
}

const PermissionsOverview: React.FC<IPermissionsOverviewProps> = ({
  subjectType,
  subjectName,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  const useCases = getPermissionsUseCases();
  const { data: permissions } = useUseCasesPermissions(
    useCases,
    subjectName,
    subjectType
  );

  const provider = window.config.info.general.provider;
  const organizations = useSelector(selectOrganizations());
  const sortedOrganizations = Object.values(organizations).sort((a, b) =>
    (a?.name || a.id).localeCompare(b?.name || b.id)
  );

  const shouldDisplayAppAccessUseCase =
    subjectType === SubjectTypes.User || subjectType === SubjectTypes.Group;

  const useCasesStatuses = useMemo(() => {
    if (typeof permissions === 'undefined' || !useCases) return undefined;

    let statuses = getStatusesForUseCases(
      permissions,
      useCases,
      provider,
      sortedOrganizations
    );

    if (shouldDisplayAppAccessUseCase) {
      const appAccessStatus = getStatusForAppAccessUseCase(
        permissions,
        sortedOrganizations
      );
      statuses = { ...statuses, ...appAccessStatus };
    }

    return statuses;
  }, [
    permissions,
    useCases,
    provider,
    sortedOrganizations,
    shouldDisplayAppAccessUseCase,
  ]);

  const [globalActiveIndexes, setGlobalActiveIndexes] = useState<number[]>([]);
  const [organizationsActiveIndexes, setOrganizationsActiveIndexes] = useState<
    number[]
  >([]);

  const globalUseCases = useMemo(() => {
    if (!useCases) return [];

    const filteredUseCases = useCases.filter((useCase) =>
      isGlobalUseCase(useCase)
    );

    if (shouldDisplayAppAccessUseCase) {
      filteredUseCases.push(appAccessUseCase);
    }

    return filteredUseCases;
  }, [useCases, shouldDisplayAppAccessUseCase]);

  const organizationsUseCases = useMemo(() => {
    if (!useCases) return [];

    return useCases.filter((useCase) => !isGlobalUseCase(useCase));
  }, [useCases]);

  const shouldDisplayUseCaseStatuses =
    useCases !== null &&
    (subjectType === SubjectTypes.Myself || subjectName !== '');

  return (
    <>
      {shouldDisplayUseCaseStatuses ? (
        <Tabs activeIndex={activeTab} onActive={setActiveTab}>
          <Tab title='Global'>
            <PermissionsUseCases
              useCases={globalUseCases}
              useCasesStatuses={useCasesStatuses}
              activeIndexes={globalActiveIndexes}
              onActive={setGlobalActiveIndexes}
            />
          </Tab>
          <Tab title='For organizations'>
            <PermissionsUseCases
              useCases={organizationsUseCases}
              useCasesStatuses={useCasesStatuses}
              organizations={sortedOrganizations}
              activeIndexes={organizationsActiveIndexes}
              onActive={setOrganizationsActiveIndexes}
            />
          </Tab>
        </Tabs>
      ) : null}
      <InspectPermissionsGuide
        forOrganizations={activeTab === 1}
        subjectType={subjectType}
        subjectName={subjectName}
        animation={{ type: 'fadeIn', duration: 300 }}
      />
    </>
  );
};

export default PermissionsOverview;
