import styled from '@emotion/styled';
import {
  CLUSTER_CREATE_REQUEST,
  RELEASES_LOAD_REQUEST,
} from 'actions/actionTypes';
import { batchedClusterCreate } from 'actions/batchedActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { selectErrorByAction } from 'selectors/clusterSelectors';
import { Constants, Providers } from 'shared/constants';
import NodeCountSelector from 'shared/NodeCountSelector';
import Button from 'UI/Button';
import ErrorFallback from 'UI/ErrorFallback';
import NumberPicker from 'UI/NumberPicker';

import AWSInstanceTypeSelector from './AWSInstanceTypeSelector';
import AzureVMSizeSelector from './AzureVMSizeSelector';
import ClusterCreationDuration from './ClusterCreationDuration';
import { FlexColumnDiv, Wrapper } from './CreateNodePoolsCluster';
import ProviderCredentials from './ProviderCredentials';
import ReleaseSelector from './ReleaseSelector';
import V4AvailabilityZonesSelector from './V4AvailabilityZonesSelector';

const WrapperDiv = styled.div`
  ${Wrapper}
  .worker-nodes {
    position: absolute;
    left: 0;
    font-weight: 700;
  }
  .textfield label,
  .textfield,
  .textfield input {
    margin: 0;
  }
  .availability-zones {
    margin-bottom: 8px;
    .label-span {
      margin-bottom: 7px;
    }
  }
  .scaling-range {
    margin-bottom: 0;
    form {
      label {
        margin-bottom: 7px;
        color: ${(props) => props.theme.colors.white1};
        font-weight: 400;
      }
    }
  }
`;

const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  p {
    margin-left: 15px;
  }
