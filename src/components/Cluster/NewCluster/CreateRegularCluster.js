import styled from '@emotion/styled';
import { CLUSTER_CREATE_REQUEST } from 'actions/actionTypes';
import { batchedClusterCreate } from 'actions/batchedActions';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { selectErrorByAction } from 'selectors/clusterSelectors';
import { Constants, Providers } from 'shared/constants';
import NodeCountSelector from 'shared/NodeCountSelector';
import Button from 'UI/Button';
import HorizontalLine from 'UI/ClusterCreation/HorizontalLine';
import { InstanceTypeDescription } from 'UI/ClusterCreation/InstanceTypeSelection';
import Section from 'UI/ClusterCreation/Section';
import StyledInput from 'UI/ClusterCreation/StyledInput';
import ErrorFallback from 'UI/ErrorFallback';
import { FlexColumn, FlexRow, FlexWrapperDiv } from 'UI/FlexDivs';

import AWSInstanceTypeSelector from './AWSInstanceTypeSelector';
import AzureVMSizeSelector from './AzureVMSizeSelector';
import ClusterCreationDuration from './ClusterCreationDuration';
import KVMWorkerConfiguration from './KVMWorkerConfiguration';
import ProviderCredentials from './ProviderCredentials';
import V4AvailabilityZonesSelector from './V4AvailabilityZonesSelector';

const WrapperDiv = styled.div`
  .worker-nodes {
    position: absolute;
    left: 0;
    font-weight: 700;
  }
  .availability-zones {
    input {
      font-weight: 400;
    }
  }
  .instance-type {
    /* Same margin-bottom as <Section /> */
    margin-bottom: ${({ theme }) => theme.spacingPx * 8}px;
    input {
      font-weight: 400;
    }
  }
  .scaling-range {
    form {
      label {
        margin-bottom: 7px;
        color: ${(props) => props.theme.colors.white1};
        font-weight: 400;
      }
    }
  }
`;

class CreateRegularCluster extends React.Component {
  static isScalingAutomatic(provider) {
    return provider === Providers.AWS;
  }

  static getMultiAZSelectorProps(provider, currentReleaseVersion) {
    const multiAZSelectorProps = {};

    if (provider === Providers.AZURE) {
      multiAZSelectorProps.requiredReleaseVersion =
        Constants.AZURE_MULTI_AZ_VERSION;
      multiAZSelectorProps.currentReleaseVersion = currentReleaseVersion;
    }

    return multiAZSelectorProps;
  }

  state = {
    availabilityZonesPicker: {
      value: 1,
      valid: true,
    },
    // eslint-disable-next-line react/no-unused-state
    releaseVersion: this.props.selectedRelease,
    scaling: {
      automatic: false,
      min: 3,
      minValid: true,
      max: 3,
      maxValid: true,
    },
    submitting: false,
    // eslint-disable-next-line react/no-unused-state
    valid: false, // Start off invalid now since we're not sure we have a valid release yet, the release endpoint could be malfunctioning.
    error: false,
    aws: {
      instanceType: {
        valid: true,
        value: this.props.defaultInstanceType,
      },
    },
    azure: {
      vmSize: {
        valid: true,
        value: this.props.defaultVMSize,
      },
    },
    kvm: {
      cpuCores: {
        value: this.props.defaultCPUCores,
        valid: true,
      },
      memorySize: {
        value: this.props.defaultMemorySize,
        valid: true,
      },
      diskSize: {
        value: this.props.defaultDiskSize,
        valid: true,
      },
    },
    awsInstanceTypes: {},
    azureInstanceTypes: {},
  };

  componentDidMount() {
    this.setState({
      awsInstanceTypes: JSON.parse(window.config.awsCapabilitiesJSON),
      azureInstanceTypes: JSON.parse(window.config.azureCapabilitiesJSON),
    });
  }

  updateAvailabilityZonesPicker = (n) => {
    this.setState({
      availabilityZonesPicker: {
        value: n.value,
        valid: n.valid,
      },
    });
  };

  updateScaling = (nodeCountSelector) => {
    this.setState({
      scaling: {
        min: nodeCountSelector.scaling.min,
        minValid: nodeCountSelector.scaling.minValid,
        max: nodeCountSelector.scaling.max,
        maxValid: nodeCountSelector.scaling.maxValid,
      },
    });
  };

