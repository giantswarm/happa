'use strict';

import React from 'react';
import ClusterIDLabel from '../shared/cluster_id_label';
import Button from '../shared/button';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import NodeCountSelector from '../shared/node_count_selector';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cmp from 'semver-compare';
import * as clusterActions from '../../actions/clusterActions';
import * as flashActions from '../../actions/flashMessageActions';
import PropTypes from 'prop-types';

class ScaleClusterModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      scaling: {
        automatic: false,
        min: props.cluster.scaling.min,
        minValid: true,
        max: props.cluster.scaling.max,
        maxValid: true,
      },
    };
  }

  componentDidMount() {
    this.setState({});
  }

  reset = () => {
    this.setState({
      scaling: {
        automatic: false,
        min: this.props.cluster.scaling.min,
        minValid: true,
        max: this.props.cluster.scaling.max,
        maxValid: true,
      },
      loading: false,
      error: null,
    });
  };

  back = () => {
    this.setState({
      loading: false,
      error: null,
    });
  };

  show = () => {
    this.setState({
      modalVisible: true,
    });
  };

  close = () => {
    this.setState({
      modalVisible: false,
    });
  };

  isScalingAutomatic(provider, releaseVer) {
    if (provider != 'aws') {
      return false;
    }

    // In order to have support for automatic scaling and therefore for scaling
    // limits, provider must be AWS and cluster release >= 6.3.0.
    return cmp(releaseVer, '6.2.0') === 1;
  }

  updateScaling = nodeCountSelector => {
    this.setState({
      scaling: {
        min: nodeCountSelector.scaling.min,
        minValid: nodeCountSelector.scaling.minValid,
        max: nodeCountSelector.scaling.max,
        maxValid: nodeCountSelector.scaling.maxValid,
      },
    });
  };

  getCurrentDesiredCapacity = () => {
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status != null
    ) {
      return this.props.cluster.status.cluster.scaling.desiredCapacity;
    }
    return 0;
  };

  submit = () => {
    this.setState(
      {
        loading: true,
      },
      () => {
        var scaling = {
          min: this.state.scaling.min,
          max: this.state.scaling.max,
        };

        this.props.clusterActions
          .clusterPatch({ id: this.props.cluster.id, scaling: scaling })
          .then(patchedCluster => {
            this.close();

            this.props.clusterActions.clusterLoadDetailsSuccess(patchedCluster);
            this.props.flashActions.flashAdd({
              message:
                'The cluster will be scaled within the next couple of minutes',
              class: 'success',
              ttl: 3000,
            });
          })
          .catch(error => {
            this.setState({
              loading: false,
              error: error,
            });
          });
      }
    );
  };

  workerDelta = () => {
    if (this.getCurrentDesiredCapacity() < this.state.scaling.min) {
      return this.state.scaling.min - this.getCurrentDesiredCapacity;
    }

    if (this.getCurrentDesiredCapacity() > this.state.scaling.max) {
      return this.state.scaling.max - this.getCurrentDesiredCapacity();
    }

    if (
      this.state.scaling.min == this.state.scaling.max &&
      this.getCurrentDesiredCapacity() < this.state.scaling.max
    ) {
      return this.getCurrentDesiredCapacity() - this.state.scaling.max;
    }

    return 0;
  };

  pluralize = nodes => {
    var pluralize = 's';

    if (Math.abs(nodes) === 1) {
      pluralize = '';
    }

    return pluralize;
  };

  buttonProperties = () => {
    var workerDelta = this.workerDelta();
    var pluralizeWorkers = this.pluralize(workerDelta);

    if (
      this.isScalingAutomatic(
        this.props.provider,
        this.props.cluster.release_version
      )
    ) {
      if (this.state.scaling.min > this.getCurrentDesiredCapacity()) {
        workerDelta = this.state.scaling.min - this.getCurrentDesiredCapacity();
        return {
          title: `Increase minimum number of nodes by ${workerDelta} worker node${this.pluralize(
            workerDelta
          )}`,
          style: 'success',
          disabled: !this.state.scaling.minValid,
        };
      }

      if (this.state.scaling.max < this.getCurrentDesiredCapacity()) {
        workerDelta = this.getCurrentDesiredCapacity() - this.state.scaling.max;
        return {
          title: `Remove ${Math.abs(workerDelta)} worker node${this.pluralize(
            workerDelta
          )}`,
          style: 'danger',
          disabled: !this.state.scaling.maxValid,
        };
      }

      if (this.state.scaling.min != this.props.cluster.scaling.min) {
        return {
          title: 'Scale',
          style: 'success',
          disabled: !(
            this.state.scaling.minValid && this.state.scaling.maxValid
          ),
        };
      }

      if (this.state.scaling.max != this.props.cluster.scaling.max) {
        return {
          title: 'Scale',
          style: 'success',
          disabled: !(
            this.state.scaling.minValid && this.state.scaling.maxValid
          ),
        };
      }

      return {
        disabled: true,
      };
    }

    if (workerDelta === 0) {
      return {
        disabled: true,
      };
    }

    if (workerDelta > 0) {
      return {
        title: `Add ${workerDelta} worker node${pluralizeWorkers}`,
        style: 'success',
        disabled: !(this.state.scaling.minValid && this.state.scaling.maxValid),
      };
    }

    if (workerDelta < 0) {
      return {
        title: `Remove ${Math.abs(workerDelta)} worker node${pluralizeWorkers}`,
        style: 'danger',
        disabled: !(this.state.scaling.minValid && this.state.scaling.maxValid),
      };
    }

    return {
      disabled: true,
    };
  };

  render() {
    return (
      <BootstrapModal show={this.state.modalVisible} onHide={this.close}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>
            Scale workers on:{' '}
            <ClusterIDLabel clusterID={this.props.cluster.id} />{' '}
            <strong>{this.props.cluster.name}</strong>
          </BootstrapModal.Title>
        </BootstrapModal.Header>
        {!this.state.error ? (
          <div>
            <BootstrapModal.Body>
              <p>How many workers would you like your cluster to have?</p>
              <div className='row section'>
                <NodeCountSelector
                  autoscalingEnabled={this.isScalingAutomatic(
                    this.props.provider,
                    this.props.cluster.release_version
                  )}
                  scaling={this.state.scaling}
                  readOnly={false}
                  onChange={this.updateScaling}
                />
              </div>
              {this.state.scaling.min < this.getCurrentDesiredCapacity() &&
              this.state.scaling.minValid ? (
                <div className='flash-messages--flash-message flash-messages--danger'>
                  <ul>
                    <li>
                      The selection of the node(s) to be removed is
                      non-deterministic.{' '}
                    </li>
                    <li>
                      Workloads on the worker nodes to be removed will be
                      terminated.
                    </li>
                    <li>
                      Data stored on the removed worker nodes will be lost.
                    </li>
                  </ul>
                </div>
              ) : (
                <div className='flash-messages--flash-message flash-messages--hidden'>
                  <br />
                  <br />
                  <br />
                </div>
              )}
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              {this.buttonProperties().disabled ? (
                undefined
              ) : (
                <Button
                  type='submit'
                  bsStyle={this.buttonProperties().style}
                  loading={this.state.loading}
                  loadingPosition='left'
                  onClick={this.submit}
                  disabled={this.buttonProperties().disabled}
                >
                  {this.buttonProperties().title}
                </Button>
              )}
              <Button
                bsStyle='link'
                disabled={this.state.loading}
                onClick={this.close}
              >
                Cancel
              </Button>
            </BootstrapModal.Footer>
          </div>
        ) : (
          <div>
            <BootstrapModal.Body>
              <p>Something went wrong while trying to scale your cluster:</p>
              <div className='flash-messages--flash-message flash-messages--danger'>
                {this.state.error.body && this.state.error.body.message
                  ? this.state.error.body.message
                  : this.state.error.message}
              </div>
              <div className='flash-messages--flash-message flash-messages--hidden'>
                <br />
                <br />
                <br />
              </div>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='link'
                disabled={this.state.loading}
                onClick={this.back}
              >
                Back
              </Button>
              <Button
                bsStyle='link'
                disabled={this.state.loading}
                onClick={this.close}
              >
                Cancel
              </Button>
            </BootstrapModal.Footer>
          </div>
        )}
      </BootstrapModal>
    );
  }
}

ScaleClusterModal.propTypes = {
  cluster: PropTypes.object,
  clusterActions: PropTypes.object,
  flashActions: PropTypes.object,
  provider: PropTypes.string,
};

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    flashActions: bindActionCreators(flashActions, dispatch),
  };
}

export default connect(
  undefined,
  mapDispatchToProps,
  undefined,
  { withRef: true }
)(ScaleClusterModal);
