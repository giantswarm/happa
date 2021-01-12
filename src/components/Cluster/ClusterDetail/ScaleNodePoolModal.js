import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { bindActionCreators } from 'redux';
import NodeCountSelector from 'shared/NodeCountSelector';
import * as nodePoolActions from 'stores/nodepool/actions';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import FlashMessageComponent from 'UI/FlashMessage';

class ScaleNodePoolModal extends React.Component {
  // eslint-disable-next-line no-magic-numbers
  static rollupAnimationDuration = 500;

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
    this.setState((prevState) => ({
      scaling: {
        ...prevState.scaling,
        min: this.props.nodePool.scaling.min,
        max: this.props.nodePool.scaling.max,
      },
      // eslint-disable-next-line react/no-unused-state
      loading: false,
      error: null,
    }));
  };

  setNodePool = (nodePool) => {
    this.setState((prevState) => ({
      scaling: {
        ...prevState.scaling,
        min: nodePool.scaling.min,
        max: nodePool.scaling.max,
      },
      nodePool,
    }));
  };

  back = () => {
    this.setState({
      // eslint-disable-next-line react/no-unused-state
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

  updateScaling = (nodeCountSelector) => {
    const { min, max, minValid, maxValid } = nodeCountSelector.scaling;
    this.setState({
      scaling: { min, minValid, max, maxValid },
    });
  };

  submit = () => {
    this.setState(
      {
        // eslint-disable-next-line react/no-unused-state
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
          .catch((error) => {
            this.setState({
              // eslint-disable-next-line react/no-unused-state
              loading: false,
              error: error,
            });
          });
      }
    );
  };

  workerDelta = () => {
    const { nodePool, workerNodesDesired, supportsAutoscaling } = this.props;
    const { min, max } = this.state.scaling;

    if (!supportsAutoscaling) {
      // On non-auto-scaling clusters scaling.min == scaling.max so comparing
      // only min between props and current state works.
      return min - nodePool.scaling.min;
    }

    if (workerNodesDesired < min) return min - workerNodesDesired;
    if (workerNodesDesired > max) return max - workerNodesDesired;
    if (min === max && workerNodesDesired < max)
      return workerNodesDesired - max;

    return 0;
  };

  pluralize = (nodes) => {
    let pluralize = 's';

    if (Math.abs(nodes) === 1) {
      pluralize = '';
    }

    return pluralize;
  };

  buttonProperties = () => {
    let workerDelta = this.workerDelta();
    const pluralizeWorkers = this.pluralize(workerDelta);

    const { nodePool, workerNodesDesired, supportsAutoscaling } = this.props;
    const { min, max, minValid, maxValid } = this.state.scaling;
    // Are there any nodes already?
    const hasNodes = nodePool.status.nodes && nodePool.status.nodes_ready;

    if (supportsAutoscaling) {
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

      if (min !== nodePool.scaling.min) {
        return {
          title: 'Apply',
          style: 'success',
          disabled: !(minValid && maxValid),
        };
      }

      if (max !== nodePool.scaling.max) {
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
    const { workerNodesRunning, supportsAutoscaling } = this.props;
    const { error, scaling } = this.state;
    const { min, max, minValid, loading } = scaling;

    const warnings = [];

    if (max < workerNodesRunning && minValid) {
      const diff = workerNodesRunning - max;

      if (supportsAutoscaling) {
        warnings.push(
          <CSSTransition
            classNames='rollup'
            enter={true}
            exit={true}
            key={1}
            timeout={ScaleNodePoolModal.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> The node pool currently has{' '}
              {workerNodesRunning} worker nodes running. By setting the maximum
              lower than that, you enforce the removal of{' '}
              {diff === 1 ? 'one node' : `${diff} nodes`}. This could result in
              unscheduled workloads.
            </p>
          </CSSTransition>
        );
      } else {
        warnings.push(
          <CSSTransition
            classNames='rollup'
            key={2}
            timeout={ScaleNodePoolModal.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> You are about to enforce the
              removal of {diff === 1 ? 'one node' : `${diff} nodes`}. Please
              make sure the node pool has enough capacity to schedule all
              workloads.
            </p>
          </CSSTransition>
        );
      }
    }

    // eslint-disable-next-line no-magic-numbers
    if (min < 3) {
      warnings.push(
        <CSSTransition
          classNames='rollup'
          key={3}
          timeout={ScaleNodePoolModal.rollupAnimationDuration}
        >
          <p key='unsupported'>
            <i className='fa fa-warning' /> We recommend that you run clusters
            with at least three worker nodes.
          </p>
        </CSSTransition>
      );
    }

    let body = (
      <BootstrapModal.Body>
        <p>
          {supportsAutoscaling
            ? 'Set the scaling range and let the autoscaler set the effective number of worker nodes based on the usage.'
            : 'How many workers would you like your node pool to have?'}
        </p>
        <div className='row section'>
          <NodeCountSelector
            autoscalingEnabled={supportsAutoscaling}
            onChange={this.updateScaling}
            readOnly={false}
            scaling={this.state.scaling}
          />
        </div>
        <TransitionGroup>{warnings}</TransitionGroup>
      </BootstrapModal.Body>
    );
    let footer = (
      <BootstrapModal.Footer>
        {this.buttonProperties().disabled ? undefined : (
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
          <FlashMessageComponent type='danger'>
            {error.body && error.body.message
              ? error.body.message
              : error.message}
          </FlashMessageComponent>
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
        <div>
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
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
  supportsAutoscaling: PropTypes.bool,
  supportsSpotInstances: PropTypes.bool,
};

ScaleNodePoolModal.defaultProps = {
  supportsAutoscaling: false,
  supportsSpotInstances: false,
};

function mapDispatchToProps(dispatch) {
  return {
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
  };
}

export default connect(undefined, mapDispatchToProps, undefined, {
  forwardRef: true,
})(ScaleNodePoolModal);
