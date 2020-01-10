import * as nodePoolActions from 'actions/nodePoolActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { Providers } from 'shared/constants';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import NodeCountSelector from 'shared/NodeCountSelector';
import PropTypes from 'prop-types';
import React from 'react';

class ScaleNodePoolModal extends React.Component {
  rollupAnimationDuration = 500;

  state = {
    modalVisible: false,
    scaling: {
      automatic: false,
      min: this.props.nodePool.scaling.min,
      minValid: true,
      max: this.props.nodePool.scaling.max,
      maxValid: true,
    },
    nodePool: null,
  };

  reset = () => {
    this.setState({
      scaling: {
        ...this.state.scaling,
        min: this.props.nodePool.scaling.min,
        max: this.props.nodePool.scaling.max,
      },
      loading: false,
      error: null,
    });
  };

  setNodePool = nodePool => {
    this.setState({
      scaling: {
        ...this.state.scaling,
        min: nodePool.scaling.min,
        max: nodePool.scaling.max,
      },
      nodePool,
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

  supportsAutoscaling(provider) {
    if (provider !== Providers.AWS) return false;
    return true;
  }

  updateScaling = nodeCountSelector => {
    const { min, max, minValid, maxValid } = nodeCountSelector.scaling;
    this.setState({
      scaling: { min, minValid, max, maxValid },
    });
  };

  submit = () => {
    this.setState(
      {
        loading: true,
      },
      () => {
        const scaling = {
          min: this.state.scaling.min,
          max: this.state.scaling.max,
        };

        this.props.nodePoolActions
          .nodePoolPatch(this.props.cluster.id, this.state.nodePool, {
            scaling,
          })
          .then(() => {
            this.close();

            new FlashMessage(
              'The node pool will be scaled within the next couple of minutes.',
              messageType.SUCCESS,
              messageTTL.SHORT
            );
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
    const { nodePool, workerNodesDesired } = this.props;
    const { min, max } = this.state.scaling;

    if (
      !this.supportsAutoscaling(this.props.provider, nodePool.release_version)
    ) {
      // On non-auto-scaling clusters scaling.min == scaling.max so comparing
      // only min between props and current state works.
      return min - nodePool.scaling.min;
    }

    if (workerNodesDesired < min) return min - workerNodesDesired;
    if (workerNodesDesired > max) return max - workerNodesDesired;
    if (min == max && workerNodesDesired < max) return workerNodesDesired - max;

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
    let workerDelta = this.workerDelta();
    let pluralizeWorkers = this.pluralize(workerDelta);

    const { nodePool, workerNodesDesired } = this.props;
    const { min, max, minValid, maxValid } = this.state.scaling;
    // Are there any nodes already?
    const hasNodes = nodePool.status.nodes && nodePool.status.nodes_ready;

    if (this.supportsAutoscaling(this.props.provider)) {
      if (min > workerNodesDesired && hasNodes) {
        workerDelta = min - workerNodesDesired;
        return {
          title: `Increase minimum number of nodes by ${workerDelta}`,
          style: 'success',
          disabled: !minValid,
        };
      }

      if (max < workerNodesDesired && hasNodes) {
        workerDelta = Math.abs(workerNodesDesired - max);
        return {
          title: `Remove ${workerDelta} worker node${this.pluralize(
            workerDelta
          )}`,
          style: 'danger',
          disabled: !maxValid,
        };
      }

      if (min != nodePool.scaling.min) {
        return {
          title: 'Apply',
          style: 'success',
          disabled: !(minValid && maxValid),
        };
      }

      if (max != nodePool.scaling.max) {
        return {
          title: 'Apply',
          style: 'success',
          disabled: !(minValid && maxValid),
        };
      }

      return { disabled: true };
    }

    if (workerDelta === 0) return { disabled: true };

    if (workerDelta > 0) {
      return {
        title: `Add ${workerDelta} worker node${pluralizeWorkers}`,
        style: 'success',
        disabled: !(minValid && maxValid),
      };
    }

    if (workerDelta < 0) {
      return {
        title: `Remove ${Math.abs(workerDelta)} worker node${pluralizeWorkers}`,
        style: 'danger',
        disabled: !(minValid && maxValid),
      };
    }

    return { disabled: true };
  };

  render() {
    const { workerNodesRunning, provider } = this.props;
    const { error, scaling } = this.state;
    const { min, max, minValid, loading } = scaling;

    let warnings = [];

    if (max < workerNodesRunning && minValid) {
      const diff = workerNodesRunning - max;

      if (this.supportsAutoscaling(provider)) {
        warnings.push(
          <CSSTransition
            classNames='rollup'
            enter={true}
            exit={true}
            key={1}
            timeout={this.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> The node pool currently has{' '}
              {workerNodesRunning} worker nodes running. By setting the maximum
              lower than that, you enforce the removal of{' '}
              {diff === 1 ? 'one node' : diff + ' nodes'}. This could result in
              unscheduled workloads.
            </p>
          </CSSTransition>
        );
      } else {
        warnings.push(
          <CSSTransition
            classNames='rollup'
            key={2}
            timeout={this.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> You are about to enforce the
              removal of {diff === 1 ? 'one node' : diff + ' nodes'}. Please
              make sure the node pool has enough capacity to schedule all
              workloads.
            </p>
          </CSSTransition>
        );
      }
    }

    if (min < 3) {
      warnings.push(
        <CSSTransition
          classNames='rollup'
          key={3}
          timeout={this.rollupAnimationDuration}
        >
          <p key='unsupported'>
            <i className='fa fa-warning' /> We recommend that you run clusters
            with at least three worker nodes.
          </p>
        </CSSTransition>
      );
    }

    var body = (
      <BootstrapModal.Body>
        <p>
          {this.supportsAutoscaling(provider)
            ? 'Set the scaling range and let the autoscaler set the effective number of worker nodes based on the usage.'
            : 'How many workers would you like your node pool to have?'}
        </p>
        <div className='row section'>
          <NodeCountSelector
            autoscalingEnabled={this.supportsAutoscaling(provider)}
            onChange={this.updateScaling}
            readOnly={false}
            scaling={this.state.scaling}
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
            bsStyle={this.buttonProperties().style}
            disabled={this.buttonProperties().disabled}
            loading={loading}
            loadingPosition='left'
            onClick={this.submit}
            type='submit'
          >
            {this.buttonProperties().title}
          </Button>
        )}
        <Button bsStyle='link' disabled={loading} onClick={this.close}>
          Cancel
        </Button>
      </BootstrapModal.Footer>
    );

    if (error) {
      body = (
        <BootstrapModal.Body>
          <p>Something went wrong while trying to scale your node pool:</p>
          <div className='flash-messages--flash-message flash-messages--danger'>
            {error.body && error.body.message
              ? error.body.message
              : error.message}
          </div>
        </BootstrapModal.Body>
      );
      footer = (
        <BootstrapModal.Footer>
          <Button bsStyle='link' disabled={loading} onClick={this.back}>
            Back
          </Button>
          <Button bsStyle='link' disabled={loading} onClick={this.close}>
            Cancel
          </Button>
        </BootstrapModal.Footer>
      );
    }

    return (
      <BootstrapModal onHide={this.close} show={this.state.modalVisible}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>
            Edit scaling settings for{' '}
            <ClusterIDLabel clusterID={this.props.nodePool.id} />
          </BootstrapModal.Title>
        </BootstrapModal.Header>
        <div data-testid='oriol'>
          {body}
          {footer}
        </div>
      </BootstrapModal>
    );
  }
}

ScaleNodePoolModal.propTypes = {
  cluster: PropTypes.object,
  nodePool: PropTypes.object,
  nodePoolActions: PropTypes.object,
  provider: PropTypes.string,
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
};

function mapDispatchToProps(dispatch) {
  return {
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
  };
}

export default connect(undefined, mapDispatchToProps, undefined, {
  forwardRef: true,
})(ScaleNodePoolModal);
