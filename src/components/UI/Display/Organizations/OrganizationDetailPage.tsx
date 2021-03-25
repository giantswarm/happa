import { Box, Text } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';

import KubernetesVersionLabel from '../Cluster/KubernetesVersionLabel';

interface IOrganizationDetailPageProps {}

const OrganizationDetailPage: React.FC<IOrganizationDetailPageProps> = () => {
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
            <Text>6</Text>
            <Text>82</Text>
            <Text>73</Text>
            <Text>984 GB</Text>
            <Text>876 GB</Text>
            <Text>328</Text>
            <Text>292</Text>
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
              <Text>v11.5.6</Text>
              <KubernetesVersionLabel
                version='v1.16.0'
                eolDate='2016-01-01'
                hidePatchVersion={true}
              />
            </Box>
            <Box direction='row' gap='small'>
              <Text>v14.1.0</Text>
              <KubernetesVersionLabel
                version='v1.19.0'
                eolDate='2055-01-01'
                hidePatchVersion={true}
              />
            </Box>
            <Text>4</Text>
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
            <Text>3</Text>
            <Text>18</Text>
          </Box>
        </Box>
      </Box>
      <Box direction='row' margin={{ top: 'medium' }}>
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
            <Button bsStyle='danger'>
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

OrganizationDetailPage.propTypes = {};

export default OrganizationDetailPage;
