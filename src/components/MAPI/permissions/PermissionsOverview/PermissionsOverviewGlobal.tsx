import React from 'react';
import PermissionsUseCases from 'UI/Display/MAPI/permissions/PermissionsUseCases';

import { IPermissionsUseCase } from '../types';

interface IPermissionsOverviewGlobalProps {
  useCases: IPermissionsUseCase[];
}

const PermissionsOverviewGlobal: React.FC<IPermissionsOverviewGlobalProps> = ({
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

export default PermissionsOverviewGlobal;
