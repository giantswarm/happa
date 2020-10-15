import styled from '@emotion/styled';
import MasterNodes from 'Cluster/NewCluster/MasterNodes';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { Constants } from 'shared/constants';
import { RealUserMonitoringEvents } from 'shared/constants/realUserMonitoring';
import { batchedClusterCreate } from 'stores/batchActions';
import { CLUSTER_CREATE_REQUEST } from 'stores/cluster/constants';
import { selectErrorByAction } from 'stores/error/selectors';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';
import HorizontalLine from 'UI/ClusterCreation/HorizontalLine';
import StyledInput from 'UI/ClusterCreation/StyledInput';
import ErrorFallback from 'UI/ErrorFallback';
import FlashMessage from 'UI/FlashMessage';
import { FlexColumn, FlexRow } from 'UI/FlexDivs';
import RadioInput from 'UI/Inputs/RadioInput';

import AddNodePool from '../ClusterDetail/AddNodePool';
import AvailabilityZonesParser from '../ClusterDetail/AvailabilityZonesParser';
import {
  AddNodePoolFlexColumnDiv,
  AddNodePoolWrapper,
} from '../ClusterDetail/V5ClusterDetailTable';

const WrapperDiv = styled.div`
  margin-top: 32px;
`;

const InputGroup = styled.fieldset`
  margin-bottom: 4px;
`;

const NodePoolsTransitionGroup = styled(TransitionGroup)`
  margin-bottom: 32px;
`;

const ClusterCreationHint = styled.p`
  margin-top: 23px;
`;

const MasterAZSelectionInput = styled(StyledInput)`
  margin-bottom: 0;
`;

