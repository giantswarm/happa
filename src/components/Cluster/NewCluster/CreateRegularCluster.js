import styled from '@emotion/styled';
import { CLUSTER_CREATE_REQUEST } from 'actions/actionTypes';
import { batchedClusterCreate } from 'actions/batchedActions';
import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Constants, Providers } from 'shared/constants';
import NodeCountSelector from 'shared/NodeCountSelector';
import { selectErrorByAction } from 'stores/error/selectors';
import Button from 'UI/Button';
import HorizontalLine from 'UI/ClusterCreation/HorizontalLine';
import Section from 'UI/ClusterCreation/Section';
import StyledInput from 'UI/ClusterCreation/StyledInput';
import ErrorFallback from 'UI/ErrorFallback';
import { FlexColumn, FlexRow } from 'UI/FlexDivs';

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

  static getWorkerConfigurationComponent(provider) {
    switch (provider) {
      case Providers.AWS:
        return { component: InstanceTypeSelector, label: 'Instance type' };
      case Providers.AZURE:
        return { component: InstanceTypeSelector, label: 'VM size' };
      case Providers.KVM:
        return {
          component: KVMWorkerConfiguration,
          label: 'Worker configuration',
        };
    }

    return null;
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
      instanceType: this.props.defaultInstanceType,
    },
    azure: {
      vmSize: this.props.defaultVMSize,
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
  };

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

    let worker = {};
    switch (this.props.provider) {
      case Providers.AWS:
        worker = {
          aws: {
            instance_type: this.state.aws.instanceType,
          },
        };
        break;

      case Providers.AZURE:
        worker = {
          azure: {
            vm_size: this.state.azure.vmSize,
          },
        };
        break;

      case Providers.KVM:
        worker = {
          memory: { size_gb: this.state.kvm.memorySize.value },
          storage: { size_gb: this.state.kvm.diskSize.value },
          cpu: { cores: this.state.kvm.cpuCores.value },
        };
        break;
    }
    let workers = new Array(this.state.scaling.min).fill(worker);

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
      workers = [worker];
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
        workers,
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

  setAWSInstanceType = (instanceType) => {
    this.setState({ aws: { instanceType } });
  };

  setAzureVMSize = (vmSize) => {
    this.setState({ azure: { vmSize } });
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

    const {
      component: WorkerConfiguration,
      label: workerConfigurationLabel,
    } = CreateRegularCluster.getWorkerConfigurationComponent(provider);

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
          <Section htmlFor='instance-type'>
            <StyledInput
              inputId='instance-type'
              label={workerConfigurationLabel}
              // regular space, hides hint ;)
              hint={<>&#32;</>}
            >
              <WorkerConfiguration
                selectedInstanceType={
                  provider === Providers.AWS
                    ? this.state.aws.instanceType
                    : this.state.azure.vmSize
                }
                selectInstanceType={
                  provider === Providers.AWS
                    ? this.setAWSInstanceType
                    : this.setAzureVMSize
                }
                cpuCores={this.state.kvm.cpuCores.value}
                diskSize={this.state.kvm.diskSize.value}
                memorySize={this.state.kvm.memorySize.value}
                onUpdateCPUCores={this.updateCPUCores}
                onUpdateDiskSize={this.updateDiskSize}
                onUpdateMemorySize={this.updateMemorySize}
              />
            </StyledInput>
          </Section>
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
};

CreateRegularCluster.propTypes = {
  clusterName: PropTypes.string,
  allowSubmit: PropTypes.bool,
  minAvailabilityZones: PropTypes.number,
  maxAvailabilityZones: PropTypes.number,
  maxWorkersPerCluster: PropTypes.number,
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
