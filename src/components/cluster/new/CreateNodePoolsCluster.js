import {
  AddNodePoolFlexColumnDiv,
  AddNodePoolWrapper,
} from '../detail/cluster_detail_node_pools_table';
import { Breadcrumb } from 'react-breadcrumbs';
import { clusterCreate } from 'actions/clusterActions';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { hasAppropriateLength } from 'lib/helpers';
import { Input } from 'styles/index';
import { nodePoolsCreate } from 'actions/nodePoolActions';
import { push } from 'connected-react-router';
import AddNodePool from '../detail/AddNodePool';
import AvailabilityZonesParser from '../detail/AvailabilityZonesParser';
import Button from 'UI/button';
import DocumentTitle from 'react-document-title';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReleaseSelector from './ReleaseSelector';
import styled from '@emotion/styled';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

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
  label {
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
    color: ${props => props.theme.colors.white1};
  }
  .label-span,
  input,
  select {
    font-size: 16px;
    margin-bottom: 13px;
    font-weight: 400;
  }
  ${Input};
  p {
    margin: 0;
    font-size: 14px;
    color: ${props => props.theme.colors.white1};
  }
  /* Make room for name validating message */
  .name-container {
    margin-bottom: 21px;
  }
  input[id='name'] {
    margin-bottom: 0;
  }
`;

const FlexRowDiv = styled.div`
  display: flex;
  margin: 0 auto 23px;
  max-width: 650px;
`;

export const RadioWrapper = props => css`
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

const RadioWrapperDiv = styled.div`
  div {
    ${RadioWrapper};
  }
`;

const AZWrapperDiv = styled.div`
  margin: 0 0 8px 24px;
  height: 26px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  .emphasized {
    font-size: 16px;
    span {
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .no-margin {
    margin-left: 18px;
  }
  .danger {
    font-weight: 400;
    margin: 0 0 0 15px;
    color: ${props => props.theme.colors.error};
  }
`;

const AddNodePoolWrapperDiv = styled.div`
  ${AddNodePoolWrapper};
  background-color: ${props => props.theme.colors.shade10};
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

const defaultNodePool = id => ({ data: { name: `Node Pool #${id}` } });

class CreateNodePoolsCluster extends Component {
  state = {
    name: {
      value: 'Unnamed Cluster',
      valid: true,
      validationError: '',
    },
    submitting: false,
    error: false,
    availabilityZonesRandom: {
      // Select automatically
      value: 1,
      valid: true,
    },
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
  };

  componentDidMount() {
    this.isValid();
  }

