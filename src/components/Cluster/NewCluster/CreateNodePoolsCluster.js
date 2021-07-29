import AZSelection from 'Cluster/AZSelection/AZSelection';
import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
} from 'Cluster/AZSelection/AZSelectionUtils';
import MasterNodes from 'Cluster/NewCluster/MasterNodes';
import { Box } from 'grommet';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { Constants } from 'shared/constants';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { batchedClusterCreate } from 'stores/batchActions';
import { BATCHED_CLUSTER_CREATION_REQUEST } from 'stores/cluster/constants';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import HorizontalLine from 'UI/Display/Cluster/ClusterCreation/HorizontalLine';
import InputGroup from 'UI/Inputs/InputGroup';
import { FlexColumn, FlexRow } from 'UI/Layout/FlexDivs';

import AddNodePool from '../ClusterDetail/AddNodePool/AddNodePool';
import {
  AddNodePoolFlexColumnDiv,
  AddNodePoolWrapper,
} from '../ClusterDetail/V5ClusterDetailTable';

const NodePoolsTransitionGroup = styled(TransitionGroup)`
  margin-bottom: 32px;
`;

const ClusterCreationHint = styled.p`
  margin-top: 23px;
`;

const AddNodePoolWrapperDiv = styled.div`
  ${AddNodePoolWrapper};
  background-color: ${(props) => props.theme.colors.shade10};
  border-radius: 5px;
  padding: 20px 20px 0;
  margin-bottom: 20px;
  position: relative;
  i.fa-close {
    position: absolute;
    top: 22px;
    right: 22px;
    font-size: 1.3em;
  }
`;

const NodePoolHeading = styled.div`
  position: absolute;
  font-weight: 700;
  width: calc((74vw - 650px) / 2.4);
  word-break: break-all;
`;

const AZSelectionWrapper = styled(FlexColumn)`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacingPx * 8}px;
`;

const defaultNodePool = () => ({
  data: { name: Constants.DEFAULT_NODEPOOL_NAME },
});

class CreateNodePoolsCluster extends Component {
  state = {
    error: false,
    availabilityZonesLabels: {
      // Manually select AZs
      number: 0,
      zonesString: '',
      zonesArray: [],
      valid: false,
    },
    masterAZMode: AvailabilityZoneSelection.NotSpecified,
    nodePoolsForms: {
      isValid: false,
      isSubmitting: false,
      // one object for each np form inside this array
      nodePools: { 1: defaultNodePool(1) },
    },
    masterNodes: {
      isHighAvailability: true,
    },
  };

  isValid = () => {
    // Not checking release version as we would be checking it before accessing this form
    // and sending user too the v4 form if NPs aren't supported
    const {
      masterAZMode,
      availabilityZonesLabels,
      nodePoolsForms,
    } = this.state;

    const areNodePoolsValid = Object.keys(nodePoolsForms.nodePools)
      .map((np) => nodePoolsForms.nodePools[np].isValid)
      .every((np) => np); // This checks if everything is true.

    const isValid =
      this.props.allowSubmit &&
      areNodePoolsValid &&
      (masterAZMode === AvailabilityZoneSelection.Automatic ||
        masterAZMode === AvailabilityZoneSelection.NotSpecified ||
        (masterAZMode === AvailabilityZoneSelection.Manual &&
          availabilityZonesLabels.valid));

    return isValid;
  };

  createCluster = async () => {
    const nodePools = Object.values(this.state.nodePoolsForms.nodePools).map(
      (np) => np.data
    );

    const createPayload = {
      owner: this.props.selectedOrganization,
      name: this.props.clusterName,
      release_version: this.props.selectedRelease,
    };

    switch (this.state.masterAZMode) {
      case AvailabilityZoneSelection.Manual:
        createPayload.master_nodes = {
          availability_zones: this.state.availabilityZonesLabels.zonesArray,
          azure: {
            availability_zones_unspecified: false,
          },
        };
        break;
      case AvailabilityZoneSelection.Automatic:
        createPayload.master_nodes = {
          azure: {
            availability_zones_unspecified: false,
          },
        };
        break;
      case AvailabilityZoneSelection.NotSpecified:
        createPayload.master_nodes = {
          azure: {
            availability_zones_unspecified: true,
          },
        };
        break;
    }

    if (this.props.capabilities.supportsHAMasters) {
      createPayload.master_nodes = {
        high_availability: this.state.masterNodes.isHighAvailability,
      };
    }

    await this.props.dispatch(
      batchedClusterCreate(
        createPayload,
        true, // is v5
        nodePools
      )
    );
  };

  setMasterAZMode = (mode) => {
    this.setState(() => ({
      masterAZMode: mode,
    }));
  };

  updateAZ = (azSelection) => (payload) => {
    switch (azSelection) {
      case AvailabilityZoneSelection.Manual:
        this.setState({
          availabilityZonesLabels: payload,
        });
        break;
    }
  };

  addNodePoolForm = () => {
    const ids = Object.keys(this.state.nodePoolsForms.nodePools);
    const nextId = ids.length === 0 ? 1 : parseInt(ids.sort().reverse()[0]) + 1;

    this.setState(
      produce((draft) => {
        draft.nodePoolsForms.nodePools[nextId] = defaultNodePool(nextId);
      })
    );
  };

  updateMasterNodesHighAvailability = (isHA) => {
    this.setState((prevState) => {
      return {
        masterNodes: {
          ...prevState.masterNodes,
          isHighAvailability: isHA,
        },
      };
    });
  };

