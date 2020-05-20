import { css } from '@emotion/core';
import styled from '@emotion/styled';
import * as actionTypes from 'actions/actionTypes';
import { batchedClusterCreate } from 'actions/batchedActions';
import MasterNodes from 'Cluster/NewCluster/MasterNodes';
import DocumentTitle from 'components/shared/DocumentTitle';
import produce from 'immer';
import { hasAppropriateLength } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { TransitionGroup } from 'react-transition-group';
import { selectErrorByAction } from 'selectors/clusterSelectors';
import { Constants, Providers } from 'shared/constants';
import FeatureFlags from 'shared/FeatureFlags';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';
import ErrorFallback from 'UI/ErrorFallback';
import RadioInput from 'UI/Inputs/RadioInput';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

import AddNodePool from '../ClusterDetail/AddNodePool';
import AvailabilityZonesParser from '../ClusterDetail/AvailabilityZonesParser';
import {
  AddNodePoolFlexColumnDiv,
  AddNodePoolWrapper,
} from '../ClusterDetail/V5ClusterDetailTable';
import ReleaseSelector from './ReleaseSelector';

const InputGroup = styled.fieldset`
  margin-bottom: 4px;
`;

export const Wrapper = css`
  h1 {
    padding-bottom: 25px;
    border-bottom: 1px solid #3a5f7b;
    margin-bottom: 35px;
  }
  /* Last node pool wrapper */
  & > div:nth-last-of-type(2) {
    margin-bottom: 33px;
  }
`;

const WrapperDiv = styled.div`
  ${Wrapper}
`;

export const FlexColumnDiv = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin: 0 auto;
  max-width: 650px;

  label:not(.skip-format) {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 0 0 31px;
    &.instance-type {
      margin-bottom: 21px;
    }
    p {
      line-height: 1.4;
    }
  }

  .label-span {
    color: ${(props) => props.theme.colors.white1};
  }
  .label-span,
  input,
  select {
    font-size: 16px;
    margin-bottom: 13px;
    font-weight: 400;
  }

  input:not(.skip-format) {
    box-sizing: border-box;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.shade5};
    padding: 11px 10px 11px 15px;
    outline: 0;
    color: ${({ theme }) => theme.colors.whiteInput};
    border-radius: 4px;
    border: ${({ theme }) => theme.border};
    line-height: normal;
  }

  p {
    margin: 0;
    font-size: 14px;
    color: ${(props) => props.theme.colors.white1};
  }
  /* Make room for name validating message */
  .name-container {
    margin-bottom: 21px;
  }
  input[id='cluster-name'] {
    margin-bottom: 0;
  }
`;

const FlexRowDiv = styled.div`
  display: flex;
  margin: 0 auto 23px;
  max-width: 650px;
