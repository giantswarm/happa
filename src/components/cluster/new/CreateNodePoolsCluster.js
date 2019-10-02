import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { nodePoolCreate } from 'actions/nodePoolActions';
// import AddNodePoolsAvailabilityZones from '../detail/AddNodePoolsAvailabilityZones';
// import AWSInstanceTypeSelector from '../new/aws_instance_type_selector';
import Button from 'UI/button';
import DocumentTitle from 'react-document-title';
// import NodeCountSelector from 'shared/node_count_selector';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReleaseSelector from './release_selector';
import styled from '@emotion/styled';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

const WrapperDiv = styled.div`
  h1 {
    padding-bottom: 45px;
    border-bottom: 1px solid #3a5f7b;
    margin-bottom: 25px;
  }
`;

const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 13px;
  & > div:nth-of-type(2) > button {
    padding-top: 9px;
    padding-bottom: 9px;
  }
  button {
    margin-right: 16px;
  }
  .availability-zones & {
    margin-bottom: 22px;
  }
  p {
    margin-left: 15px;
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
  input {
    box-sizing: border-box;
    width: 100%;
    background-color: ${props => props.theme.colors.shade5};
    padding: 11px 10px;
    outline: 0;
    color: ${props => props.theme.colors.whiteInput};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.colors.shade6};
    padding-left: 15px;
    line-height: normal;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: ${props => props.theme.colors.white1};
  }
  a {
    text-decoration: underline;
  }
  /* Name input */
  .name-container {
    position: relative;
    margin-bottom: 23px;
  }
  input[id='name'] {
    margin-bottom: 0;
  }
  /* Overrides for AWSInstanceTypeSelector */
  .textfield label,
  .textfield,
  .textfield input {
    margin: 0;
  }
  /* Overrides for NumberPicker */
  .availability-zones {
    & > div > div,
    & > div > div > div {
      margin: 0;
    }
  }
  .scaling-range {
    form {
      label {
        margin-bottom: 7px;
        color: ${props => props.theme.colors.white1};
        font-weight: 400;
      }
      & > div:nth-of-type(2) {
        display: none;
      }
    }
  }
`;

class CreateNodePoolsCluster extends Component {
  state = {
    isNameBeingEdited: false,
    name: {
      value: 'Unnamed Cluster',
      valid: true,
      validationError: '',
    },
    availabilityZonesPicker: {
      value: 1,
      valid: true,
    },
    availabilityZonesLabels: {
      number: 0,
      zonesString: '',
      zonesArray: [],
      valid: false,
    },
    availabilityZonesIsLabels: false,
    releaseVersion: '',
    scaling: {
      automatic: false,
      min: 3,
      minValid: true,
      max: 10,
      maxValid: true,
    },
    submitting: false,
    valid: false,
    error: false,
    aws: {
      instanceType: {
        valid: true,
        value: this.props.defaultInstanceType,
      },
    },
    awsInstanceTypes: {},
  };

  componentDidMount() {
    const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);
    this.setState({ awsInstanceTypes });
  }

  updateName = event => {
    const name = event.target.value;
    const exceededMaximumCharacters = name.length > 100;
    const isValid = exceededMaximumCharacters ? false : true;
    const message = isValid
      ? ''
      : 'Name must not contain more than 100 characters';

    // We don't let the user write more characters if the name exceeds the max number allowed
    if (exceededMaximumCharacters) {
      this.setState(
        produce(draft => {
          draft.name.validationError = message;
        })
      );
      return;
    }

    this.setState(
      produce(draft => {
        draft.name.valid = isValid;
        draft.name.value = name;
        draft.name.validationError = message;
      })
    );
  };

  updateAWSInstanceType = payload => {
    this.setState(
      produce(draft => {
        draft.aws.instanceType = payload;
      })
    );
  };

  updateAvailabilityZonesIsLabels = availabilityZonesIsLabels =>
    this.setState({ availabilityZonesIsLabels });

  updateAvailabilityZones = payload => {
    if (this.state.availabilityZonesIsLabels) {
      this.setState({ availabilityZonesLabels: payload });
    } else {
      this.setState({ availabilityZonesPicker: payload });
    }
  };

  updateScaling = nodeCountSelector => {
    this.setState({ scaling: nodeCountSelector.scaling });
  };

  // Always true?
  isScalingAutomatic = () => true;

  isValid() {
    // Not checking release version as we would be checking it before accessing this form
    // and sending user too the v4 form if NPs aren't supported
    const {
      availabilityZonesPicker,
      availabilityZonesLabels,
      availabilityZonesIsLabels,
      scaling,
      aws,
      name,
    } = this.state;

    // Should we check the validity of the release somewhere?
    if (
      scaling.minValid &&
      scaling.maxValid &&
      aws.instanceType.valid &&
      name.valid &&
      ((availabilityZonesIsLabels && availabilityZonesLabels.valid) ||
        (!availabilityZonesIsLabels && availabilityZonesPicker.valid))
    ) {
      return true;
    }

    return false;
  }

  createNodePool = () => {
    this.setState({ submitting: true });

    this.props
      .dispatch(
        nodePoolCreate(this.props.clusterId, {
          // TODO Is the endpoint expecting to receive either a string or a number??
          availabilityZones: this.state.availabilityZonesIsLabels
            ? this.state.availabilityZonesLabels.zonesString
            : this.state.availabilityZonesPicker.value,
          scaling: {
            min: this.state.scaling.min,
            max: this.state.scaling.max,
          },
          name: this.state.name,
          nodeSpec: {
            aws: {
              instance_type: this.state.aws.instanceType.value,
            },
          },
        })
      )
      .then(() => {
        this.props.closeForm();
      })
      .catch(error => {
        var errorMessage = '';

        if (error.body && error.body.message) {
          errorMessage = error.body.message;
        }

        this.setState({
          submitting: false,
          error: error,
          errorMessage: errorMessage,
        });
      });
  };

  toggleAZ = () => this.setState(state => ({ AZToggle: !state.AZToggle }));

  selectRelease = releaseVersion => {
    this.setState({
      releaseVersion,
    });
    this.props.informParent(releaseVersion);
  };

  render() {
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
          <WrapperDiv
            // className='new-cluster'
            data-testid='nodepool-cluster-creation-view'
          >
            <div className='row'>
              <div className='col-12'>
                <h1>Create a Cluster</h1>
              </div>
            </div>

            <WrapperDiv>
              <FlexColumnDiv>
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
                <label className='instance-type' htmlFor='release-version'>
                  <span className='label-span'>Release version</span>
                  <FlexWrapperDiv>
                    <ReleaseSelector selectRelease={this.selectRelease} />
                  </FlexWrapperDiv>
                </label>
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