  createCluster = () => {
    this.setState({ submitting: true });

    let i = 0;
    let workers = [];

    // TODO/FYI: This IF / ELSE on this.props.provider is a antipattern that
    // will spread throughout the codebase if we are not careful. I am waiting
    // for the 'third' cluster type that we support to be able to make decisions
    // about a meaningful abstraction. For now, going with a easy solution.

    if (this.props.provider === Providers.AWS) {
      for (i = 0; i < this.state.scaling.min; i++) {
        workers.push({
          aws: {
            instance_type: this.state.aws.instanceType.value,
          },
        });
      }
    } else if (this.props.provider === Providers.AZURE) {
      for (i = 0; i < this.state.scaling.min; i++) {
        workers.push({
          azure: {
            vm_size: this.state.azure.vmSize.value,
          },
        });
      }
    } else {
      for (i = 0; i < this.state.scaling.min; i++) {
        workers.push({
          memory: { size_gb: this.state.kvm.memorySize.value },
          storage: { size_gb: this.state.kvm.diskSize.value },
          cpu: { cores: this.state.kvm.cpuCores.value },
        });
      }
    }

    // Adjust final workers array when cluster uses auto scaling. This is currently
    // only in AWS and from release 6.1.0 onwards.
    if (
      CreateRegularCluster.isScalingAutomatic(
        this.props.provider,
        this.props.selectedRelease
      ) &&
      workers.length > 1
    ) {
      // Only one worker is allowed to be present when auto scaling is enabled.
      const firstWorker = workers[0];
      workers = [];
      workers.push(firstWorker);
    }

    this.props.dispatch(
      batchedClusterCreate({
        availability_zones: this.state.availabilityZonesPicker.value,
        scaling: {
          min: this.state.scaling.min,
          max: this.state.scaling.max,
        },
        name: this.props.clusterName,
        owner: this.props.selectedOrganization,
        release_version: this.props.selectedRelease,
        workers: workers,
      })
    );
  };

  errorState() {
    return (
      <div className='new-cluster-error flash-messages--flash-message flash-messages--danger'>
        <b>Something went wrong while trying to create your cluster.</b>
        <br />
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
        <br />
        {this.state.errorMessage !== '' ? (
          <pre>{this.state.errorMessage}</pre>
        ) : undefined}
      </div>
    );
  }

  updateAWSInstanceType = (value) => {
    this.setState({
      aws: {
        instanceType: {
          value: value.value,
          valid: value.valid,
        },
      },
    });
  };

  updateVMSize = (value) => {
    this.setState({
      azure: {
        vmSize: {
          value: value.value,
          valid: value.valid,
        },
      },
    });
  };

  updateCPUCores = (value) => {
    this.setState((prevState) => ({
      kvm: {
        cpuCores: {
          value: value.value,
          valid: value.valid,
        },
        memorySize: prevState.kvm.memorySize,
        diskSize: prevState.kvm.diskSize,
      },
    }));
  };

  updateMemorySize = (value) => {
    this.setState((prevState) => ({
      kvm: {
        cpuCores: prevState.kvm.cpuCores,
        memorySize: {
          value: value.value,
          valid: value.valid,
        },
        diskSize: prevState.kvm.diskSize,
      },
    }));
  };

  updateDiskSize = (value) => {
    this.setState((prevState) => ({
      kvm: {
        cpuCores: prevState.kvm.cpuCores,
        memorySize: prevState.kvm.memorySize,
        diskSize: {
          value: value.value,
          valid: value.valid,
        },
      },
    }));
  };

  produceRAMAndCoresAWS = () => {
    const { awsInstanceTypes } = this.state;
    const instanceType = this.state.aws.instanceType.value;

    // Check whether this.state.awsInstanceTypes is populated and that instance name
    // in input matches an instance in the array
    const instanceTypesKeys = Object.keys(awsInstanceTypes);

    const hasInstances =
      instanceTypesKeys && instanceTypesKeys.includes(instanceType);

    const RAM = hasInstances
      ? awsInstanceTypes[instanceType].memory_size_gb
      : '0';
    const CPUCores = hasInstances
      ? awsInstanceTypes[instanceType].cpu_cores
      : '0';

    return [RAM, CPUCores];
  };