`;

export const RadioWrapper = (props) => css`
  display: flex;
  justify-content: flex-start;
  position: relative;
  label {
    font-size: 14px;
    font-weight: 300;
    margin-bottom: 0;
    cursor: pointer;
  }
  input {
    max-width: 28px;
    cursor: pointer;
  }
  input[type='radio'] {
    opacity: 0;
  }
  .fake-radio {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    top: 4px;
    border: ${props.theme.border};
    background: ${props.theme.colors.white1};
    display: flex;
    justify-content: space-around;
    align-items: center;
    &-checked {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${props.theme.colors.white1};
      transition: background-color 0.2s;
      &.visible {
        background-color: ${props.theme.colors.shade2};
      }
    }
  }
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
      <div className='new-cluster-error flash-messages--flash-message flash-messages--danger'>
        <b>Something went wrong while trying to create your cluster.</b>
        <br />
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
      </div>
    );
  }

  state = {
    name: {
      value: this.props.clusterName,
      valid: true,
      validationError: '',
    },
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
      isHighAvailability: false,
    },
  };

  clusterNameInput = React.createRef();

  componentDidMount() {
    this.clusterNameInput.current.select();
    this.isValid();
  }

  updateName = (event) => {
    const name = event.target.value;
    const maxNameLength = 100;
    const [isValid, message] = hasAppropriateLength(name, 0, maxNameLength);

    this.props.updateClusterNameInParent(name);

    // We don't let the user write more characters if the name exceeds the max number allowed
    if (!isValid) {
      this.setState(
        produce((draft) => {
          draft.name.validationError = message;
        })
      );
    }

    this.setState(
      produce((draft) => {
        draft.name.valid = isValid;
        draft.name.value = name;
        draft.name.validationError = message;
      })
    );
  };

  isValid = () => {
    // Not checking release version as we would be checking it before accessing this form
    // and sending user too the v4 form if NPs aren't supported
    const {
      name,
      hasAZLabels,
      availabilityZonesLabels,
      nodePoolsForms,
    } = this.state;

    const areNodePoolsValid = Object.keys(nodePoolsForms.nodePools)
      .map((np) => nodePoolsForms.nodePools[np].isValid)
      .every((np) => np); // This checks if everything is true.

    const isValid =
      name.valid &&
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
      name: this.state.name.value,
      release_version: this.props.selectedRelease,
    };

    if (this.state.hasAZLabels) {
      // TODO: don't use array here as long as there can be only one master node.
      createPayload.master = {
        availability_zone: this.state.availabilityZonesLabels.zonesArray[0],
      };
    }

    if (FeatureFlags.FEATURE_HA_MASTERS) {
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
    const { hasAZLabels, name, submitting, masterNodes } = this.state;
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { nodePools } = this.state.nodePoolsForms;
    const { minAZ, maxAZ, defaultAZ } = this.props;

    return (
      <Breadcrumb
        data={{ title: 'CREATE CLUSTER', pathname: this.props.match.url }}
      >
        <DocumentTitle
          title={`Create Cluster | ${this.props.selectedOrganization}`}
        >
          <>
            <WrapperDiv data-testid='nodepool-cluster-creation-view'>
              <h1>Create a Cluster</h1>

              <FlexColumnDiv>
                {/* Name */}
                <label htmlFor='cluster-name'>
                  <span className='label-span'>Name</span>
                  <div className='name-container'>
                    <input
                      autoFocus
                      ref={this.clusterNameInput}
                      value={name.value}
                      onChange={this.updateName}
                      id='cluster-name'
                      type='text'
                      placeholder={name.value}
                    />
                    <ValidationErrorMessage message={name.validationError} />
                  </div>
                  <p>Give your cluster a name to recognize it among others.</p>
                </label>
                {/* Release */}
                <label className='release-version' htmlFor='release-version'>
                  <span className='label-span'>Release version</span>
                  <div>
                    <ReleaseSelector
                      selectRelease={this.props.informParent}
                      selectedRelease={this.props.selectedRelease}
                      selectableReleases={this.props.selectableReleases}
                      releases={this.props.releases}
                      activeSortedReleases={this.props.activeSortedReleases}
                    />
                  </div>
                </label>
                {FeatureFlags.FEATURE_HA_MASTERS ? (
                  <MasterNodes
                    isHighAvailability={masterNodes.isHighAvailability}
                    onChange={this.updateMasterNodesHighAvailability}
                  />
                ) : (
                  <>
                    <span className='label-span'>
                      Master node availability zones selection
                    </span>
                    <div>
                      <InputGroup>
                        <RadioInput
                          id='automatic'
                          checked={!hasAZLabels}
                          label='Automatic'
                          onChange={() => this.toggleMasterAZSelector(false)}
                          rootProps={{ className: 'skip-format' }}
                          className='skip-format'
                        />
                      </InputGroup>
                      <InputGroup>
                        <RadioInput
                          id='manual'
                          checked={hasAZLabels}
                          label='Manual'
                          onChange={() => this.toggleMasterAZSelector(true)}
                          rootProps={{ className: 'skip-format' }}
                          className='skip-format'
                        />
                      </InputGroup>
                    </div>
                  </>
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
                    <p className='danger'>
                      Please select one availability zone.
                    </p>
                  )}
                  {hasAZLabels && zonesArray.length > maxAZ && (
                    <p className='danger'>
                      {maxAZ} is the maximum you can have. Please uncheck{' '}
                      {zonesArray.length - maxAZ} of them.
                    </p>
                  )}
                </AZWrapperDiv>
              </FlexColumnDiv>
              {Object.keys(nodePools).length === 0 && <hr />}
              <TransitionGroup>
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
                          />
                        </AddNodePoolFlexColumnDiv>
                      </AddNodePoolWrapperDiv>
                    </SlideTransition>
                  );
                })}
              </TransitionGroup>
              <Button onClick={this.addNodePoolForm}>
                <i className='fa fa-add-circle' /> ADD NODE POOL
              </Button>
              <hr style={{ margin: '30px 0' }} />
            </WrapperDiv>

            {this.state.error && CreateNodePoolsCluster.errorState()}

            <FlexRowDiv>
              <ErrorFallback error={this.props.clusterCreateError}>
                <Button
                  bsSize='large'
                  bsStyle='primary'
                  disabled={!this.isValid()}
                  loading={submitting}
                  onClick={this.createCluster}
                  type='button'
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
                >
                  Cancel
                </Button>
              )}
            </FlexRowDiv>
            <p style={{ maxWidth: '650px', margin: '0 auto' }}>
              Note that it takes around 20 minutes on average until a new
              cluster is fully available.
            </p>
          </>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