`;

const ErrorFallbackStyled = styled(ErrorFallback)`
  margin-bottom: 15px;
  line-height: 1.2em;
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
    clusterName: this.props.clusterName,
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
    this.clusterNameInput.select();
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

  updateClusterName = (event) => {
    const clusterName = event.target.value;
    this.setState({ clusterName });
    this.props.updateClusterNameInParent(clusterName);
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
        name:
          this.state.clusterName === ''
            ? 'Unnamed cluster'
            : this.state.clusterName,
        owner: this.props.selectedOrganization,
        release_version: this.props.selectedRelease,
        workers: workers,
      })
    );
  };

  selectRelease = (releaseVersion) => {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
      releaseVersion,
    });
    this.props.informParent(releaseVersion);
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
    // If no releases, the form can't be valid.
    if (this.props.releasesLoadError) return false;

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

    const noReleasesErrorText = this.props.releasesLoadError
      ? `The cluster can't be created because there is no active release currently availabe for this platform.`
      : null;

    return (
      <Breadcrumb
        data={{ title: 'CREATE CLUSTER', pathname: this.props.match.url }}
      >
        <DocumentTitle
          title={`Create Cluster | ${this.props.selectedOrganization}`}
        >
          <WrapperDiv data-testid='cluster-creation-view'>
            <h1>Create a Cluster</h1>

            <FlexColumnDiv>
              <label htmlFor='name'>
                <span className='label-span'>Name</span>
                <div className='name-container'>
                  <input
                    autoFocus
                    onChange={this.updateClusterName}
                    ref={(i) => {
                      this.clusterNameInput = i;
                    }}
                    type='text'
                    id='name'
                    value={this.state.clusterName}
                    placeholder={
                      this.state.clusterName === '' ? 'Unnamed cluster' : null
                    }
                  />
                </div>
                <p>Give your cluster a name to recognize it among others.</p>
              </label>

              <label htmlFor='name'>
                <span className='label-span'>Release version</span>
                <ReleaseSelector
                  selectRelease={this.selectRelease}
                  selectedRelease={this.props.selectedRelease}
                  selectableReleases={this.props.selectableReleases}
                  releases={this.props.releases}
                  activeSortedReleases={this.props.activeSortedReleases}
                />
              </label>
            </FlexColumnDiv>

            <hr style={{ margin: '0 0 35px' }} />

            <FlexColumnDiv>
              <div className='worker-nodes'>Worker nodes</div>
              {(provider === Providers.AWS || provider === Providers.AZURE) && (
                <V4AvailabilityZonesSelector
                  minValue={this.props.minAvailabilityZones}
                  maxValue={this.props.maxAvailabilityZones}
                  onChange={this.updateAvailabilityZonesPicker}
                  {...multiAZSelectorProps}
                />
              )}
              <label htmlFor='instance-type'>
                {(() => {
                  switch (provider) {
                    case Providers.AWS: {
                      const [RAM, CPUCores] = this.produceRAMAndCoresAWS();

                      return (
                        <>
                          <span className='label-span'>Instance Type</span>
                          <FlexWrapperDiv>
                            <AWSInstanceTypeSelector
                              allowedInstanceTypes={
                                this.props.allowedInstanceTypes
                              }
                              onChange={this.updateAWSInstanceType}
                              readOnly={false}
                              value={this.state.aws.instanceType.value}
                            />
                            <p>{`${CPUCores} CPU cores, ${RAM} GB RAM each`}</p>
                          </FlexWrapperDiv>
                        </>
                      );
                    }
                    case Providers.KVM:
                      return (
                        <>
                          <span className='label-span'>
                            Worker Configuration
                          </span>
                          <p>
                            Configure the amount of CPU, RAM and Storage for
                            your workers. The storage size specified will apply
                            to both the kubelet and the Docker volume of the
                            node, so please make sure to have twice the
                            specified size available as disk space.
                          </p>

                          <NumberPicker
                            label='CPU Cores'
                            max={999}
                            min={2}
                            onChange={this.updateCPUCores}
                            stepSize={1}
                            value={this.state.kvm.cpuCores.value}
                          />
                          <br />

                          <NumberPicker
                            label='Memory (GB)'
                            max={999}
                            min={3}
                            onChange={this.updateMemorySize}
                            stepSize={1}
                            unit='GB'
                            value={this.state.kvm.memorySize.value}
                          />
                          <br />

                          <NumberPicker
                            label='Storage (GB)'
                            max={999}
                            min={10}
                            onChange={this.updateDiskSize}
                            stepSize={10}
                            unit='GB'
                            value={this.state.kvm.diskSize.value}
                          />
                        </>
                      );
                    case Providers.AZURE: {
                      const [RAM, CPUCores] = this.produceRAMAndCoresAzure();

                      return (
                        <>
                          <span className='label-span'>VM Size</span>
                          <FlexWrapperDiv>
                            <AzureVMSizeSelector
                              allowedVMSizes={this.props.allowedVMSizes}
                              onChange={this.updateVMSize}
                              readOnly={false}
                              value={this.state.azure.vmSize.value}
                            />
                            <p>{`${CPUCores} CPU cores, ${RAM} GB RAM each`}</p>
                          </FlexWrapperDiv>
                        </>
                      );
                    }
                  }

                  return null;
                })()}
              </label>
              <label className='scaling-range' htmlFor='scaling-range'>
                <span className='label-span'>Number of worker nodes</span>
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
              </label>
            </FlexColumnDiv>

            <hr style={{ margin: '37px 0 31px' }} />

            <FlexColumnDiv style={{ marginBottom: '23px' }}>
              <ErrorFallbackStyled error={noReleasesErrorText} />
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
              <ClusterCreationDuration
                stats={this.props.clusterCreationStats}
              />
            </FlexColumnDiv>
          </WrapperDiv>
        </DocumentTitle>
      </Breadcrumb>
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
  match: PropTypes.object,
  clusterCreationStats: PropTypes.object,
  informParent: PropTypes.func,
  selectableReleases: PropTypes.array,
  releases: PropTypes.object,
  activeSortedReleases: PropTypes.array,
  clusterName: PropTypes.string,
  updateClusterNameInParent: PropTypes.func,
  clusterCreateError: PropTypes.string,
  releasesLoadError: PropTypes.string,
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
    releasesLoadError: selectErrorByAction(state, RELEASES_LOAD_REQUEST),
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
