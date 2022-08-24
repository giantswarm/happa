import DocumentTitle from 'components/shared/DocumentTitle';
import { Box, Heading, Text } from 'grommet';
import { AccountSettingsRoutes } from 'model/constants/routes';
import React, { useState } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import styled from 'styled-components';

import PermissionsOverview from './PermissionsOverview';
import PermissionsPreloader from './PermissionsPreloader';
import SubjectForm from './SubjectForm';
import { SubjectTypes } from './types';
import { useUseCasesPermissions } from './useUseCasesPermissions';
import { hasAccessToInspectPermissions } from './utils';

const IntroText = styled(Text)`
  abbr {
    text-decoration: none;
  }
`;

interface IPermissionsProps {}

const Permissions: React.FC<IPermissionsProps> = () => {
  const { data: ownPermissions } = useUseCasesPermissions();

  const canInspectPermissions = ownPermissions
    ? hasAccessToInspectPermissions(ownPermissions)
    : false;

  const [subjectType, setSubjectType] = useState<SubjectTypes>(
    SubjectTypes.Myself
  );
  const [subjectGroupName, setSubjectGroupName] = useState('');
  const [subjectUserName, setSubjectUserName] = useState('');
  const [subjectServiceAccountName, setSubjectServiceAccountName] =
    useState('');

  const handleSubjectFormSubmit = function (value: string) {
    if (subjectType === SubjectTypes.Group) {
      setSubjectGroupName(value);
    } else if (subjectType === SubjectTypes.User) {
      setSubjectUserName(value);
    } else if (subjectType === SubjectTypes.ServiceAccount) {
      setSubjectServiceAccountName(value);
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
          <IntroText>
            Here you can check which{' '}
            <abbr title='role based access control'>RBAC</abbr> permissions you
            have in the management cluster, with regard to certain use cases. As
            an admin, you can also inspect other users&apos; and groups&apos;
            permissions.
          </IntroText>
        </Box>
        {ownPermissions ? (
          <>
            {canInspectPermissions && (
              <SubjectForm
                subjectType={subjectType}
                groupName={subjectGroupName}
                userName={subjectUserName}
                serviceAccountName={subjectServiceAccountName}
                onSubjectTypeChange={setSubjectType}
                onSubmit={handleSubjectFormSubmit}
              />
            )}
            <PermissionsOverview
              key={subjectType}
              subjectType={subjectType}
              subjectName={
                subjectType === SubjectTypes.Group
                  ? subjectGroupName
                  : subjectType === SubjectTypes.User
                  ? subjectUserName
                  : subjectType === SubjectTypes.ServiceAccount
                  ? subjectServiceAccountName
                  : ''
              }
            />
          </>
        ) : (
          <PermissionsPreloader />
        )}
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default Permissions;
