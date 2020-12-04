import styled from '@emotion/styled';
import AZSelection from 'Cluster/AZSelection/AZSelection';
import { AvailabilityZoneSelection } from 'Cluster/AZSelection/AZSelectionUtils';
import MasterNodes from 'Cluster/NewCluster/MasterNodes';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { Constants, Providers } from 'shared/constants';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { batchedClusterCreate } from 'stores/batchActions';
import { CLUSTER_CREATE_REQUEST } from 'stores/cluster/constants';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';
import HorizontalLine from 'UI/ClusterCreation/HorizontalLine';
import StyledInput from 'UI/ClusterCreation/StyledInput';
import { FlexColumn, FlexRow } from 'UI/FlexDivs';
import RadioInput from 'UI/Inputs/RadioInput';

import AddNodePool from '../ClusterDetail/AddNodePool/AddNodePool';
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
    const { minAZ, maxAZ, defaultAZ, isClusterCreating, provider } = this.props;

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
              <>
                <AZSelection
                  npID='haha'
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
                <MasterAZSelectionInput
                  label='Master node availability zones selection'
                  inputId='master-node-az-selection'
                  // regular space, hides hint ;)
                  hint={<>&#32;</>}
                >
                  <div>
                    {maxAZ > 0 && (
                      <RUMActionTarget
                        name={RUMActions.SelectMasterAZSelectionAutomatic}
                      >
                        <InputGroup>
                          <RadioInput
                            id='automatic'
                            checked={
                              masterAZMode ===
                              AvailabilityZoneSelection.Automatic
                            }
                            label='Automatic'
                            onChange={() =>
                              this.setMasterAZMode(
                                AvailabilityZoneSelection.Automatic
                              )
                            }
                          />
                        </InputGroup>
                      </RUMActionTarget>
                    )}
                    {masterAZMode === AvailabilityZoneSelection.Automatic && (
                      <p>
                        An Availabilty Zone will be automatically chosen from
                        the existing ones.
                      </p>
                    )}
                    {maxAZ > 0 && (
                      <RUMActionTarget
                        name={RUMActions.SelectMasterAZSelectionManual}
                      >
                        <InputGroup>
                          <RadioInput
                            id='manual'
                            checked={
                              masterAZMode === AvailabilityZoneSelection.Manual
                            }
                            label='Manual'
                            onChange={() =>
                              this.setMasterAZMode(
                                AvailabilityZoneSelection.Manual
                              )
                            }
                          />
                        </InputGroup>
                      </RUMActionTarget>
                    )}
                    {masterAZMode === AvailabilityZoneSelection.Manual && (
                      <AZWrapperDiv>
                        <AvailabilityZonesParser
                          min={minAZ}
                          max={maxAZ}
                          defaultValue={defaultAZ}
                          zones={this.props.availabilityZones}
                          updateAZValuesInParent={this.updateAZ}
                          isLabels={true}
                          isRadioButtons
                        />
                        {zonesArray.length < 1 && (
                          <p className='danger'>
                            Please select one availability zone.
                          </p>
                        )}
                        {zonesArray.length > maxAZ && (
                          <p className='danger'>
                            {maxAZ} is the maximum you can have. Please uncheck{' '}
                            {zonesArray.length - maxAZ} of them.
                          </p>
                        )}
                      </AZWrapperDiv>
                    )}
                    {provider === Providers.AZURE && (
                      <RUMActionTarget
                        name={RUMActions.SelectMasterAZSelectionNotSpecified}
                      >
                        <InputGroup>
                          <RadioInput
                            id='notspecified'
                            checked={
                              masterAZMode ===
                              AvailabilityZoneSelection.NotSpecified
                            }
                            label='Not specified'
                            onChange={() =>
                              this.setMasterAZMode(
                                AvailabilityZoneSelection.NotSpecified
                              )
                            }
                          />
                        </InputGroup>
                      </RUMActionTarget>
                    )}
                    {masterAZMode ===
                      AvailabilityZoneSelection.NotSpecified && (
                      <p>
                        By not specifying an availability zone, Azure will
                        select a zone by itself, where the requested virtual
                        machine size has the best availability.
                      </p>
                    )}
                  </div>
                </MasterAZSelectionInput>
              </>
            )}
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
              <i className='fa fa-add-circle' /> ADD NODE POOL
            </Button>
          </RUMActionTarget>
          <HorizontalLine />
        </WrapperDiv>
        <FlexRow>
          <RUMActionTarget name={RUMActions.CreateClusterSubmit}>
            <Button
              bsSize='large'
              bsStyle='primary'
              disabled={!this.isValid()}
              loading={isClusterCreating}
              onClick={this.createCluster}
              type='button'
            >
              Create Cluster
            </Button>
          </RUMActionTarget>
          {/* We want to hide cancel button when the Create NP button has been clicked */}
          {!isClusterCreating && (
            <RUMActionTarget name={RUMActions.CreateClusterCancel}>
              <Button
                bsSize='large'
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
    isClusterCreating: selectLoadingFlagByAction(state, CLUSTER_CREATE_REQUEST),
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
