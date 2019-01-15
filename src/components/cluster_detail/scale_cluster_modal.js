'use strict';

import React from 'react';
import ClusterIDLabel from '../shared/cluster_id_label';
import Button from '../shared/button';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import NumberPicker from '../create_cluster/number_picker.js';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import * as flashActions from '../../actions/flashMessageActions';
import PropTypes from 'prop-types';

class ScaleClusterModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalVisible: false,
      numberPicker: {
        value: props.cluster.workers.length,
        valid: true,
      },
    };
  }

  componentDidMount() {
    this.setState({});
  }

  reset = () => {
    this.setState({
      numberPicker: {
        value: this.props.cluster.workers.length,
        valid: true,
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

  updateNumberPicker = numberPicker => {
    this.setState({
      numberPicker,
    });
  };

  submit = () => {
    this.setState(
      {
        loading: true,
      },
      () => {
        var workers = [];

        for (var i = 0; i < this.state.numberPicker.value; i++) {
          workers.push({});
        }

        this.props.clusterActions
          .clusterPatch({ id: this.props.cluster.id, workers: workers })
          .then(patchedCluster => {
            this.close();

            this.props.clusterActions.clusterLoadDetailsSuccess(patchedCluster);
            this.props.flashActions.flashAdd({
              message: 'Successfully scaled cluster',
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
    return this.state.numberPicker.value - this.props.cluster.workers.length;
  };

  pluralize = () => {
    var pluralize = 's';

    if (Math.abs(this.workerDelta()) === 1) {
      pluralize = '';
    }

    return pluralize;
  };

  buttonProperties = () => {
    var workerDelta = this.workerDelta();
    var pluralize = this.pluralize();

    if (workerDelta === 0) {
      return {
        disabled: true,
      };
    }

    if (workerDelta > 0) {
      return {
        title: `Add ${workerDelta} worker node${pluralize}`,
        style: 'success',
        disabled: !this.state.numberPicker.valid,
      };
    }

    if (workerDelta < 0) {
      return {
        title: `Remove ${Math.abs(workerDelta)} worker node${pluralize}`,
        style: 'danger',
        disabled: !this.state.numberPicker.valid,
      };
    }
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
              <NumberPicker
                label=''
                stepSize={1}
                value={this.state.numberPicker.value}
                onChange={this.updateNumberPicker}
                min={1}
                max={99}
                theme='inmodal'
              />

              {this.state.numberPicker.value <
                this.props.cluster.workers.length &&
              this.state.numberPicker.valid ? (
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
  giantSwarm: PropTypes.func,
  user: PropTypes.object,
  clusterActions: PropTypes.object,
  flashActions: PropTypes.object,
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
