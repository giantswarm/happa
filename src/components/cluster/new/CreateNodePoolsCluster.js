import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { hasAppropriateLength } from 'lib/helpers';
import { Input } from 'styles/index';
// import { nodePoolCreate } from 'actions/nodePoolActions';
import AddNodePoolsAvailabilityZones from '../detail/AddNodePoolsAvailabilityZones';
import AvailabilityZonesLabels from 'UI/availability_zones_labels';
import Button from 'UI/button';
import DocumentTitle from 'react-document-title';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReleaseSelector from './ReleaseSelector';
import styled from '@emotion/styled';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

const WrapperDiv = styled.div`
  h1 {
    padding-bottom: 45px;
    border-bottom: 1px solid #3a5f7b;
    margin-bottom: 25px;
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
  margin-left: 24px;
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

class CreateNodePoolsCluster extends Component {
  state = {
    name: {
      value: 'Unnamed Cluster',
      valid: true,
      validationError: '',
    },
    releaseVersion: '',
    submitting: false,
    valid: false,
    error: false,
    availabilityZonesIsLabels: false, // false = 'automatically', true = 'distinct'
    // QUESTION Which value are we going to pass here??
    // no input field in the wireframes
    availabilityZonesAutmatically: {
      value: 1,
      valid: true,
    },
    availabilityZonesLabels: {
      number: 0,
      zonesString: '',
      zonesArray: [],
      valid: false,
    },
  };

  updateName = event => {
    const name = event.target.value;
    const [isValid, message] = hasAppropriateLength(name, 4, 100);

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

  isValid() {
    // Not checking release version as we would be checking it before accessing this form
    // and sending user too the v4 form if NPs aren't supported
    const { name } = this.state;

    if (name.valid) return true;
    return false;
  }

  createCluster = () => {
    this.setState({ submitting: true });

    // this.props
    //   .dispatch(
    //     nodePoolCreate(this.props.clusterId, {
    //       name: this.state.name,
    //     })
    //   )
    //   .then(() => {
    //     this.props.closeForm();
    //   })
    //   .catch(error => {
    //     var errorMessage = '';

    //     if (error.body && error.body.message) {
    //       errorMessage = error.body.message;
    //     }

    //     this.setState({
    //       submitting: false,
    //       error: error,
    //       errorMessage: errorMessage,
    //     });
    //   });
  };

  selectRelease = releaseVersion => {
    this.setState({
      releaseVersion,
    });
    this.props.informParent(releaseVersion);
  };

  updateAvailabilityZonesIsLabels = availabilityZonesIsLabels => {
    this.setState({ availabilityZonesIsLabels }, () =>
      console.log(this.state.availabilityZonesIsLabels)
    );
    console.log('hey');
  };

  updateAvailabilityZones = payload => {
    if (this.state.availabilityZonesIsLabels) {
      this.setState({ availabilityZonesLabels: payload });
    }
    // else {
    //   this.setState({ availabilityZonesPicker: payload });
    // }
  };

  render() {
    const { availabilityZonesIsLabels } = this.state;

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
          <WrapperDiv data-testid='nodepool-cluster-creation-view'>
            <div className='row'>
              <div className='col-12'>
                <h1>Create a Cluster</h1>
              </div>
            </div>

            <WrapperDiv>
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
                        className={`fake-radio-checked ${availabilityZonesIsLabels ===
                          false && 'visible'}`}
                      />
                    </div>
                    <input
                      type='radio'
                      id='automatically'
                      value={false}
                      checked={availabilityZonesIsLabels === false}
                      onChange={() =>
                        this.updateAvailabilityZonesIsLabels(false)
                      }
                      tabIndex='0'
                    />
                    <label
                      htmlFor='automatically'
                      onClick={() =>
                        this.updateAvailabilityZonesIsLabels(false)
                      }
                    >
                      Select automatically
                    </label>
                  </div>
                  {/* Distinct AZ */}
                  <div>
                    <div className='fake-radio'>
                      <div
                        className={`fake-radio-checked ${availabilityZonesIsLabels ===
                          true && 'visible'}`}
                      />
                    </div>
                    <input
                      type='radio'
                      id='distinct'
                      value={true}
                      checked={availabilityZonesIsLabels === true}
                      tabIndex='0'
                      onChange={() =>
                        this.updateAvailabilityZonesIsLabels(true)
                      }
                    />
                    <label
                      htmlFor='distinct'
                      onClick={() => this.updateAvailabilityZonesIsLabels(true)}
                    >
                      Use distinct availability zone
                    </label>
                  </div>
                </RadioGroupDiv>
                {/* <AZWrapperDiv> */}
                {availabilityZonesIsLabels === true && (
                  <AddNodePoolsAvailabilityZones
                    min={window.config.availabilityZonesLimits.min}
                    max={window.config.availabilityZonesLimits.max}
                    zones={this.props.availabilityZones}
                    updateAZValuesInParent={this.updateAvailabilityZones}
                    updateIsLabelsInParent={() => {}}
                  />
                  // <AvailabilityZonesLabels
                  //   zones={this.props.availabilityZones}
                  //   onToggleChecked={() => {}}
                  // />
                )}
                {/* </AZWrapperDiv> */}

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
              </FlexColumnDiv>
            </WrapperDiv>
          </WrapperDiv>
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