const AZWrapperDiv = styled.div`
  margin: 0 0 25px 24px;
  height: 26px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .danger {
    font-weight: 400;
    margin: 0 0 0 15px;
    color: ${(props) => props.theme.colors.error};
  }
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

const defaultNodePool = () => ({
  data: { name: Constants.DEFAULT_NODEPOOL_NAME },
});

class CreateNodePoolsCluster extends Component {
  static errorState() {
    return (
      <FlashMessage type='danger'>
        <b>Something went wrong while trying to create your cluster.</b>
        <br />
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
      </FlashMessage>
    );
  }

  state = {
    submitting: false,
    error: false,
    availabilityZonesLabels: {
      // Manually select AZs
      number: 0,
      zonesString: '',
      zonesArray: [],
      valid: false,
    },
    hasAZLabels: false, // false = 'automatically', true = 'manual'
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
    const { hasAZLabels, availabilityZonesLabels, nodePoolsForms } = this.state;

    const areNodePoolsValid = Object.keys(nodePoolsForms.nodePools)
      .map((np) => nodePoolsForms.nodePools[np].isValid)
      .every((np) => np); // This checks if everything is true.

    const isValid =
      this.props.allowSubmit &&
      areNodePoolsValid &&
      ((hasAZLabels && availabilityZonesLabels.valid) || !hasAZLabels)
        ? true
        : false;

    return isValid;
  };

  createCluster = async () => {
    this.setState({ submitting: true });

    const nodePools = Object.values(this.state.nodePoolsForms.nodePools).map(
      (np) => np.data
    );

    const createPayload = {
      owner: this.props.selectedOrganization,
      name: this.props.clusterName,
      release_version: this.props.selectedRelease,
    };

    if (this.state.hasAZLabels) {
      createPayload.master = {
        availability_zone: this.state.availabilityZonesLabels.zonesArray[0],
      };
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

  toggleMasterAZSelector = () => {
    this.setState((state) => ({
      hasAZLabels: !state.hasAZLabels,
    }));
  };

  updateAZ = (payload) => {
    this.setState({ availabilityZonesLabels: payload });
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
    const { hasAZLabels, submitting, masterNodes } = this.state;
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { nodePools } = this.state.nodePoolsForms;
    const { minAZ, maxAZ, defaultAZ } = this.props;

    return (
      <>
        <WrapperDiv data-testid='nodepool-cluster-creation-view'>
          <FlexColumn>
            {this.props.capabilities.supportsHAMasters ? (
              <MasterNodes
                isHighAvailability={masterNodes.isHighAvailability}
                onChange={this.updateMasterNodesHighAvailability}
              />
            ) : (
              <MasterAZSelectionInput
                label='Master node availability zones selection'
                inputId='master-node-az-selection'
                // regular space, hides hint ;)
                hint={<>&#32;</>}
              >
                <div>
                  <InputGroup>
                    <RadioInput
                      id='automatic'
                      checked={!hasAZLabels}
                      label='Automatic'
                      onChange={() => this.toggleMasterAZSelector(false)}
                      data-dd-action-name={
                        RealUserMonitoringEvents.SelectMasterAZSelectionAutomatic
                      }
                    />
                  </InputGroup>
                  <InputGroup>
                    <RadioInput
                      id='manual'
                      checked={hasAZLabels}
                      label='Manual'
                      onChange={() => this.toggleMasterAZSelector(true)}
                      data-dd-action-name={
                        RealUserMonitoringEvents.SelectMasterAZSelectionManual
                      }
                    />
                  </InputGroup>
                </div>
              </MasterAZSelectionInput>
            )}
            <AZWrapperDiv>
              {hasAZLabels && (
                <AvailabilityZonesParser
                  min={minAZ}
                  max={maxAZ}
                  defaultValue={defaultAZ}
                  zones={this.props.availabilityZones}
                  updateAZValuesInParent={this.updateAZ}
                  isLabels={true}
                  isRadioButtons
                />
              )}
              {hasAZLabels && zonesArray.length < 1 && (
                <p className='danger'>Please select one availability zone.</p>
              )}
              {hasAZLabels && zonesArray.length > maxAZ && (
                <p className='danger'>
                  {maxAZ} is the maximum you can have. Please uncheck{' '}
                  {zonesArray.length - maxAZ} of them.
                </p>
              )}
            </AZWrapperDiv>
          </FlexColumn>
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
                        selectedRelease={this.props.selectedRelease}
                        informParent={this.updateNodePoolForm}
                        name={nodePoolName}
                        id={npId}
                      />
                      <i
                        className='fa fa-close clickable'
                        title='Remove node pool'
                        aria-hidden='true'
                        onClick={() => this.removeNodePoolForm(npId)}
                        data-dd-action-name={
                          RealUserMonitoringEvents.RemoveNodePool
                        }
                      />
                    </AddNodePoolFlexColumnDiv>
                  </AddNodePoolWrapperDiv>
                </SlideTransition>
              );
            })}
          </NodePoolsTransitionGroup>
          <Button
            onClick={this.addNodePoolForm}
            data-dd-action-name={RealUserMonitoringEvents.AddNodePool}
          >
            <i className='fa fa-add-circle' /> ADD NODE POOL
          </Button>
          <HorizontalLine />
        </WrapperDiv>

        {this.state.error && CreateNodePoolsCluster.errorState()}

        <FlexRow>
          <ErrorFallback error={this.props.clusterCreateError}>
            <Button
              bsSize='large'
              bsStyle='primary'
              disabled={!this.isValid()}
              loading={submitting}
              onClick={this.createCluster}
              type='button'
              data-dd-action-name={RealUserMonitoringEvents.CreateClusterSubmit}
            >
              Create Cluster
            </Button>
          </ErrorFallback>
          {/* We want to hide cancel button when the Create NP button has been clicked */}
          {!submitting && (
            <Button
              bsSize='large'
              bsStyle='default'
              loading={submitting}
              onClick={this.props.closeForm}
              type='button'
              data-dd-action-name={RealUserMonitoringEvents.CreateClusterCancel}
            >
              Cancel
            </Button>
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
  clusterCreateError: PropTypes.string,
  clusterName: PropTypes.string,
  defaultAZ: PropTypes.number,
  dispatch: PropTypes.func,
  maxAZ: PropTypes.number,
  minAZ: PropTypes.number,
  selectedOrganization: PropTypes.string,
  selectedRelease: PropTypes.string,
};

function mapStateToProps(state) {
  const { availability_zones: AZ } = state.main.info.general;
  const availabilityZones = AZ.zones;
  // More than 4 AZs is not allowed by now.
  // eslint-disable-next-line no-magic-numbers
  const maxAZ = Math.min(AZ.max, 4);
  const minAZ = 1;
  const defaultAZ = AZ.default;

  return {
    availabilityZones,
    minAZ,
    maxAZ,
    defaultAZ,
    clusterCreateError: selectErrorByAction(state, CLUSTER_CREATE_REQUEST),
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
