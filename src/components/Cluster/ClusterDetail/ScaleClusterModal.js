import { Box } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { compare } from 'lib/semver';
import React from 'react';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { bindActionCreators } from 'redux';
import { Providers } from 'shared/constants';
import NodeCountSelector from 'shared/NodeCountSelector';
import * as clusterActions from 'stores/cluster/actions';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import Modal from 'UI/Layout/Modal';

class ScaleClusterModal extends React.Component {
  // eslint-disable-next-line no-magic-numbers
  static rollupAnimationDuration = 500;

  /**
   * Returns true if autoscaling of worker nodes is possible in this
   * workload cluster.
   *
   * @param String Provider identifier (aws, azure, kvm)
   * @param String Semantic release version number
   */
  static supportsAutoscaling(provider, releaseVer) {
    if (provider !== Providers.AWS) {
      return false;
    }

    // In order to have support for automatic scaling and therefore for scaling
    // limits, provider must be AWS and cluster release >= 6.3.0.
    return compare(releaseVer, '6.2.99') === 1;
  }

  state = {
    modalVisible: false,
    scaling: {
      automatic: false,
      min: this.props.cluster.scaling.min,
      minValid: true,
      max: this.props.cluster.scaling.max,
      maxValid: true,
    },
  };

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

        this.props.clusterActions
          .clusterPatch(this.props.cluster, { scaling: scaling })
          .then(() => {
            this.close();

            new FlashMessage(
              'The cluster will be scaled within the next couple of minutes.',
              messageType.SUCCESS,
              messageTTL.SHORT
            );
          })
          .catch((error) => {
            this.setState({
              loading: false,
              error: error,
            });

            ErrorReporter.getInstance().notify(error);
          });
      }
    );
  };

  workerDelta = () => {
    if (
      !ScaleClusterModal.supportsAutoscaling(
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
      this.state.scaling.min === this.state.scaling.max &&
      this.props.workerNodesDesired < this.state.scaling.max
    ) {
      return this.props.workerNodesDesired - this.state.scaling.max;
    }

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

    if (
      ScaleClusterModal.supportsAutoscaling(
        this.props.provider,
        this.props.cluster.release_version
      )
    ) {
      if (this.state.scaling.min > this.props.workerNodesDesired) {
        workerDelta = this.state.scaling.min - this.props.workerNodesDesired;

        return {
          title: `Increase minimum number of nodes by ${workerDelta}`,
          primary: true,
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
          danger: true,
          disabled: !this.state.scaling.maxValid,
        };
      }

      if (this.state.scaling.min !== this.props.cluster.scaling.min) {
        return {
          title: 'Apply',
          primary: true,
          disabled: !(
            this.state.scaling.minValid && this.state.scaling.maxValid
          ),
        };
      }

      if (this.state.scaling.max !== this.props.cluster.scaling.max) {
        return {
          title: 'Apply',
          primary: true,
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
        primary: true,
        disabled: !(this.state.scaling.minValid && this.state.scaling.maxValid),
      };
    }

    if (workerDelta < 0) {
      return {
        title: `Remove ${Math.abs(workerDelta)} worker node${pluralizeWorkers}`,
        danger: true,
        disabled: !(this.state.scaling.minValid && this.state.scaling.maxValid),
      };
    }

    return {
      disabled: true,
    };
  };

  render() {
    const warnings = [];
    if (
      this.state.scaling.max < this.props.workerNodesRunning &&
      this.state.scaling.minValid
    ) {
      const diff = this.props.workerNodesRunning - this.state.scaling.max;

      if (
        ScaleClusterModal.supportsAutoscaling(
          this.props.provider,
          this.props.cluster.release_version
        )
      ) {
        warnings.push(
          <CSSTransition
            classNames='rollup'
            enter={true}
            exit={true}
            key={1}
            timeout={ScaleClusterModal.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> The cluster currently has{' '}
              {this.props.workerNodesRunning} worker nodes running. By setting
              the maximum lower than that, you enforce the removal of{' '}
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
            timeout={ScaleClusterModal.rollupAnimationDuration}
          >
            <p key='node-removal'>
              <i className='fa fa-warning' /> You are about to enforce the
              removal of {diff === 1 ? 'one node' : `${diff} nodes`}. Please
              make sure the cluster has enough capacity to schedule all
              workloads.
            </p>
          </CSSTransition>
        );
      }
    }

    // eslint-disable-next-line no-magic-numbers
    if (this.state.scaling.min < 3) {
      warnings.push(
        <CSSTransition
          classNames='rollup'
          key={3}
          timeout={ScaleClusterModal.rollupAnimationDuration}
        >
          <p key='unsupported'>
            <i className='fa fa-warning' /> We recommend that you run clusters
            with at least three worker nodes.
          </p>
        </CSSTransition>
      );
    }

    let body = (
      <div>
        <p>
          {ScaleClusterModal.supportsAutoscaling(
            this.props.provider,
            this.props.cluster.release_version
          )
            ? 'Set the scaling range and let the autoscaler set the effective number of worker nodes based on the usage.'
            : 'How many workers would you like your cluster to have?'}
        </p>
        <div className='row section'>
          <NodeCountSelector
            autoscalingEnabled={ScaleClusterModal.supportsAutoscaling(
              this.props.provider,
              this.props.cluster.release_version
            )}
            maxValue={this.props.maxWorkersPerCluster}
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
        {this.buttonProperties().disabled ? undefined : (
          <Button
            primary={this.buttonProperties().primary}
            danger={this.buttonProperties().danger}
            disabled={this.buttonProperties().disabled}
            loading={this.state.loading}
            onClick={this.submit}
            type='submit'
          >
            {this.buttonProperties().title}
          </Button>
        )}
        <Button link={true} disabled={this.state.loading} onClick={this.close}>
          Cancel
        </Button>
      </div>
    );

    if (this.state.error) {
      body = (
        <div>
          <p>Something went wrong while trying to scale your cluster:</p>
          <FlashMessageComponent type='danger'>
            {this.state.error.body && this.state.error.body.message
              ? this.state.error.body.message
              : this.state.error.message}
          </FlashMessageComponent>
        </div>
      );
      footer = (
        <div>
          <Box gap='small' direction='row' justify='end'>
            <Button
              link={true}
              disabled={this.state.loading}
              onClick={this.back}
            >
              Back
            </Button>
            <Button
              link={true}
              disabled={this.state.loading}
              onClick={this.close}
            >
              Cancel
            </Button>
          </Box>
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
            <ClusterIDLabel clusterID={this.props.cluster.id} />
          </>
        }
        footer={footer}
      >
        {body}
      </Modal>
    );
  }
}

function mapStateToProps() {
  const propsToPush = {};

  if (window.config.info.workers.countPerCluster.max) {
    propsToPush.maxWorkersPerCluster =
      window.config.info.workers.countPerCluster.max;
  }

  return propsToPush;
}

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps, undefined, {
  forwardRef: true,
})(ScaleClusterModal);
