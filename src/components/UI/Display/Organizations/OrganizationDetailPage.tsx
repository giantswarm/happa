import { Box, Text } from 'grommet';
import OrganizationDetailDelete from 'MAPI/organizations/OrganizationDetailDelete';
import PropTypes from 'prop-types';
import React from 'react';
import NotAvailable from 'UI/Display/NotAvailable';

import KubernetesVersionLabel from '../Cluster/KubernetesVersionLabel';
import OrganizationDetailStatistic from './OrganizationDetailStatistic';
import {
  IOrganizationDetailClustersSummary,
  IOrganizationDetailReleasesSummary,
} from './types';

function formatMemory(value?: number): string | undefined {
  if (typeof value === 'undefined') return undefined;

  return `${Math.round(value)} GB`;
}

function formatCPU(value?: number): number | undefined {
  if (typeof value === 'undefined') return undefined;

  return Math.round(value);
}

interface IOrganizationDetailPageProps {
  organizationName: string;
  onDelete: () => Promise<void>;
  clusterCount?: number;
  clusterCountLoading?: boolean;
  clustersSummary?: IOrganizationDetailClustersSummary;
  clustersSummaryLoading?: boolean;
  releasesSummary?: IOrganizationDetailReleasesSummary;
  releasesSummaryLoading?: boolean;
}

const OrganizationDetailPage: React.FC<IOrganizationDetailPageProps> = ({
  organizationName,
  onDelete,
  clusterCount,
  clusterCountLoading,
  clustersSummary,
  clustersSummaryLoading,
  releasesSummary,
  releasesSummaryLoading,
}) => {
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
            <Text>Memory in nodes</Text>
            <Text>Memory in worker nodes</Text>
            <Text>CPU in nodes</Text>
            <Text>CPU in worker nodes</Text>
          </Box>
          <Box direction='column' gap='xsmall'>
            <OrganizationDetailStatistic isLoading={clusterCountLoading}>
              {clusterCount}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={clustersSummaryLoading}>
              {clustersSummary?.nodesCount}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={clustersSummaryLoading}>
              {clustersSummary?.workerNodesCount}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={clustersSummaryLoading}>
              {formatMemory(clustersSummary?.nodesMemory)}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={clustersSummaryLoading}>
              {formatMemory(clustersSummary?.workerNodesMemory)}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={clustersSummaryLoading}>
              {formatCPU(clustersSummary?.nodesCPU)}
            </OrganizationDetailStatistic>
            <OrganizationDetailStatistic isLoading={clustersSummaryLoading}>
              {formatCPU(clustersSummary?.workerNodesCPU)}
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
              <OrganizationDetailStatistic isLoading={releasesSummaryLoading}>
                {releasesSummary?.oldestReleaseVersion}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic isLoading={releasesSummaryLoading}>
                <KubernetesVersionLabel
                  version={releasesSummary?.oldestReleaseK8sVersion}
                  hidePatchVersion={true}
                />
              </OrganizationDetailStatistic>
            </Box>
            <Box direction='row' gap='small'>
              <OrganizationDetailStatistic isLoading={releasesSummaryLoading}>
                {releasesSummary?.newestReleaseVersion}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic isLoading={releasesSummaryLoading}>
                <KubernetesVersionLabel
                  version={releasesSummary?.newestReleaseK8sVersion}
                  hidePatchVersion={true}
                />
              </OrganizationDetailStatistic>
            </Box>
            <OrganizationDetailStatistic isLoading={releasesSummaryLoading}>
              {releasesSummary?.releasesInUseCount}
            </OrganizationDetailStatistic>
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
  clusterCountLoading: PropTypes.bool,
  clustersSummary: PropTypes.object,
  clustersSummaryLoading: PropTypes.bool,
  releasesSummary: PropTypes.object,
  releasesSummaryLoading: PropTypes.bool,
};

export default OrganizationDetailPage;
