import { Box, Text } from 'grommet';
import { compare } from 'lib/semver';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Controls/Button';
import NotAvailable from 'UI/Display/NotAvailable';

import KubernetesVersionLabel from '../Cluster/KubernetesVersionLabel';

interface IOrganizationDetailPageProps {
  clusters: Cluster[];
}

const releaseVersionCompare = function (clusterA: Cluster, clusterB: Cluster) {
  const a = clusterA.release_version || '0.0.0';
  const b = clusterB.release_version || '0.0.0';

  return compare(a, b);
};

/**
 * @param clusters List of clusters owned by the organization
 * @returns Oldest release version in use
 */
const oldestRelease = function (clusters: Cluster[]) {
  if (clusters && clusters.length > 0) {
    clusters.sort(releaseVersionCompare);

    return clusters[0].release_version;
  }

  return <NotAvailable />;
};

/**
 * @param clusters List of clusters owned by the organization
 * @returns Newest release version in use
 */
const newestRelease = function (clusters: Cluster[]) {
  if (clusters && clusters.length > 0) {
    clusters.sort(releaseVersionCompare);

    return clusters.reverse()[0].release_version;
  }

  return <NotAvailable />;
};

interface StringMap {
  [key: string]: boolean;
}

const releasesInUse = function (clusters: Cluster[]) {
  const releasesMap: StringMap = {};

  clusters.forEach((cluster) => {
    if (cluster.release_version) {
      releasesMap[cluster.release_version] = true;
    }
  });

  return Object.keys(releasesMap).length;
};

const OrganizationDetailPage: React.FC<IOrganizationDetailPageProps> = ({
  clusters,
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
          </Box>
          <Box direction='column' gap='xsmall'>
            <Text>{clusters.length}</Text>
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
            <Text>Newest release</Text>
            <Text>Oldest release</Text>
            <Text>Releases in use</Text>
          </Box>
          <Box direction='column' gap='xsmall'>
            <Box direction='row' gap='small'>
              <Text>{newestRelease(clusters)}</Text>
              <KubernetesVersionLabel hidePatchVersion={true} />
            </Box>
            <Box direction='row' gap='small'>
              <Text>{oldestRelease(clusters)}</Text>
              <KubernetesVersionLabel hidePatchVersion={true} />
            </Box>
            <Text>{releasesInUse(clusters)}</Text>
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
            <Button bsStyle='danger' disabled={true}>
              <i
                className='fa fa-delete'
                role='presentation'
                aria-hidden={true}
              />{' '}
              Delete Organization
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

OrganizationDetailPage.propTypes = {
  clusters: PropTypes.array.isRequired,
};

export default OrganizationDetailPage;
