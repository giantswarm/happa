import { Box, Heading } from 'grommet';
import RoutePath from 'lib/routePath';
import AccessControlPage from 'MAPI/organizations/AccessControl';
import React, { useMemo } from 'react';
import { Tab } from 'react-bootstrap';
import { useParams } from 'react-router';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Tabs from 'shared/Tabs';
import OrganizationDetailPage from 'UI/Display/Organizations/OrganizationDetailPage';

function computePaths(orgName: string) {
  return {
    Detail: RoutePath.createUsablePath(OrganizationsRoutes.Detail, {
      orgId: orgName,
    }),
    AccessControl: RoutePath.createUsablePath(
      OrganizationsRoutes.AccessControl,
      {
        orgId: orgName,
      }
    ),
  };
}

interface IOrganizationDetailProps {}

const OrganizationDetail: React.FC<IOrganizationDetailProps> = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const paths = useMemo(() => computePaths(orgId), [orgId]);

  return (
    <Box>
      <Heading level={1} margin={{ bottom: 'large' }}>
        Organization: {orgId}
      </Heading>
      <Tabs defaultActiveKey={paths.Detail} useRoutes={true}>
        <Tab eventKey={paths.Detail} title='General'>
          <OrganizationDetailPage />
        </Tab>
        <Tab eventKey={paths.AccessControl} title='Access control'>
          <AccessControlPage organizationName={orgId} />
        </Tab>
      </Tabs>
    </Box>
  );
};

OrganizationDetail.propTypes = {};

export default OrganizationDetail;
