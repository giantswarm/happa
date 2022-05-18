import DocumentTitle from 'components/shared/DocumentTitle';
import { Box, Heading, Text } from 'grommet';
import { AccountSettingsRoutes } from 'model/constants/routes';
import React, { useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';

import PermissionsOverview from './PermissionsOverview';
import SubjectForm, { SubjectType } from './SubjectForm';
import { useUseCasesPermissions } from './useUseCasesPermissions';
import { getPermissionsUseCases, hasAccessToInspectPermissions } from './utils';

interface IPermissionsProps {}

const Permissions: React.FC<IPermissionsProps> = () => {
  const useCases = getPermissionsUseCases();
  const { data: ownPermissions } = useUseCasesPermissions(useCases);

  const canInspectPermissions = ownPermissions
    ? hasAccessToInspectPermissions(ownPermissions)
    : false;

  const [subjectType, setSubjectType] = useState(SubjectType.Myself);
  const [subjectGroupName, setSubjectGroupName] = useState('');
  const [subjectUserName, setSubjectUserName] = useState('');

  const handleSubjectFormSubmit = function (value: string) {
    if (subjectType === SubjectType.Group) {
      setSubjectGroupName(value);
    } else if (subjectType === SubjectType.User) {
      setSubjectUserName(value);
    }
  };

  return (
    <Breadcrumb
      data={{
        title: 'PERMISSIONS',
        pathname: AccountSettingsRoutes.Permissions,
      }}
    >
      <DocumentTitle title='Permissions'>
        <Box
          width={{ max: '900px' }}
          margin={{ bottom: 'large' }}
          gap='medium'
          direction='column'
        >
          <Heading level={1} margin='none'>
            Inspect permissions
          </Heading>
          <Text>
            Here you get an overview of your
            {canInspectPermissions ? (
              <span> own, a group&apos;s or a user&apos;s </span>
            ) : (
              ' '
            )}
            RBAC permissions in the management cluster, with regard to certain
            use cases. Note that this is not a complete overview of all
            permissions and restrictions.
          </Text>
        </Box>
        {canInspectPermissions && (
          <SubjectForm
            subjectType={subjectType}
            groupName={subjectGroupName}
            userName={subjectUserName}
            onSubjectTypeChange={setSubjectType}
            onSubmit={handleSubjectFormSubmit}
          />
        )}
        <PermissionsOverview
          key={subjectType}
          subjectType={subjectType}
          subjectName={
            subjectType === SubjectType.Group
              ? subjectGroupName
              : subjectType === SubjectType.User
              ? subjectUserName
              : ''
          }
        />
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default Permissions;
