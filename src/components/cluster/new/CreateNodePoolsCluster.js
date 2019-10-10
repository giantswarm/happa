import {
  AddNodePoolFlexColumnDiv,
  AddNodePoolWrapper,
} from '../detail/cluster_detail_node_pools_table';
import { Breadcrumb } from 'react-breadcrumbs';
import { clusterCreate } from 'actions/clusterActions';
import { connect } from 'react-redux';
import { hasAppropriateLength } from 'lib/helpers';
import { Input } from 'styles/index';
import { push } from 'connected-react-router';
import AddNodePool from '../detail/AddNodePool';
import AddNodePoolsAvailabilityZones from '../detail/AddNodePoolsAvailabilityZones';
import Button from 'UI/button';
import DocumentTitle from 'react-document-title';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReleaseSelector from './ReleaseSelector';
import styled from '@emotion/styled';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

const WrapperDiv = styled.div`
  h1 {
    padding-bottom: 45px;
    border-bottom: 1px solid #3a5f7b;
    margin-bottom: 25px;
  }
  /* Last node pool wrapper */
  & > div:nth-last-of-type(2) {
    margin-bottom: 33px;
  }
`;

const FlexColumnDiv = styled.div`
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

const RadioGroupDiv = styled.div`
  div {
    display: flex;
    justify-content: flex-start;
    position: relative;
    label {
      font-size: 14px;
      font-weight: 300;
      margin-bottom: 0;
    }
    input {
      max-width: 28px;
    }
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
    border: ${props => props.theme.border};
    background: ${props => props.theme.colors.white1};
    display: flex;
    justify-content: space-around;
    align-items: center;
    &-checked {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${props => props.theme.colors.white1};
      transition: background-color 0.2s;
      &.visible {
        background-color: ${props => props.theme.colors.shade2};
      }
    }
  }
`;

// Duplicated styles, also in AddNodePoolsAvailabillityZones.
const AZWrapperDiv = styled.div`
  margin: 0 0 8px 24px;
  height: 26px;
  /* duplicated code below */
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
`;

const defaultNodePool = id => ({ data: { name: `Node Pool #${id}` } });

class CreateNodePoolsCluster extends Component {
  state = {
    name: {
      value: 'Unnamed Cluster',
      valid: true,
      validationError: '',
    },
    releaseVersion: '',
    submitting: false,
    error: false,
    // Not sure which value are we going to pass here... there is no
    // input field in the wireframes
    availabilityZonesRandom: {
      // Select automatically
      value: 1,
      valid: true,
    },
    availabilityZonesLabels: {
      // Use distinct availability zone
      number: 0,
      zonesString: '',
      zonesArray: [],
      valid: false,
    },
    hasAZLabels: false, // false = 'automatically', true = 'distinct'
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
      .every(np => np);

    const isValid =
      name.valid &&
      areNodePoolsValid &&
      ((hasAZLabels && availabilityZonesLabels.valid) ||
        (!hasAZLabels && availabilityZonesRandom.valid))
        ? true
        : false;

    return isValid;
  };

