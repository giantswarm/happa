import { Box, Text } from 'grommet';
import OrganizationDetailDelete from 'MAPI/organizations/OrganizationDetailDelete';
import React from 'react';
import Truncated from 'UI/Util/Truncated';
import { getK8sVersionEOLDate } from 'utils/config';
import { getHumanReadableMemory } from 'utils/helpers';

import KubernetesVersionLabel from '../Cluster/KubernetesVersionLabel';
import OrganizationDetailStatistic from './OrganizationDetailStatistic';
import {
  IOrganizationDetailClustersSummary,
  IOrganizationDetailReleasesSummary,
  IOrganizationDetailVersionsSummary,
} from './types';

function formatMemory(value?: number): string | undefined {
  if (typeof value === 'undefined') return undefined;
  const formattedMemory = getHumanReadableMemory(value);

  return `${formattedMemory.value} ${formattedMemory.unit}`;
}

function formatCPU(value?: number): number | undefined {
  if (typeof value === 'undefined') return undefined;

  return Math.round(value);
}

function formatClusterAppVersionsInfo(
  versionsSummary: IOrganizationDetailVersionsSummary
): React.ReactNode {
  const {
    oldestClusterAppVersion,
    newestClusterAppVersion,
    clusterAppVersionsInUseCount,
  } = versionsSummary;

  if (
    typeof oldestClusterAppVersion === 'undefined' ||
    typeof newestClusterAppVersion === 'undefined' ||
    typeof clusterAppVersionsInUseCount === 'undefined'
  ) {
    return undefined;
  }

  switch (clusterAppVersionsInUseCount) {
    case 0:
      return undefined;
    case 1:
      return (
        <Truncated numStart={8} numEnd={3}>
          {newestClusterAppVersion}
        </Truncated>
      );
    case 2:
      return (
        <>
          <Truncated numStart={8} numEnd={3}>
            {oldestClusterAppVersion}
          </Truncated>
          ,{' '}
          <Truncated numStart={8} numEnd={3}>
            {newestClusterAppVersion}
          </Truncated>
        </>
      );
    default:
      return (
        <>
          {clusterAppVersionsInUseCount} versions in use, oldest{' '}
          <Truncated numStart={8} numEnd={3}>
            {oldestClusterAppVersion}
          </Truncated>
          , newest{' '}
          <Truncated numStart={8} numEnd={3}>
            {newestClusterAppVersion}
          </Truncated>
        </>
      );
  }
}

function formatK8sVersionsInfo(
  versionsSummary: IOrganizationDetailVersionsSummary
): React.ReactNode {
  const { oldestK8sVersion, newestK8sVersion, k8sVersionsInUseCount } =
    versionsSummary;

  if (
    typeof oldestK8sVersion === 'undefined' ||
    typeof newestK8sVersion === 'undefined' ||
    typeof k8sVersionsInUseCount === 'undefined'
  ) {
    return undefined;
  }

  const oldestReleaseK8sVersionEOLDate =
    getK8sVersionEOLDate(oldestK8sVersion) ?? undefined;
  const newestReleaseK8sVersionEOLDate =
    getK8sVersionEOLDate(newestK8sVersion) ?? undefined;

  switch (k8sVersionsInUseCount) {
    case 0:
      return undefined;
    case 1:
      return (
        <KubernetesVersionLabel
          version={newestK8sVersion}
          eolDate={newestReleaseK8sVersionEOLDate}
          hidePatchVersion={true}
          hideIcon={true}
        />
      );
    case 2:
      return (
        <>
          <KubernetesVersionLabel
            version={oldestK8sVersion}
            eolDate={oldestReleaseK8sVersionEOLDate}
            hidePatchVersion={true}
            hideIcon={true}
          />
          ,{' '}
          <KubernetesVersionLabel
            version={newestK8sVersion}
            eolDate={newestReleaseK8sVersionEOLDate}
            hidePatchVersion={true}
            hideIcon={true}
          />
        </>
      );
    default:
      return (
        <>
          {k8sVersionsInUseCount} versions in use, oldest{' '}
          <KubernetesVersionLabel
            version={oldestK8sVersion}
            eolDate={oldestReleaseK8sVersionEOLDate}
            hidePatchVersion={true}
            hideIcon={true}
          />
          , newest{' '}
          <KubernetesVersionLabel
            version={newestK8sVersion}
            eolDate={newestReleaseK8sVersionEOLDate}
            hidePatchVersion={true}
            hideIcon={true}
          />
        </>
      );
  }
}

