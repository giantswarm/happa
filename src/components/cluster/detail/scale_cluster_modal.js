'use strict';

import * as clusterActions from '../../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import {
  FlashMessage,
  messageTTL,
  messageType,
} from '../../../lib/flash_message';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../../shared/button';
import ClusterIDLabel from '../../shared/cluster_id_label';
import cmp from 'semver-compare';
import NodeCountSelector from '../../shared/node_count_selector';
import PropTypes from 'prop-types';
import React from 'react';

class ScaleClusterModal extends React.Component {
  rollupAnimationDuration = 500;

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

  /**
   * Returns true if autoscaling of worker nodes is possible in this
   * tenant cluster.
   *
   * @param String Provider identifier (aws, azure, kvm)
   * @param String Semantic release version number
   */
  supportsAutoscaling(provider, releaseVer) {
    if (provider != 'aws') {
      return false;
    }

    // In order to have support for automatic scaling and therefore for scaling
    // limits, provider must be AWS and cluster release >= 6.3.0.
    return cmp(releaseVer, '6.2.99') === 1;
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

            new FlashMessage(
              'The cluster will be scaled within the next couple of minutes.',
              messageType.SUCCESS,
              messageTTL.SHORT
            );

            this.props.clusterActions.clusterLoadDetailsSuccess(patchedCluster);
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
    if (
      !this.supportsAutoscaling(
        this.props.provider,
        this.props.cluster.release_version
      )
    ) {
      // On non-auto-scaling clusters scaling.min == scaling.max so comparing
      // only min between props and current state works.
      return this.state.scaling.min - this.props.cluster.scaling.min;
    }

    if (this.props.workerNodesDesired < this.state.scaling.min) {
      return this.state.scaling.min - this.props.workerNodesDesired;
    }

    if (this.props.workerNodesDesired > this.state.scaling.max) {
      return this.state.scaling.max - this.props.workerNodesDesired;
    }

    if (
      this.state.scaling.min == this.state.scaling.max &&
      this.props.workerNodesDesired < this.state.scaling.max
    ) {
      return this.props.workerNodesDesired - this.state.scaling.max;
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
      this.supportsAutoscaling(
        this.props.provider,
        this.props.cluster.release_version
      )
    ) {
      if (this.state.scaling.min > this.props.workerNodesDesired) {
        workerDelta = this.state.scaling.min - this.props.workerNodesDesired;
        return {
          title: `Increase minimum number of nodes by ${workerDelta}`,
          style: 'success',
          disabled: !this.state.scaling.minValid,
        };
      }

      if (this.state.scaling.max < this.props.workerNodesDesired) {
        workerDelta = Math.abs(
          this.props.workerNodesDesired - this.state.scaling.max
        );
        return {
          title: `Remove ${workerDelta} worker node${this.pluralize(
            workerDelta
          )}`,
          style: 'danger',
          disabled: !this.state.scaling.maxValid,
        };
      }

      if (this.state.scaling.min != this.props.cluster.scaling.min) {
        return {
          title: 'Apply',
          style: 'success',
          disabled: !(
            this.state.scaling.minValid && this.state.scaling.maxValid
          ),
        };
      }

      if (this.state.scaling.max != this.props.cluster.scaling.max) {
        return {
          title: 'Apply',
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
    var warnings = [];
    if (
      this.state.scaling.max < this.props.workerNodesRunning &&
      this.state.scaling.minValid
    ) {
      var diff = this.props.workerNodesRunning - this.state.scaling.max;

      if (
        this.supportsAutoscaling(
          this.props.provider,
          this.props.cluster.release_version
        )
      ) {
        warnings.push(
          <CSSTransition
            key={1}
            classNames='rollup'
            enter={true}
            exit={true}
            timeout={this.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> The cluster currently has{' '}
              {this.props.workerNodesRunning} worker nodes running. By setting
              the maximum lower than that, you enforce the removal of{' '}
              {diff === 1 ? 'one node' : diff + ' nodes'}. This could result in
              unscheduled workloads.
            </p>
          </CSSTransition>
        );
      } else {
        warnings.push(
          <CSSTransition
            key={2}
            classNames='rollup'
            timeout={this.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> You are about to enforce the
              removal of {diff === 1 ? 'one node' : diff + ' nodes'}. Please
              make sure the cluster has enough capacity to schedule all
              workloads.
            </p>
          </CSSTransition>
        );
      }
    }

    if (this.state.scaling.min < 3) {
      warnings.push(
        <CSSTransition
          key={3}
          classNames='rollup'
          timeout={this.rollupAnimationDuration}
        >
          <p key='unsupported'>
            <i className='fa fa-warning' /> With less than 3 worker nodes, the
            cluster does not fall under the Giant Swarm{' '}
            <abbr title='Service Level Agreement'>SLA</abbr>. Giant Swarm staff
            will not be alerted in case of problems and will not provide
            proactive support.
          </p>
        </CSSTransition>
      );
    }

    var body = (
      <BootstrapModal.Body>
        <p>
          {this.supportsAutoscaling(
            this.props.provider,
            this.props.cluster.release_version
          )
            ? 'Set the scaling range and let the autoscaler set the effective number of worker nodes based on the usage.'
            : 'How many workers would you like your cluster to have?'}
        </p>
        <div className='row section'>
          <NodeCountSelector
            autoscalingEnabled={this.supportsAutoscaling(
              this.props.provider,
              this.props.cluster.release_version
            )}
            scaling={this.state.scaling}
            readOnly={false}
            onChange={this.updateScaling}
          />
        </div>
        <TransitionGroup>{warnings}</TransitionGroup>
      </BootstrapModal.Body>
    );
    var footer = (
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
    );

    if (this.state.error) {
      body = (
        <BootstrapModal.Body>
          <p>Something went wrong while trying to scale your cluster:</p>
          <div className='flash-messages--flash-message flash-messages--danger'>
            {this.state.error.body && this.state.error.body.message
              ? this.state.error.body.message
              : this.state.error.message}
          </div>
        </BootstrapModal.Body>
      );
      footer = (
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
      );
    }

    return (
      <BootstrapModal show={this.state.modalVisible} onHide={this.close}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>
            Edit scaling settings for{' '}
            <ClusterIDLabel clusterID={this.props.cluster.id} />
          </BootstrapModal.Title>
        </BootstrapModal.Header>
        {body}
        {footer}
      </BootstrapModal>
    );
  }
}

ScaleClusterModal.propTypes = {
  cluster: PropTypes.object,
  clusterActions: PropTypes.object,
  provider: PropTypes.string,
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
};

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
  };
}

export default connect(
  undefined,
  mapDispatchToProps,
  undefined,
  { forwardRef: true }
)(ScaleClusterModal);
