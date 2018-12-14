'use strict';

import React from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import Button from '../button';
import { clusterCreate } from '../../actions/clusterActions';
import NumberPicker from './number_picker.js';
import ReleaseSelector from './release_selector.js';
import ProviderCredentials from './provider_credentials.js';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import { Breadcrumb } from 'react-breadcrumbs';
import cmp from 'semver-compare';

class CreateCluster extends React.Component {
  state = {
    availabilityZonesPicker: {
      value: 1,
      valid: true,
    },
    releaseVersion: '',
    clusterName: 'My cluster',
    scaling: {
      min: 3,
      minValid: true,
      max: 3,
      maxValid: true,
    },
    submitting: false,
    valid: false, // Start off invalid now since we're not sure we have a valid release yet, the release endpoint could be malfunctioning.
    error: false,
  };

  updateAvailabilityZonesPicker = n => {
    this.setState({
      availabilityZonesPicker: {
        value: n.value,
        valid: n.valid,
      },
    });
  };

  updateScalingMin = n => {
    this.setState({
      scaling: {
        min: n.value,
        minValid: n.valid,
        max: this.state.scaling.max,
        maxValid: this.state.scaling.maxValid,
      },
    });
  };

  updateScalingMax = n => {
    this.setState({
      scaling: {
        min: this.state.scaling.min,
        minValid: this.state.scaling.minValid,
        max: n.value,
        maxValid: n.valid,
      },
    });
  };

  updateClusterName = event => {
    this.setState({
      clusterName: event.target.value,
    });
  };

  createCluster = () => {
    this.setState({
      submitting: true,
    });

    var i;
    var workers = [];

    // TODO/FYI: This IF / ELSE on this.props.provider is a antipattern that
    // will spread throughout the codebase if we are not careful. I am waiting
    // for the 'third' cluster type that we support to be able to make decisions
    // about a meaningful abstraction. For now, going with a easy solution.

    if (this.props.provider === 'aws') {
      for (i = 0; i < this.state.scaling.min; i++) {
        workers.push({
          aws: {
            instance_type: 'm3.large', // TODO
          },
        });
      }
    } else if (this.props.provider === 'azure') {
      for (i = 0; i < this.state.scaling.min; i++) {
        workers.push({
          azure: {
            vm_size: 'Standard_A2_v2', // TODO
          },
        });
      }
    } else {
      for (i = 0; i < this.state.scaling.min; i++) {
        workers.push({
          memory: { size_gb: 0 }, // TODO
          storage: { size_gb: 0 }, // TODO
          cpu: { cores: 0 }, // TODO
        });
      }
    }

    this.props
      .dispatch(
        clusterCreate({
          availability_zones: this.state.availabilityZonesPicker.value,
          scaling: {
            min: this.state.scaling.min,
            max: this.state.scaling.max,
          },
          name: this.state.clusterName,
          owner: this.props.selectedOrganization,
          release_version: this.state.releaseVersion,
          workers: workers,
        })
      )
      .then(() => {
        this.props.dispatch(
          push('/organizations/' + this.props.selectedOrganization)
        );
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

  componentDidMount() {
    this.cluster_name.select();
  }

  selectRelease = releaseVersion => {
    this.setState({
      releaseVersion,
    });
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
        ) : (
          undefined
        )}
      </div>
    );
  }

  valid() {
    // If any of the releaseVersion hasn't been set yet, return false
    if (this.state.releaseVersion === '') {
      return false;
    }

    // If the availabilityZonesPicker is invalid, return false
    if (!this.state.availabilityZonesPicker.valid) {
      return false;
    }

    // If the min scaling numberpicker is invalid, return false
    if (!this.state.scaling.minValid) {
      return false;
    }

    // If the max scaling numberpickers is invalid, return false
    if (!this.state.scaling.maxValid) {
      return false;
    }

    return true;
  }