CreateNodePoolsCluster.propTypes = {
  availabilityZones: PropTypes.array,
  allowedInstanceTypes: PropTypes.array,
  selectedOrganization: PropTypes.string,
  selectedRelease: PropTypes.string,
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  defaultInstanceType: PropTypes.string,
  defaultCPUCores: PropTypes.number,
  defaultMemorySize: PropTypes.number,
  defaultDiskSize: PropTypes.number,
  match: PropTypes.object,
  clusterCreationStats: PropTypes.object,
  clusterId: PropTypes.string,
  closeForm: PropTypes.func,
  informParent: PropTypes.func,
  selectableReleases: PropTypes.array,
  releases: PropTypes.object,
  activeSortedReleases: PropTypes.array,
  maxAZ: PropTypes.number,
  minAZ: PropTypes.number,
  defaultAZ: PropTypes.number,
  clusterName: PropTypes.string,
  updateClusterNameInParent: PropTypes.func,
  clusterCreateError: PropTypes.string,
};

function mapStateToProps(state) {
  const { availability_zones: AZ } = state.main.info.general;
  const availabilityZones = AZ.zones;
  // More than 4 AZs is not allowed by now.
  // eslint-disable-next-line no-magic-numbers
  const maxAZ = Math.min(AZ.max, 4);
  const minAZ = 1;
  const defaultAZ = AZ.default;

  const provider = state.main.info.general.provider;
  const clusterCreationStats = state.main.info.stats.cluster_creation_duration;

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let defaultInstanceType;
  if (
    state.main.info.workers.instance_type &&
    state.main.info.workers.instance_type.default
  ) {
    defaultInstanceType = state.main.info.workers.instance_type.default;
  } else {
    defaultInstanceType = 'm3.large';
  }

  const defaultCPUCores = 4; // TODO
  const defaultMemorySize = 4; // TODO
  const defaultDiskSize = 20; // TODO

  const allowedInstanceTypes =
    provider === Providers.AWS
      ? state.main.info.workers.instance_type.options
      : [];

  return {
    availabilityZones,
    allowedInstanceTypes,
    provider,
    defaultInstanceType,
    defaultCPUCores,
    defaultMemorySize,
    defaultDiskSize,
    clusterCreationStats,
    minAZ,
    maxAZ,
    defaultAZ,
    clusterCreateError: selectErrorByAction(
      state,
      actionTypes.CLUSTER_CREATE_REQUEST
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
