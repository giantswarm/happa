import { Box } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import ClusterDetailWidgetKeyPairs from 'UI/Display/MAPI/keypairs/ClusterDetailWidgetKeyPairs';

import ClusterDetailWidgetApps from '../../apps/ClusterDetailWidgetApps';
import { IRelease } from '../../releases/types';
import { IClusterItem, IControlPlaneNodeItem } from '../types';
import ClusterDetailOverviewDelete from './ClusterDetailOverviewDelete';
import ClusterDetailWidgetControlPlaneNodes from './ClusterDetailWidgetControlPlaneNodes';
import ClusterDetailWidgetCreated from './ClusterDetailWidgetCreated';
import ClusterDetailWidgetKubernetesAPI from './ClusterDetailWidgetKubernetesAPI';
import ClusterDetailWidgetLabels from './ClusterDetailWidgetLabels';
import ClusterDetailWidgetProvider from './ClusterDetailWidgetProvider';
import ClusterDetailWidgetRelease from './ClusterDetailWidgetRelease';
import ClusterDetailWidgetWorkerNodes from './ClusterDetailWidgetWorkerNodes';

const StyledBox = styled(Box)`
  gap: ${({ theme }) => theme.global.edgeSize.small};
`;

interface IClusterDetailOverviewProps extends IClusterItem {
  onDelete: () => Promise<void>;
  gettingStartedPath: string;
  labelsOnChange: React.ComponentPropsWithoutRef<
    typeof ClusterDetailWidgetLabels
  >['onChange'];
  workerNodesPath: string;
  appsPath: string;
  createKeyPairPath: string;
  controlPlaneNodes?: IControlPlaneNodeItem[];
  controlPlaneNodesError?: string;
  labelsErrorMessage?: string;
  labelsIsLoading?: boolean;
  regionLabel?: string;
  accountIDLabel?: string;
  accountIDPath?: string;
  currentRelease?: IRelease;
  currentReleaseError?: string;
}

const ClusterDetailOverview: React.FC<IClusterDetailOverviewProps> = ({
  onDelete,
  gettingStartedPath,
  workerNodesPath,
  appsPath,
  name,
  creationDate,
  k8sApiURL,
  workerNodePoolsCount,
  workerNodesCount,
  workerNodesCPU,
  workerNodesMemory,
  appsCount,
  appsUniqueCount,
  appsDeployedCount,
  createKeyPairPath,
  activeKeyPairsCount,
  controlPlaneNodes,
  controlPlaneNodesError,
  labels,
  labelsOnChange,
  labelsErrorMessage,
  labelsIsLoading,
  region,
  regionLabel,
  accountID,
  accountIDLabel,
  accountIDPath,
  currentRelease,
  currentReleaseError,
}) => {
  const isLoading = typeof name === 'undefined';

  return (
    <StyledBox wrap={true} direction='row'>
      <ClusterDetailWidgetWorkerNodes
        workerNodesPath={workerNodesPath}
        workerNodePoolsCount={workerNodePoolsCount}
        workerNodesCount={workerNodesCount}
        workerNodesCPU={workerNodesCPU}
        workerNodesMemory={workerNodesMemory}
        basis='500px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetApps
        appsPath={appsPath}
        appsCount={appsCount}
        appsUniqueCount={appsUniqueCount}
        appsDeployedCount={appsDeployedCount}
        basis='350px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetKeyPairs
        createKeyPairPath={createKeyPairPath}
        activeKeyPairsCount={activeKeyPairsCount}
        basis='200px'
        flex={{ grow: 1, shrink: 1 }}
      />
      <ClusterDetailWidgetRelease
        currentRelease={currentRelease}
        currentReleaseErrorMessage={currentReleaseError}
        basis='100%'
      />
      <ClusterDetailWidgetLabels
        labels={labels}
        onChange={labelsOnChange}
        errorMessage={labelsErrorMessage}
        isLoading={labelsIsLoading}
        basis='100%'
      />
      <ClusterDetailWidgetControlPlaneNodes
        nodes={controlPlaneNodes}
        errorMessage={controlPlaneNodesError}
        basis='100%'
      />
      <ClusterDetailWidgetKubernetesAPI
        gettingStartedPath={gettingStartedPath}
        k8sApiURL={k8sApiURL}
        basis='100%'
      />
      <ClusterDetailWidgetProvider
        region={region}
        regionLabel={regionLabel}
        accountID={accountID}
        accountIDLabel={accountIDLabel}
        accountIDPath={accountIDPath}
        basis='100%'
      />
      <ClusterDetailWidgetCreated creationDate={creationDate} basis='100%' />
      {!isLoading && (
        <ClusterDetailOverviewDelete
          clusterName={name!}
          onDelete={onDelete}
          border='top'
          margin={{ top: 'small' }}
          basis='100%'
        />
      )}
    </StyledBox>
  );
};

ClusterDetailOverview.propTypes = {
  onDelete: PropTypes.func.isRequired,
  gettingStartedPath: PropTypes.string.isRequired,
  labelsOnChange: PropTypes.func.isRequired,
  workerNodesPath: PropTypes.string.isRequired,
  appsPath: PropTypes.string.isRequired,
  createKeyPairPath: PropTypes.string.isRequired,
  name: PropTypes.string,
  creationDate: PropTypes.string,
  k8sApiURL: PropTypes.string,
  workerNodePoolsCount: PropTypes.number,
  workerNodesCount: PropTypes.number,
  workerNodesCPU: PropTypes.number,
  workerNodesMemory: PropTypes.number,
  appsCount: PropTypes.number,
  appsUniqueCount: PropTypes.number,
  appsDeployedCount: PropTypes.number,
  activeKeyPairsCount: PropTypes.number,
  controlPlaneNodes: PropTypes.array,
  controlPlaneNodesError: PropTypes.string,
  labels: PropTypes.object as PropTypes.Requireable<
    IClusterDetailOverviewProps['labels']
  >,
  labelsErrorMessage: PropTypes.string,
  labelsIsLoading: PropTypes.bool,
  region: PropTypes.string,
  regionLabel: PropTypes.string,
  accountID: PropTypes.string,
  accountIDLabel: PropTypes.string,
  accountIDPath: PropTypes.string,
  currentRelease: PropTypes.object as PropTypes.Requireable<
    IClusterDetailOverviewProps['currentRelease']
  >,
  currentReleaseError: PropTypes.string,
};

export default ClusterDetailOverview;
