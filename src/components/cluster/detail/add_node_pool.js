import { connect } from 'react-redux';
import AWSInstanceTypeSelector from '../new/aws_instance_type_selector';
import Button from 'UI/button';
import NodeCountSelector from 'shared/node_count_selector';
import NumberPicker from 'UI/number_picker';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from '@emotion/styled';

const WrapperDiv = styled.div`
  background-color: ${props => props.theme.colors.shade7};
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 40px;
  h3 {
    margin-bottom: 20px;
  }
`;

const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin-bottom: 13px;
  & > div:nth-of-type(2) > button {
    padding-top: 9px;
    padding-bottom: 9px;
  }
  button {
    margin-right: 16px;
  }
  .availability-zones & {
    margin-bottom: 20px;
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
  & > input {
    /* margin-bottom: 13px !important; */
  }
  p {
    margin: 0;
    font-size: 14px;
    color: ${props => props.theme.colors.white1};
  }
  a {
    text-decoration: underline;
  }
  /* Overrides for AWSInstanceTypeSelector */
  .textfield label,
  .textfield,
  .textfield input {
    margin: 0;
  }
  label[for='instance-type'] p {
    margin-top: 14px;
  }
  /* Overrides for NumberPicker */
  .availability-zones {
    & > div > div,
    & > div > div > div {
      margin: 0;
    }
    & div > p {
      font-size: 16px;
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

class AddNodePool extends Component {
  state = {
    isNameBeingEdited: false,
    name: '',
    availabilityZonesPicker: {
      value: 1,
      valid: true,
    },
    releaseVersion: '',
    scaling: {
      automatic: false,
      min: 3,
      minValid: true,
      max: 3,
      maxValid: true,
    },
    submitting: false,
    valid: false, // Start off invalid now since we're not sure we have a valid release yet, the release endpoint could be malfunctioning.
    error: false,
    aws: {
      instanceType: {
        valid: true,
        value: this.props.defaultInstanceType,
      },
    },
    awsInstanceTypes: {},
    // azure: {
    //   vmSize: {
    //     valid: true,
    //     value: this.props.defaultVMSize,
    //   },
    // },
    // kvm: {
    //   cpuCores: {
    //     value: this.props.defaultCPUCores,
    //     valid: true,
    //   },
    //   memorySize: {
    //     value: this.props.defaultMemorySize,
    //     valid: true,
    //   },
    //   diskSize: {
    //     value: this.props.defaultDiskSize,
    //     valid: true,
    //   },
    // },
  };

  componentDidMount() {
    const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);
    // this.setState({ awsInstanceTypes });
    this.setState(
      produce(draft => {
        draft.awsInstanceTypes = awsInstanceTypes;
      })
    );
  }

  updateName = event => {
    this.setState({
      name: event.target.value,
    });
  };

  updateAWSInstanceType = event =>
    this.setState({ aws: { instanceType: event } });

  updateAvailabilityZonesPicker = n => {
    this.setState({
      availabilityZonesPicker: {
        value: n.value,
        valid: n.valid,
      },
    });
  };

  produceRAMAndCores = () => {
    const instanceType = this.state.aws.instanceType.value;
    // Check whether this.state.instanceTypes is populated and that instance name
    // in input matches an instance in the array
    const instanceTypesKeys = Object.keys(this.state.awsInstanceTypes);
    const hasInstances =
      instanceTypesKeys.length > 0 &&
      instanceTypesKeys.find(type => type === instanceType);

    const RAM = hasInstances
      ? this.state.awsInstanceTypes[instanceType].memory_size_gb
      : '0';
    const CPUCores = hasInstances
      ? this.state.awsInstanceTypes[instanceType].cpu_cores
      : '0';

    return [RAM, CPUCores];
  };

  render() {
    const [RAM, CPUCores] = this.produceRAMAndCores();

    return (
      <WrapperDiv>
        <h3 className='table-label'>Add Node Pool</h3>
        <FlexColumnDiv>
          <label htmlFor='name'>
            <span className='label-span'>Name</span>
            <input
              value={this.state.value}
              onChange={this.updateName}
              id='name'
              type='text'
            ></input>
            <p>
              Pick a name that helps team mates to understand what these nodes
              are here for. You can change this later. Each node pool also gets
              a unique identifier.
            </p>
          </label>
          <label htmlFor='instance-type'>
            <span className='label-span'>Instance type</span>
            <FlexWrapperDiv>
              <AWSInstanceTypeSelector
                allowedInstanceTypes={this.props.allowedInstanceTypes}
                onChange={this.updateAWSInstanceType}
                readOnly={false}
                value={this.state.aws.instanceType.value}
              />
              <p>{`${RAM} CPU cores, ${CPUCores} GB RAM each`}</p>
            </FlexWrapperDiv>
          </label>
          <label className='availability-zones' htmlFor='availability-zones'>
            <span className='label-span'>Availability Zones</span>
            <FlexWrapperDiv>
              <NumberPicker
                label=''
                max={this.props.maxAvailabilityZones}
                min={this.props.minAvailabilityZones}
                onChange={this.updateAvailabilityZonesPicker}
                readOnly={false}
                stepSize={1}
                value={this.state.availabilityZonesPicker.value}
              />
              <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                or <a href='#'>Select distinct availability zones</a>
              </p>
            </FlexWrapperDiv>
            <p>
              Covering one availability zone, the worker nodes of this node pool
              will be placed in the same availability zones as the
              cluster&apos;s master node.
            </p>
          </label>
          <label className='scaling-range' htmlFor='scaling-range'>
            <span className='label-span'>Scaling range</span>
            <NodeCountSelector
              // autoscalingEnabled={this.isScalingAutomatic(
              //   this.props.provider,
              //   this.state.releaseVersion
              // )}
              autoscalingEnabled={true}
              label={{ max: 'MAX', min: 'MIN' }}
              // onChange={this.updateScaling}
              readOnly={false}
              // scaling={this.state.scaling}
              scaling={{
                automatic: false,
                min: 3,
                minValid: true,
                max: 3,
                maxValid: true,
              }}
            />
          </label>
          <FlexWrapperDiv>
            <Button
              bsSize='large'
              bsStyle='primary'
              // disabled={!this.valid()}
              // loading={this.state.submitting}
              // onClick={this.createCluster}
              type='button'
            >
              Create Node Pool
            </Button>
            <Button
              bsSize='large'
              bsStyle='default'
              // disabled={!this.valid()}
              // loading={this.state.submitting}
              // onClick={this.createCluster}
              style={{ background: 'red' }}
              type='button'
            >
              Cancel
            </Button>
          </FlexWrapperDiv>
        </FlexColumnDiv>
      </WrapperDiv>
    );
  }
}

AddNodePool.propTypes = {
  maxAvailabilityZones: PropTypes.number,
  minAvailabilityZones: PropTypes.number,
  allowedInstanceTypes: PropTypes.array,
  allowedVMSizes: PropTypes.array,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  defaultInstanceType: PropTypes.string,
  defaultVMSize: PropTypes.string,
  defaultCPUCores: PropTypes.number,
  defaultMemorySize: PropTypes.number,
  defaultDiskSize: PropTypes.number,
  match: PropTypes.object,
  clusterCreationStats: PropTypes.object,
};

function mapStateToProps(state) {
  var minAvailabilityZones = state.app.info.general.availability_zones.default;
  var maxAvailabilityZones = state.app.info.general.availability_zones.max;
  var selectedOrganization = state.app.selectedOrganization;
  var provider = state.app.info.general.provider;
  var clusterCreationStats = state.app.info.stats.cluster_creation_duration;

  var defaultInstanceType;
  if (
    state.app.info.workers.instance_type &&
    state.app.info.workers.instance_type.default
  ) {
    defaultInstanceType = state.app.info.workers.instance_type.default;
  } else {
    defaultInstanceType = 'm3.large';
  }

  var defaultVMSize;
  if (
    state.app.info.workers.vm_size &&
    state.app.info.workers.vm_size.default
  ) {
    defaultVMSize = state.app.info.workers.vm_size.default;
  } else {
    defaultVMSize = 'Standard_D2s_v3';
  }

  var defaultCPUCores = 4; // TODO
  var defaultMemorySize = 4; // TODO
  var defaultDiskSize = 20; // TODO

  var allowedInstanceTypes = [];
  if (provider === 'aws') {
    allowedInstanceTypes = state.app.info.workers.instance_type.options;
  }

  var allowedVMSizes = [];
  if (provider === 'azure') {
    allowedVMSizes = state.app.info.workers.vm_size.options;
  }

  return {
    minAvailabilityZones,
    maxAvailabilityZones,
    allowedInstanceTypes,
    allowedVMSizes,
    provider,
    defaultInstanceType,
    defaultVMSize,
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
)(AddNodePool);