  updateName = event => {
    const name = event.target.value;
    const [isValid, message] = hasAppropriateLength(name, 0, 100);

    // We don't let the user write more characters if the name exceeds the max number allowed
    if (!isValid) {
      this.setState(
        produce(draft => {
          draft.name.validationError = message;
        })
      );
    }

    this.setState(
      produce(draft => {
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
      availabilityZonesRandom,
      nodePoolsForms,
    } = this.state;

    const areNodePoolsValid = Object.keys(nodePoolsForms.nodePools)
      .map(np =>
        nodePoolsForms.nodePools[np].isValid
          ? nodePoolsForms.nodePools[np].isValid
          : false
      )
      .every(np => np); // This checks if everything is true.

    const isValid =
      name.valid &&
      areNodePoolsValid &&
      ((hasAZLabels && availabilityZonesLabels.valid) ||
        (!hasAZLabels && availabilityZonesRandom.valid))
        ? true
        : false;

    return isValid;
  };

  createCluster = async () => {
    this.setState({ submitting: true });

    const nodePools = Object.values(this.state.nodePoolsForms.nodePools).map(
      np => np.data
    );

    try {
      const newCluster = await this.props.dispatch(
        clusterCreate(
          {
            owner: this.props.selectedOrganization,
            name: this.state.name.value,
            release_version: this.props.selectedRelease,
            master: {
              availabilityZone: this.state.hasAZLabels
                ? this.state.availabilityZonesLabels.zonesArray
                : this.state.availabilityZonesRandom.value,
            },
          },
          true // is v5
        )
      );

      await this.props.dispatch(nodePoolsCreate(newCluster.id, nodePools));

      // after successful creation, redirect to cluster details
      this.props.dispatch(
        push(
          `/organizations/${this.props.selectedOrganization}/clusters/${newCluster.id}`
        )
      );
    } catch (error) {
      console.error(error);
      this.setState({
        submitting: false,
        error: error,
      });
    }
  };

  errorState() {
    return (
      <div className='new-cluster-error flash-messages--flash-message flash-messages--danger'>
        <b>Something went wrong while trying to create your cluster.</b>
        <br />
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
      </div>
    );
  }

  toggleMasterAZSelector = () => {
    this.setState(state => ({
      hasAZLabels: !state.hasAZLabels,
    }));
  };

  updateAZ = payload => {
    this.setState({ availabilityZonesLabels: payload });
  };

  addNodePoolForm = () => {
    const ids = Object.keys(this.state.nodePoolsForms.nodePools);
    const nextId = ids.length === 0 ? 1 : parseInt(ids.sort().reverse()[0]) + 1;

    this.setState(
      produce(draft => {
        draft.nodePoolsForms.nodePools[nextId] = defaultNodePool(nextId);
      })
    );
  };

  removeNodePoolForm = id => {
    this.setState(
      produce(draft => {
        delete draft.nodePoolsForms.nodePools[id];
      })
    );
  };

  updateNodePoolForm = (data, id) => {
    this.setState(
      produce(draft => {
        draft.nodePoolsForms.nodePools[id] = data;
      })
    );
  };

  render() {
    const { hasAZLabels, name, submitting } = this.state;
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { nodePools } = this.state.nodePoolsForms;
    const { minAZ, maxAZ, defaultAZ } = this.props;

    return (
      <Breadcrumb
        data={{ title: 'CREATE CLUSTER', pathname: this.props.match.url }}
      >
        <DocumentTitle
          title={
            'Create Cluster | ' +
            this.props.selectedOrganization +
            ' | Giant Swarm'
          }
        >
          <>
            <WrapperDiv data-testid='nodepool-cluster-creation-view'>
              <h1>Create a Cluster</h1>

              <FlexColumnDiv>
                {/* Name */}
                <label htmlFor='name'>
                  <span className='label-span'>Name</span>
                  <div className='name-container'>
                    <input
                      value={name.value}
                      onChange={this.updateName}
                      id='name'
                      type='text'
                      placeholder={name.value === '' ? 'Unnamed cluster' : null}
                    ></input>
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
                {/* Master Node AZ */}
                <span className='label-span'>
                  Master node availability zones selection
                </span>
                <RadioWrapperDiv>
                  {/* Automatically */}
                  <div>
                    <div className='fake-radio'>
                      <div
                        className={`fake-radio-checked ${hasAZLabels ===
                          false && 'visible'}`}
                      />
                    </div>
                    <input
                      type='radio'
                      id='automatic'
                      value={false}
                      checked={hasAZLabels === false}
                      onChange={() => this.toggleMasterAZSelector(false)}
                      tabIndex='0'
                    />
                    <label
                      htmlFor='automatic'
                      onClick={() => this.toggleMasterAZSelector(false)}
                    >
                      Automatic
                    </label>
                  </div>
                  {/* Manual */}
                  <div>
                    <div className='fake-radio'>
                      <div
                        className={`fake-radio-checked ${hasAZLabels === true &&
                          'visible'}`}
                      />
                    </div>
                    <input
                      type='radio'
                      id='manual'
                      value={true}
                      checked={hasAZLabels === true}
                      tabIndex='0'
                      onChange={() => this.toggleMasterAZSelector(true)}
                    />
                    <label
                      htmlFor='manual'
                      onClick={() => this.toggleMasterAZSelector(true)}
                    >
                      Manual
                    </label>
                  </div>
                </RadioWrapperDiv>

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
              <ReactCSSTransitionGroup
                transitionAppear={true}
                transitionAppearTimeout={200}
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}
                transitionName={`login_form--transition`}
              >
                {Object.keys(nodePools).map(npId => {
                  const name = nodePools[npId].data.name;
                  return (
                    <AddNodePoolWrapperDiv key={npId}>
                      <NodePoolHeading>{name}</NodePoolHeading>
                      <AddNodePoolFlexColumnDiv>
                        <AddNodePool
                          selectedRelease={this.props.selectedRelease}
                          informParent={this.updateNodePoolForm}
                          name={name}
                          id={npId}
                        />
                        <i
                          className='fa fa-close clickable'
                          title='Remove node pool'
                          aria-hidden='true'
                          onClick={() => this.removeNodePoolForm(npId)}
                        ></i>
                      </AddNodePoolFlexColumnDiv>
                    </AddNodePoolWrapperDiv>
                  );
                })}
              </ReactCSSTransitionGroup>
              <Button onClick={this.addNodePoolForm}>
                <i className='fa fa-add-circle' /> ADD NODE POOL
              </Button>
              <hr style={{ margin: '30px 0' }} />
            </WrapperDiv>

            {this.state.error && this.errorState()}

            <FlexRowDiv>
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
              {/* We want to hide cancel button when the Create NP button has been clicked */}
              {!submitting && (
                <Button
                  bsSize='large'
                  bsStyle='default'
                  loading={submitting}
                  onClick={this.props.closeForm}
                  style={{ background: 'red' }}
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
};

function mapStateToProps(state) {
  const { availability_zones: AZ } = state.app.info.general;
  const availabilityZones = AZ.zones;
  // More than 4 AZs is not allowed by now.
  const maxAZ = Math.min(AZ.max, 4);
  const minAZ = 1;
  const defaultAZ = AZ.default;

  let selectedOrganization = state.app.selectedOrganization;
  const provider = state.app.info.general.provider;
  let clusterCreationStats = state.app.info.stats.cluster_creation_duration;

  var defaultInstanceType;
  if (
    state.app.info.workers.instance_type &&
    state.app.info.workers.instance_type.default
  ) {
    defaultInstanceType = state.app.info.workers.instance_type.default;
  } else {
    defaultInstanceType = 'm3.large';
  }

  const defaultCPUCores = 4; // TODO
  const defaultMemorySize = 4; // TODO
  const defaultDiskSize = 20; // TODO

  const allowedInstanceTypes =
    provider === 'aws' ? state.app.info.workers.instance_type.options : [];

  return {
    availabilityZones,
    allowedInstanceTypes,
    provider,
    defaultInstanceType,
    defaultCPUCores,
    defaultMemorySize,
    defaultDiskSize,
    selectedOrganization,
    clusterCreationStats,
    minAZ,
    maxAZ,
    defaultAZ,
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