  createCluster = () => {
    this.setState({ submitting: true });

    this.props
      .dispatch(
        clusterCreate(
          {
            availabilityZones: this.state.hasAZLabels
              ? this.state.availabilityZonesLabels.zonesString
              : this.state.availabilityZonesRandom.value,
            name: this.state.name.value,
            release_version: this.state.releaseVersion,
          },
          true // is v5
        )
      )
      .then(cluster => {
        // after successful creation, redirect to cluster details
        this.props.dispatch(
          push(
            `/organizations/${this.props.selectedOrganization}/clusters/${cluster.id}`
          )
        );
      })
      .catch(error => {
        this.setState({
          submitting: false,
          error: error,
        });
      });
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

  selectRelease = releaseVersion => {
    this.setState({
      releaseVersion,
    });
    this.props.informParent(releaseVersion);
  };

  toggleAZSelector = () => {
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
    const { hasAZLabels } = this.state;
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { min, max } = window.config.v5ClusterAZLimits;
    const { nodePools } = this.state.nodePoolsForms;

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
              <div className='row'>
                <div className='col-12'>
                  <h1>Create a Cluster</h1>
                </div>
              </div>

              <FlexColumnDiv>
                {/* Name */}
                <label htmlFor='name'>
                  <span className='label-span'>Name</span>
                  <div className='name-container'>
                    <input
                      value={this.state.name.value}
                      onChange={this.updateName}
                      id='name'
                      type='text'
                    ></input>
                    <ValidationErrorMessage
                      message={this.state.name.validationError}
                    />
                  </div>
                  <p>Give your cluster a name to recognize it among others.</p>
                </label>
                {/* Release */}
                <label className='release-version' htmlFor='release-version'>
                  <span className='label-span'>Release version</span>
                  <div>
                    <ReleaseSelector selectRelease={this.selectRelease} />
                  </div>
                </label>
                {/* Master Node AZ */}
                <span className='label-span'>
                  Master node availability zone
                </span>
                <RadioGroupDiv ref={this.radioGroupRef}>
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
                      id='automatically'
                      value={false}
                      checked={hasAZLabels === false}
                      onChange={() => this.toggleAZSelector(false)}
                      tabIndex='0'
                    />
                    <label
                      htmlFor='automatically'
                      onClick={() => this.toggleAZSelector(false)}
                    >
                      Select automatically
                    </label>
                  </div>
                  {/* Distinct AZ */}
                  <div>
                    <div className='fake-radio'>
                      <div
                        className={`fake-radio-checked ${hasAZLabels === true &&
                          'visible'}`}
                      />
                    </div>
                    <input
                      type='radio'
                      id='distinct'
                      value={true}
                      checked={hasAZLabels === true}
                      tabIndex='0'
                      onChange={() => this.toggleAZSelector(true)}
                    />
                    <label
                      htmlFor='distinct'
                      onClick={() => this.toggleAZSelector(true)}
                    >
                      Use distinct availability zone
                    </label>
                  </div>
                </RadioGroupDiv>
                <AZWrapperDiv>
                  {hasAZLabels && (
                    <AddNodePoolsAvailabilityZones
                      min={min}
                      max={max}
                      zones={this.props.availabilityZones}
                      updateAZValuesInParent={this.updateAZ}
                      isLabels={true}
                    />
                  )}
                  {hasAZLabels && zonesArray.length < 1 && (
                    <p className='danger'>
                      Please select one availability zone.
                    </p>
                  )}
                  {hasAZLabels && zonesArray.length > max && (
                    <p className='danger'>
                      {max} is the maximum you can have. Please uncheck{' '}
                      {zonesArray.length - max} of them.
                    </p>
                  )}
                </AZWrapperDiv>

                {this.state.error && this.errorState()}
              </FlexColumnDiv>
              <hr />
              <ReactCSSTransitionGroup
                transitionAppear={true}
                transitionAppearTimeout={200}
                transitionEnterTimeout={200}
                transitionLeaveTimeout={200}
                transitionName={`login_form--transition`}
              >
                {Object.keys(nodePools).map(npId => (
                  <AddNodePoolWrapperDiv key={npId}>
                    <NodePoolHeading>
                      {nodePools[npId].data.name}
                    </NodePoolHeading>
                    <AddNodePoolFlexColumnDiv>
                      <AddNodePool
                        clusterId={'m0ckd'}
                        releaseVersion={'8.2.0'}
                        informParent={this.updateNodePoolForm}
                        name={nodePools[npId].data.name}
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
                ))}
              </ReactCSSTransitionGroup>
              <Button onClick={this.addNodePoolForm}>
                <i className='fa fa-add-circle' /> ADD NODE POOL
              </Button>
              <hr style={{ margin: '30px 0' }} />
            </WrapperDiv>
            <FlexRowDiv>
              <Button
                bsSize='large'
                bsStyle='primary'
                disabled={!this.isValid()}
                loading={this.state.submitting}
                onClick={this.createCluster}
                type='button'
              >
                Create Cluster
              </Button>
              <Button
                bsSize='large'
                bsStyle='default'
                loading={this.state.submitting}
                onClick={this.props.closeForm}
                style={{ background: 'red' }}
                type='button'
              >
                Cancel
              </Button>
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
};

function mapStateToProps(state) {
  let availabilityZones = state.app.info.general.availability_zones.zones;
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