  removeNodePoolForm = (id) => {
    this.setState(
      produce((draft) => {
        delete draft.nodePoolsForms.nodePools[id];
      })
    );
  };

  updateNodePoolForm = (data, id) => {
    this.setState(
      produce((draft) => {
        draft.nodePoolsForms.nodePools[id] = data;
      })
    );
  };

  render() {
    const { masterAZMode, masterNodes } = this.state;
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { nodePools } = this.state.nodePoolsForms;
    const {
      minAZ,
      maxAZ,
      defaultAZ,
      isClusterCreating,
      provider,
      capabilities,
    } = this.props;

    const { supportsHAMasters } = capabilities;

    return (
      <>
        <Box
          margin={{ top: 'medium' }}
          data-testid='nodepool-cluster-creation-view'
        >
          <AZSelectionWrapper>
            {supportsHAMasters ? (
              <MasterNodes
                isHighAvailability={masterNodes.isHighAvailability}
                onChange={this.updateMasterNodesHighAvailability}
              />
            ) : (
              <InputGroup label='Master node availability zones'>
                <AZSelection
                  variant={AZSelectionVariants.Master}
                  baseActionName={RUMActions.SelectMasterAZSelection}
                  value={masterAZMode}
                  provider={provider}
                  onChange={this.setMasterAZMode}
                  minNumOfZones={minAZ}
                  maxNumOfZones={maxAZ}
                  defaultNumOfZones={defaultAZ}
                  allZones={this.props.availabilityZones}
                  numOfZones={zonesArray.length}
                  selectedZones={zonesArray}
                  onUpdateZones={this.updateAZ}
                />
              </InputGroup>
            )}
          </AZSelectionWrapper>
          {Object.keys(nodePools).length === 0 && <HorizontalLine />}
          <NodePoolsTransitionGroup>
            {Object.keys(nodePools).map((npId) => {
              const nodePoolName = nodePools[npId].data.name;

              return (
                <SlideTransition key={npId} appear={true} direction='down'>
                  <AddNodePoolWrapperDiv>
                    <NodePoolHeading>{nodePoolName}</NodePoolHeading>
                    <AddNodePoolFlexColumnDiv>
                      <AddNodePool
                        informParent={this.updateNodePoolForm}
                        name={nodePoolName}
                        id={npId}
                        capabilities={capabilities}
                      />
                      <RUMActionTarget name={RUMActions.RemoveNodePool}>
                        <i
                          className='fa fa-close clickable'
                          title='Remove node pool'
                          aria-hidden='true'
                          onClick={() => this.removeNodePoolForm(npId)}
                        />
                      </RUMActionTarget>
                    </AddNodePoolFlexColumnDiv>
                  </AddNodePoolWrapperDiv>
                </SlideTransition>
              );
            })}
          </NodePoolsTransitionGroup>
          <RUMActionTarget name={RUMActions.AddNodePool}>
            <Button onClick={this.addNodePoolForm}>
              <i className='fa fa-add-circle' /> Add node pool
            </Button>
          </RUMActionTarget>
          <HorizontalLine />
        </Box>
        <FlexRow>
          <RUMActionTarget name={RUMActions.CreateClusterSubmit}>
            <Button
              bsStyle='primary'
              disabled={!this.isValid()}
              loading={isClusterCreating}
              onClick={this.createCluster}
              type='button'
            >
              Create cluster
            </Button>
          </RUMActionTarget>
          {/* We want to hide cancel button when the Create NP button has been clicked */}
          {!isClusterCreating && (
            <RUMActionTarget name={RUMActions.CreateClusterCancel}>
              <Button
                bsStyle='default'
                loading={isClusterCreating}
                onClick={this.props.closeForm}
                type='button'
              >
                Cancel
              </Button>
            </RUMActionTarget>
          )}
        </FlexRow>
        <FlexRow>
          <ClusterCreationHint>
            Note that it takes around 20 minutes on average until a new cluster
            is fully available.
          </ClusterCreationHint>
        </FlexRow>
      </>
    );
  }
}

CreateNodePoolsCluster.propTypes = {
  allowSubmit: PropTypes.bool,
  availabilityZones: PropTypes.array,
  capabilities: PropTypes.object,
  closeForm: PropTypes.func,
  isClusterCreating: PropTypes.bool,
  clusterName: PropTypes.string,
  defaultAZ: PropTypes.number,
  dispatch: PropTypes.func,
  maxAZ: PropTypes.number,
  minAZ: PropTypes.number,
  provider: PropTypes.string,
  selectedOrganization: PropTypes.string,
  selectedRelease: PropTypes.string,
};

function mapStateToProps(state) {
  const { availability_zones: AZ, provider } = state.main.info.general;
  const availabilityZones = AZ.zones;
  // More than 4 AZs is not allowed by now.
  // eslint-disable-next-line no-magic-numbers
  let maxAZ = Math.min(AZ.max, 4);
  let minAZ = 1;
  if (availabilityZones && availabilityZones.length === 0) {
    // Region does not support availability zones.
    maxAZ = 0;
    minAZ = 0;
  }
  const defaultAZ = AZ.default;

  return {
    availabilityZones,
    minAZ,
    maxAZ,
    defaultAZ,
    provider,
    isClusterCreating: selectLoadingFlagByAction(
      state,
      BATCHED_CLUSTER_CREATION_REQUEST
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateNodePoolsCluster);