  render() {
    return (
      <Breadcrumb data={{ title: 'CREATE CLUSTER', pathname: '/new-cluster/' }}>
        <DocumentTitle
          title={
            'Create Cluster | ' +
            this.props.selectedOrganization +
            ' | Giant Swarm'
          }
        >
          <div className='new-cluster'>
            <div className='row'>
              <div className='col-12'>
                <h1>Create a Cluster</h1>
              </div>
            </div>

            <div className='row section'>
              <div className='col-3'>
                <h3 className='table-label'>Cluster Name</h3>
              </div>
              <div className='col-9'>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                  }}
                >
                  <p>
                    Give your cluster a name so you can recognize it in a crowd.
                  </p>
                  <input
                    className='col-4'
                    ref={i => {
                      this.cluster_name = i;
                    }}
                    type='text'
                    value={this.state.clusterName}
                    onChange={this.updateClusterName}
                    autoFocus
                  />
                </form>
              </div>
            </div>

            <div className='row section'>
              <div className='col-3'>
                <h3 className='table-label'>Availability Zones</h3>
              </div>
              <div className='col-9'>
                {this.props.provider === 'aws' ? (
                  // For now we want to handle cases where older clusters do
                  // still not support AZ selection. The special handling here
                  // can be removed once all clusters run at least on 6.1.0.
                  //
                  //     https://github.com/giantswarm/giantswarm/pull/2202
                  //
                  cmp(this.state.releaseVersion, '6.0.0') === 1 ? (
                    <div>
                      <p>
                        Select the number of availability zones for your nodes.
                      </p>
                      <div className='col-3'>
                        <NumberPicker
                          label=''
                          stepSize={1}
                          value={this.state.availabilityZonesPicker.value}
                          min={this.props.minAvailabilityZones}
                          max={this.props.maxAvailabilityZones}
                          onChange={this.updateAvailabilityZonesPicker}
                          readOnly={false}
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p>
                        Selection of availability zones is only possible for
                        release version 6.1.0 or greater.
                      </p>
                      <div className='col-3'>
                        <NumberPicker value={1} readOnly={true} />
                      </div>
                    </div>
                  )
                ) : (
                  <p>
                    In this installation it is not possible to use more than one
                    availability zone for worker nodes.
                  </p>
                )}
              </div>
            </div>

            <div className='row section'>
              <div className='col-3'>
                <h3 className='table-label'>Node Count</h3>
              </div>
              <div className='col-9'>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                  }}
                >
                  <div>
                    <p>
                      To disable autoscaling, set both numbers to the same value
                    </p>
                    <div className='col-3'>
                      <p>Minimum</p>
                      <NumberPicker
                        label=''
                        stepSize={1}
                        value={this.state.scaling.min}
                        min={1}
                        max={this.state.scaling.max}
                        onChange={this.updateScalingMin}
                        readOnly={false}
                      />
                    </div>
                    <div className='col-3'>
                      <p>Maximum</p>
                      <NumberPicker
                        label=''
                        stepSize={1}
                        value={this.state.scaling.max}
                        min={this.state.scaling.min}
                        max={99} // TODO
                        onChange={this.updateScalingMax}
                        readOnly={false}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            <div className='row section'>
              <div className='col-3'>
                <h3 className='table-label'>Release Version</h3>
              </div>
              <div className='col-9'>
                <ReleaseSelector releaseSelected={this.selectRelease} />
              </div>
            </div>

            <ProviderCredentials
              organizationName={this.props.selectedOrganization}
              provider={this.props.provider}
            />

            <div className='row section new-cluster--launch'>
              <div className='col-12'>
                <p>
                  Create this cluster now and it will be available for you to
                  use as soon as possible.
                </p>
                {this.state.error ? this.errorState() : undefined}
                <Button
                  type='button'
                  bsSize='large'
                  bsStyle='primary'
                  onClick={this.createCluster}
                  loading={this.state.submitting}
                  disabled={!this.valid()}
                >
                  Create Cluster
                </Button>
              </div>
            </div>
          </div>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

CreateCluster.propTypes = {
  minAvailabilityZones: PropTypes.number,
  maxAvailabilityZones: PropTypes.number,
  allowedInstanceTypes: PropTypes.array,
  allowedVMSizes: PropTypes.array,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
  provider: PropTypes.string,
};

function mapStateToProps(state) {
  var minAvailabilityZones = state.app.info.general.availability_zones.default;
  var maxAvailabilityZones = state.app.info.general.availability_zones.max;
  var selectedOrganization = state.app.selectedOrganization;
  var provider = state.app.info.general.provider;

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
    selectedOrganization,
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
)(CreateCluster);
