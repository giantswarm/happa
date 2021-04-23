import { Box, Text } from 'grommet';
import OrganizationDetailDelete from 'MAPI/organizations/OrganizationDetailDelete';
import PropTypes from 'prop-types';
import React from 'react';
import NotAvailable from 'UI/Display/NotAvailable';

import KubernetesVersionLabel from '../Cluster/KubernetesVersionLabel';
import OrganizationDetailStatistic from './OrganizationDetailStatistic';
import { IOrganizationDetailClustersSummary } from './types';

interface IOrganizationDetailPageProps {
  organizationName: string;
  onDelete: () => Promise<void>;
  clusterCount?: number;
  clustersSummary?: IOrganizationDetailClustersSummary;
}

const OrganizationDetailPage: React.FC<IOrganizationDetailPageProps> = ({
  organizationName,
  onDelete,
  clusterCount,
  clustersSummary,
}) => {
  const isLoadingSummary = !clustersSummary;

  return (
    <Box direction='column' gap='large'>
      <Box direction='row' gap='large'>
        <Box width='small'>
          <Text weight='bold' size='large' margin='none'>
            Clusters summary
          </Text>
        </Box>
        <Box direction='row' gap='small'>
          <Box width='medium' direction='column' gap='xsmall'>
            <Text>Workload clusters</Text>
            <Text>Nodes</Text>
            <Text>Worker nodes</Text>
            <Text>Memory in worker nodes</Text>
            <Text>CPU in worker nodes</Text>
          </Box>
          <Box direction='column' gap='xsmall'>
            <OrganizationDetailStatistic>
              {clusterCount}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={isLoadingSummary}>
              {clustersSummary?.nodesCount}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={isLoadingSummary}>
              {clustersSummary?.workerNodesCount}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={isLoadingSummary}>
              {clustersSummary?.workerNodesMemory}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={isLoadingSummary}>
              {clustersSummary?.workerNodesCPU}
            </OrganizationDetailStatistic>
          </Box>
        </Box>
      </Box>
      <Box direction='row' gap='large'>
        <Box width='small'>
          <Text weight='bold' size='large' margin='none'>
            Releases
          </Text>
        </Box>
        <Box direction='row' gap='small'>
          <Box width='medium' direction='column' gap='xsmall'>
            <Text>Oldest release</Text>
            <Text>Newest release</Text>
            <Text>Releases in use</Text>
          </Box>
          <Box direction='column' gap='xsmall'>
            <Box direction='row' gap='small'>
              <Text>
                <NotAvailable />
              </Text>
              <KubernetesVersionLabel hidePatchVersion={true} />
            </Box>
            <Box direction='row' gap='small'>
              <Text>
                <NotAvailable />
              </Text>
              <KubernetesVersionLabel hidePatchVersion={true} />
            </Box>
            <Text>
              <NotAvailable />
            </Text>
          </Box>
        </Box>
      </Box>
      <Box direction='row' gap='large'>
        <Box width='small'>
          <Text weight='bold' size='large' margin='none'>
            Apps summary
          </Text>
        </Box>
        <Box direction='row' gap='small'>
          <Box width='medium' direction='column' gap='xsmall'>
            <Text>Apps in use</Text>
            <Text>App deployments</Text>
          </Box>
          <Box direction='column' gap='xsmall'>
            <Text>
              <NotAvailable />
            </Text>
            <Text>
              <NotAvailable />
            </Text>
          </Box>
        </Box>
      </Box>
      <Box direction='row' pad={{ top: 'medium' }} border='top'>
        <Box direction='column' gap='medium'>
          <Text weight='bold' size='large' margin='none'>
            Delete this organization
          </Text>
          <Box width='large'>
            <Text>
              This organization’s namespace with all resources in it and the
              Organization CR will be deleted from the Management API. There is
              no way to undo this action.
            </Text>
          </Box>
          <Box>
            <OrganizationDetailDelete
              organizationName={organizationName}
              onDelete={onDelete}
              clusterCount={clusterCount}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

OrganizationDetailPage.propTypes = {
  organizationName: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  clusterCount: PropTypes.number,
  clustersSummary: PropTypes.object,
};

export default OrganizationDetailPage;