  produceRAMAndCoresAzure = () => {
    const { azureInstanceTypes } = this.state;
    const instanceType = this.state.azure.vmSize.value;

    // Check whether this.state.azureInstanceTypes is populated and that instance name
    // in input matches an instance in the array
    const instanceTypesKeys = Object.keys(azureInstanceTypes);

    const hasInstances =
      instanceTypesKeys && instanceTypesKeys.includes(instanceType);

    const RAM = hasInstances
      ? // eslint-disable-next-line no-magic-numbers
        (azureInstanceTypes[instanceType].memoryInMb / 1000).toFixed(2)
      : '0';
    const CPUCores = hasInstances
      ? azureInstanceTypes[instanceType].numberOfCores
      : '0';

    return [RAM, CPUCores];
  };

  valid() {
    if (!this.props.allowSubmit) return false;

    // If any of the releaseVersion hasn't been set yet, return false
    if (!this.props.selectedRelease) return false;

    // If the availabilityZonesPicker is invalid, return false
    if (!this.state.availabilityZonesPicker.valid) return false;

    // If the min scaling numberpicker is invalid, return false
    if (!this.state.scaling.minValid) return false;

    // If the max scaling numberpickers is invalid, return false
    if (!this.state.scaling.maxValid) return false;

    // If the aws instance type is invalid, return false
    if (!this.state.aws.instanceType.valid) return false;

    if (!this.state.azure.vmSize.valid) return false;

    // If the kvm worker is invalid, return false
    if (
      !(
        this.state.kvm.cpuCores.valid &&
        this.state.kvm.memorySize.valid &&
        this.state.kvm.diskSize.valid
      )
    ) {
      return false;
    }

    return true;
  }