interface IOrganizationDetailPageProps {
  organizationName: string;
  organizationNamespace: string;
  onDelete: () => Promise<void>;
  canDeleteOrganizations?: boolean;
  readOnly?: boolean;
  clusterCount?: number;
  clusterCountLoading?: boolean;
  clustersSummary?: IOrganizationDetailClustersSummary;
  clustersSummaryLoading?: boolean;
  releasesSummary?: IOrganizationDetailReleasesSummary;
  releasesSummaryLoading?: boolean;
  isReleasesSupported?: boolean;
  versionsSummary?: IOrganizationDetailVersionsSummary;
  versionsSummaryLoading?: boolean;
  hasClusterApp?: boolean;
  hasImportedClusters?: boolean;
}

const OrganizationDetailPage: React.FC<
  React.PropsWithChildren<IOrganizationDetailPageProps>
> = ({
  organizationName,
  organizationNamespace,
  onDelete,
  canDeleteOrganizations,
  readOnly,
  clusterCount,
  clusterCountLoading,
  clustersSummary,
  clustersSummaryLoading,
  releasesSummary,
  releasesSummaryLoading,
  isReleasesSupported,
  versionsSummary,
  versionsSummaryLoading,
  hasClusterApp,
  hasImportedClusters,
}) => {
  const { oldestReleaseK8sVersion, newestReleaseK8sVersion } =
    releasesSummary ?? {};
  const oldestReleaseK8sVersionEOLDate = oldestReleaseK8sVersion
    ? getK8sVersionEOLDate(oldestReleaseK8sVersion) ?? undefined
    : undefined;
  const newestReleaseK8sVersionEOLDate = newestReleaseK8sVersion
    ? getK8sVersionEOLDate(newestReleaseK8sVersion) ?? undefined
    : undefined;

  return (
    <Box direction='column' gap='large'>
      <Box direction='row' gap='large'>
        <Box width='small'>
          <Text weight='bold' size='large' margin='none'>
            Clusters summary
          </Text>
        </Box>
        <Box gap='small'>
          <Box direction='row' gap='small'>
            <Box width='medium' direction='column' gap='xsmall'>
              <Text>Workload clusters</Text>
              <Text>Control plane nodes</Text>
              <Text>Worker nodes</Text>
              <Text>Memory in control plane nodes</Text>
              <Text>Memory in worker nodes</Text>
              <Text>CPU in control plane nodes</Text>
              <Text>CPU in worker nodes</Text>
            </Box>
            <Box direction='column' gap='xsmall'>
              <OrganizationDetailStatistic
                isLoading={clusterCountLoading}
                aria-label='Workload clusters'
              >
                {clusterCount}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic
                isLoading={clustersSummaryLoading}
                aria-label='Control plane nodes'
              >
                {clustersSummary?.nodesCount}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic
                isLoading={clustersSummaryLoading}
                aria-label='Worker nodes'
              >
                {clustersSummary?.workerNodesCount}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic
                isLoading={clustersSummaryLoading}
                aria-label='Memory in control plane nodes'
              >
                {formatMemory(clustersSummary?.nodesMemory)}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic
                isLoading={clustersSummaryLoading}
                aria-label='Memory in worker nodes'
              >
                {formatMemory(clustersSummary?.workerNodesMemory)}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic
                isLoading={clustersSummaryLoading}
                aria-label='CPU in control plane nodes'
              >
                {formatCPU(clustersSummary?.nodesCPU)}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic
                isLoading={clustersSummaryLoading}
                aria-label='CPU in worker nodes'
              >
                {formatCPU(clustersSummary?.workerNodesCPU)}
              </OrganizationDetailStatistic>
            </Box>
          </Box>
          {hasImportedClusters && (
            <Box width={{ max: '400px' }}>
              <Text color='status-warning' size='xsmall'>
                <i
                  className='fa fa-warning'
                  role='presentation'
                  aria-hidden='true'
                />{' '}
                Note: Some workload clusters are &quot;externally-managed&quot;
                and were not taken into account in control plane nodes data
                calculation.
              </Text>
            </Box>
          )}
        </Box>
      </Box>
      {hasClusterApp && (
        <Box direction='row' gap='large'>
          <Box width='small'>
            <Text weight='bold' size='large' margin='none'>
              Versions
            </Text>
          </Box>
          <Box direction='row' gap='small'>
            <Box width='medium' direction='column' gap='xsmall'>
              <Text>Cluster app</Text>
              <Text>Kubernetes</Text>
            </Box>
            <Box direction='column' gap='xsmall'>
              <OrganizationDetailStatistic
                isLoading={versionsSummaryLoading}
                aria-label='Cluster app version'
              >
                {versionsSummary
                  ? formatClusterAppVersionsInfo(versionsSummary)
                  : undefined}
              </OrganizationDetailStatistic>
              <OrganizationDetailStatistic
                isLoading={versionsSummaryLoading}
                aria-label='Kubernetes version'
              >
                {versionsSummary
                  ? formatK8sVersionsInfo(versionsSummary)
                  : undefined}
              </OrganizationDetailStatistic>
            </Box>
          </Box>
        </Box>
      )}
      {isReleasesSupported && (
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
                <OrganizationDetailStatistic
                  isLoading={releasesSummaryLoading}
                  aria-label='Oldest release'
                >
                  {releasesSummary?.oldestReleaseVersion}
                </OrganizationDetailStatistic>
                <OrganizationDetailStatistic
                  isLoading={releasesSummaryLoading}
                  aria-label='Oldest release Kubernetes version'
                >
                  <KubernetesVersionLabel
                    version={oldestReleaseK8sVersion}
                    eolDate={oldestReleaseK8sVersionEOLDate}
                    hidePatchVersion={true}
                  />
                </OrganizationDetailStatistic>
              </Box>
              <Box direction='row' gap='small'>
                <OrganizationDetailStatistic
                  isLoading={releasesSummaryLoading}
                  aria-label='Newest release'
                >
                  {releasesSummary?.newestReleaseVersion}
                </OrganizationDetailStatistic>
                <OrganizationDetailStatistic
                  isLoading={releasesSummaryLoading}
                  aria-label='Newest release Kubernetes version'
                >
                  <KubernetesVersionLabel
                    version={newestReleaseK8sVersion}
                    eolDate={newestReleaseK8sVersionEOLDate}
                    hidePatchVersion={true}
                  />
                </OrganizationDetailStatistic>
              </Box>
              <OrganizationDetailStatistic
                isLoading={releasesSummaryLoading}
                aria-label='Releases in use'
              >
                {releasesSummary?.releasesInUseCount}
              </OrganizationDetailStatistic>
            </Box>
          </Box>
        </Box>
      )}

      {!readOnly && !clusterCountLoading && (
        <OrganizationDetailDelete
          organizationName={organizationName}
          organizationNamespace={organizationNamespace}
          onDelete={onDelete}
          canDeleteOrganizations={canDeleteOrganizations}
          clusterCount={clusterCount}
          border='top'
        />
      )}
    </Box>
  );
};

export default OrganizationDetailPage;
