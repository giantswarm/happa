import { Box, Paragraph, Text } from 'grommet';
import * as docs from 'lib/docs';
import React from 'react';

interface IClusterDetailUpgradeModalDisclaimerProps {}

const ClusterDetailUpgradeModalDisclaimer: React.FC<IClusterDetailUpgradeModalDisclaimerProps> = () => {
  return (
    <Box direction='column'>
      <Paragraph fill={true}>
        Please read our{' '}
        <a
          href={docs.clusterUpgradeChecklistURL}
          rel='noopener noreferrer'
          target='_blank'
        >
          checklist for cluster upgrades{' '}
          <i
            className='fa fa-open-in-new'
            role='presentation'
            aria-hidden='true'
          />
        </a>{' '}
        to ensure the cluster and workloads are{' '}
        <Text weight='bold'>prepared for an upgrade</Text>.
      </Paragraph>
      <Paragraph fill={true}>
        As this cluster has one master node, the{' '}
        <Text weight='bold'>
          Kubernetes API will be unavailable for a few minutes
        </Text>{' '}
        during the upgrade.
      </Paragraph>
    </Box>
  );
};

ClusterDetailUpgradeModalDisclaimer.propTypes = {};

export default ClusterDetailUpgradeModalDisclaimer;