  render() {
    const { provider } = this.props;

    const multiAZSelectorProps = CreateRegularCluster.getMultiAZSelectorProps(
      provider,
      this.props.selectedRelease
    );

    return (
      <WrapperDiv data-testid='cluster-creation-view'>
        <HorizontalLine />

        <FlexColumn>
          <div className='worker-nodes'>Worker nodes</div>
          {(provider === Providers.AWS || provider === Providers.AZURE) && (
            <V4AvailabilityZonesSelector
              minValue={this.props.minAvailabilityZones}
              maxValue={this.props.maxAvailabilityZones}
              onChange={this.updateAvailabilityZonesPicker}
              {...multiAZSelectorProps}
            />
          )}
          <label htmlFor='instance-type' className='instance-type'>
            {(() => {
              switch (provider) {
                case Providers.AWS: {
                  const [RAM, CPUCores] = this.produceRAMAndCoresAWS();

                  return (
                    <StyledInput
                      inputId='instance-type'
                      label='Instance type'
                      // regular space, hides hint ;)
                      hint={<>&#32;</>}
                    >
                      <FlexWrapperDiv>
                        <AWSInstanceTypeSelector
                          allowedInstanceTypes={this.props.allowedInstanceTypes}
                          onChange={this.updateAWSInstanceType}
                          readOnly={false}
                          value={this.state.aws.instanceType.value}
                        />
                        <InstanceTypeDescription>{`${CPUCores} CPU cores, ${RAM} GB RAM each`}</InstanceTypeDescription>
                      </FlexWrapperDiv>
                    </StyledInput>
                  );
                }
                case Providers.KVM:
                  return (
                    <Section>
                      <KVMWorkerConfiguration
                        cpuCores={this.state.kvm.cpuCores.value}
                        diskSize={this.state.kvm.diskSize.value}
                        memorySize={this.state.kvm.memorySize.value}
                        onUpdateCPUCores={this.updateCPUCores}
                        onUpdateDiskSize={this.updateDiskSize}
                        onUpdateMemorySize={this.updateMemorySize}
                      />
                    </Section>
                  );
                case Providers.AZURE: {
                  const [RAM, CPUCores] = this.produceRAMAndCoresAzure();

                  return (
                    <StyledInput
                      inputId='instance-type'
                      label='VM Size'
                      // regular space, hides hint ;)
                      hint={<>&#32;</>}
                    >
                      <FlexWrapperDiv>
                        <AzureVMSizeSelector
                          allowedVMSizes={this.props.allowedVMSizes}
                          onChange={this.updateVMSize}
                          readOnly={false}
                          value={this.state.azure.vmSize.value}
                        />
                        <InstanceTypeDescription>{`${CPUCores} CPU cores, ${RAM} GB RAM each`}</InstanceTypeDescription>
                      </FlexWrapperDiv>
                    </StyledInput>
                  );
                }
              }

              return null;
            })()}
          </label>
          <Section className='scaling-range' htmlFor='scaling-range'>
            <StyledInput
              inputId='scaling-range'
              label='Number of worker nodes'
              // regular space, hides hint ;)
              hint={<>&#32;</>}
            >
              <NodeCountSelector
                autoscalingEnabled={CreateRegularCluster.isScalingAutomatic(
                  provider,
                  this.props.selectedRelease
                )}
                maxValue={this.props.maxWorkersPerCluster}
                onChange={this.updateScaling}
                readOnly={false}
                scaling={this.state.scaling}
              />
              <ProviderCredentials
                organizationName={this.props.selectedOrganization}
                provider={provider}
              />
              {this.state.error && this.errorState()}
            </StyledInput>
          </Section>
        </FlexColumn>

        <HorizontalLine />

        <FlexRow>
          <ErrorFallback error={this.props.clusterCreateError}>
            <Button
              bsSize='large'
              bsStyle='primary'
              disabled={!this.valid()}
              loading={this.state.submitting}
              onClick={this.createCluster}
              type='submit'
            >
              Create Cluster
            </Button>
          </ErrorFallback>
          {!this.state.submitting && (
            <Button
              bsSize='large'
              bsStyle='default'
              loading={this.state.submitting}
              onClick={this.props.closeForm}
              type='button'
            >
              Cancel
            </Button>
          )}
        </FlexRow>
        <FlexColumn>
          <ClusterCreationDuration stats={this.props.clusterCreationStats} />
        </FlexColumn>
      </WrapperDiv>
    );
  }
}

CreateRegularCluster.defaultProps = {
  defaultInstanceType: 'm3.large',
  defaultVMSize: 'Standard_D2s_v3',
  defaultCPUCores: 4,
  defaultMemorySize: 4,
  defaultDiskSize: 20,
  allowedInstanceTypes: [],
  allowedVMSizes: [],
};

CreateRegularCluster.propTypes = {
  clusterName: PropTypes.string,
  allowSubmit: PropTypes.bool,
  minAvailabilityZones: PropTypes.number,
  maxAvailabilityZones: PropTypes.number,
  maxWorkersPerCluster: PropTypes.number,
  allowedInstanceTypes: PropTypes.array,
  allowedVMSizes: PropTypes.array,
  selectedOrganization: PropTypes.string,
  selectedRelease: PropTypes.string,
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  defaultInstanceType: PropTypes.string,
  defaultVMSize: PropTypes.string,
  defaultCPUCores: PropTypes.number,
  defaultMemorySize: PropTypes.number,
  defaultDiskSize: PropTypes.number,
  closeForm: PropTypes.func,
  clusterCreationStats: PropTypes.object,
  clusterCreateError: PropTypes.string,
};

function mapStateToProps(state) {
  const provider = state.main.info.general.provider;
  const propsToPush = {
    minAvailabilityZones: state.main.info.general.availability_zones.default,
    maxAvailabilityZones: state.main.info.general.availability_zones.max,
    clusterCreationStats: state.main.info.stats.cluster_creation_duration,
    provider,
  };

  if (
    state.main.info.workers.instance_type &&
    state.main.info.workers.instance_type.default
  ) {
    propsToPush.defaultInstanceType =
      state.main.info.workers.instance_type.default;
  }

  if (
    state.main.info.workers.vm_size &&
    state.main.info.workers.vm_size.default
  ) {
    propsToPush.defaultVMSize = state.main.info.workers.vm_size.default;
  }

  if (provider === Providers.AWS) {
    propsToPush.allowedInstanceTypes =
      state.main.info.workers.instance_type.options;
  }

  if (provider === Providers.AZURE) {
    propsToPush.allowedVMSizes = state.main.info.workers.vm_size.options;
  }

  if (state.main.info.workers.count_per_cluster.max) {
    propsToPush.maxWorkersPerCluster =
      state.main.info.workers.count_per_cluster.max;
  }

  return {
    ...propsToPush,
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
)(CreateRegularCluster);
