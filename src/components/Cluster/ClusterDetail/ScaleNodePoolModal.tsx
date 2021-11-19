import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import * as nodePoolActions from 'model/stores/nodepool/actions';
import { IState } from 'model/stores/state';
import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { bindActionCreators, Dispatch } from 'redux';
import NodeCountSelector from 'shared/NodeCountSelector';
import { FlashMessageType } from 'styles';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import Modal from 'UI/Layout/Modal';
import { extractMessageFromError } from 'utils/errorUtils';

interface IDispatchProps extends DispatchProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodePoolActions: Record<string, (...args: any[]) => Promise<any>>;
}

interface IScaleNodePoolModalProps {
  cluster: Cluster;
  nodePool: INodePool;
  workerNodesRunning: number;
  workerNodesDesired: number;
  supportsAutoscaling?: boolean;
}

interface IScaleNodePoolModalState {
  loading: boolean;
  error: Error | null;
  modalVisible: boolean;
  scaling: {
    min: number;
    minValid: boolean;
    max: number;
    maxValid: boolean;
  };
  nodePool: INodePool | null;
}

class ScaleNodePoolModal extends React.Component<
  IScaleNodePoolModalProps & IDispatchProps,
  IScaleNodePoolModalState
> {
  // eslint-disable-next-line no-magic-numbers
  static rollupAnimationDuration = 500;

  static defaultProps = {
    supportsAutoscaling: false,
  };

  public readonly state: IScaleNodePoolModalState = {
    loading: false,
    error: null,
    modalVisible: false,
    scaling: {
      min: this.props.nodePool.scaling!.min,
      minValid: true,
      max: this.props.nodePool.scaling!.max,
      maxValid: true,
    },
    nodePool: null,
  };

  reset = () => {
    this.setState((prevState) => ({
      scaling: {
        ...prevState.scaling,
        min: this.props.nodePool.scaling!.min,
        max: this.props.nodePool.scaling!.max,
      },
      loading: false,
      error: null,
    }));
  };

  setNodePool = (nodePool: INodePool) => {
    this.setState((prevState) => ({
      scaling: {
        ...prevState.scaling,
        min: nodePool.scaling!.min,
        max: nodePool.scaling!.max,
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

  updateScaling = (nodeCountSelector: {
    scaling: {
      min: number;
      minValid: boolean;
      max: number;
      maxValid: boolean;
    };
  }) => {
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
          .nodePoolPatch(this.props.cluster.id, this.state.nodePool!, {
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

            ErrorReporter.getInstance().notify(error as Error);
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
      return min - nodePool.scaling!.min;
    }

    if (workerNodesDesired < min) return min - workerNodesDesired;
    if (workerNodesDesired > max) return max - workerNodesDesired;
    if (min === max && workerNodesDesired < max)
      return workerNodesDesired - max;

    return 0;
  };

  pluralize = (nodes: number) => {
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
    const hasNodes = nodePool.status!.nodes && nodePool.status!.nodes_ready;

    if (supportsAutoscaling) {
      if (min > workerNodesDesired && hasNodes) {
        workerDelta = min - workerNodesDesired;

        return {
          title: `Increase minimum number of nodes by ${workerDelta}`,
          primary: true,
          disabled: !minValid,
        };
      }

      if (max < workerNodesDesired && hasNodes) {
        workerDelta = Math.abs(workerNodesDesired - max);

        return {
          title: `Remove ${workerDelta} worker node${this.pluralize(
            workerDelta
          )}`,
          danger: true,
          disabled: !maxValid,
        };
      }

      if (min !== nodePool.scaling!.min) {
        return {
          title: 'Apply',
          primary: true,
          disabled: !(minValid && maxValid),
        };
      }

      if (max !== nodePool.scaling!.max) {
        return {
          title: 'Apply',
          primary: true,
          disabled: !(minValid && maxValid),
        };
      }

      return { disabled: true };
    }

    if (workerDelta === 0) return { disabled: true };

    if (workerDelta > 0) {
      return {
        title: `Add ${workerDelta} worker node${pluralizeWorkers}`,
        primary: true,
        disabled: !(minValid && maxValid),
      };
    }

    if (workerDelta < 0) {
      return {
        title: `Remove ${Math.abs(workerDelta)} worker node${pluralizeWorkers}`,
        danger: true,
        disabled: !(minValid && maxValid),
      };
    }

    return { disabled: true };
  };

  render() {
    const { workerNodesRunning, supportsAutoscaling } = this.props;
    const { error, scaling, loading } = this.state;
    const { max, minValid } = scaling;

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

    let body = (
      <div>
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
      </div>
    );
    let footer = (
      <div>
        <Box gap='small' direction='row' justify='end'>
          {this.buttonProperties().disabled ? undefined : (
            <Button
              primary={this.buttonProperties().primary}
              danger={this.buttonProperties().danger}
              disabled={this.buttonProperties().disabled}
              loading={loading}
              onClick={this.submit}
              type='submit'
            >
              {this.buttonProperties().title}
            </Button>
          )}
          <Button link={true} disabled={loading} onClick={this.close}>
            Cancel
          </Button>
        </Box>
      </div>
    );

    if (error) {
      body = (
        <div>
          <p>Something went wrong while trying to scale your node pool:</p>
          <FlashMessageComponent type={FlashMessageType.Danger}>
            {extractMessageFromError(error, 'Could not scale node pool')}
          </FlashMessageComponent>
        </div>
      );
      footer = (
        <div>
          <Button link={true} disabled={loading} onClick={this.back}>
            Back
          </Button>
          <Button link={true} disabled={loading} onClick={this.close}>
            Cancel
          </Button>
        </div>
      );
    }

    return (
      <Modal
        onClose={this.close}
        visible={this.state.modalVisible}
        title={
          <>
            Edit scaling settings for{' '}
            <ClusterIDLabel clusterID={this.props.nodePool.id} />{' '}
          </>
        }
        footer={footer}
      >
        {body}
      </Modal>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
  } as unknown as IDispatchProps;
}

export default connect<IState, IDispatchProps, IScaleNodePoolModalProps>(
  undefined,
  mapDispatchToProps,
  undefined,
  {
    forwardRef: true,
  }
)(ScaleNodePoolModal);
