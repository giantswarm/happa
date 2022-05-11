import DocumentTitle from 'components/shared/DocumentTitle';
import { Box, Heading, Text } from 'grommet';
import { AccountSettingsRoutes } from 'model/constants/routes';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import styled from 'styled-components';

import PermissionsOverview from './PermissionsOverview';

const HeadingWrapper = styled(Box)`
  max-width: 900px;
`;

interface IPermissionsProps {}

const Permissions: React.FC<IPermissionsProps> = () => {
  return (
    <Breadcrumb
      data={{
        title: 'PERMISSIONS',
        pathname: AccountSettingsRoutes.Permissions,
      }}
    >
      <DocumentTitle title='Permissions'>
        <HeadingWrapper
          margin={{ bottom: 'large' }}
          gap='medium'
          direction='column'
        >
          <Heading level={1} margin='none'>
            Inspect permissions
          </Heading>
          <Text>
            Here you get an overview of your RBAC permissions in the management
            cluster, with regard to certain use cases. Note that this is not a
            complete overview of all permissions and restrictions.
          </Text>
        </HeadingWrapper>
        <PermissionsOverview />
      </DocumentTitle>
    </Breadcrumb>
  );
};

export default Permissions;
