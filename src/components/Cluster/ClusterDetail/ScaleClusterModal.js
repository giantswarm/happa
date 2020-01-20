import * as clusterActions from 'actions/clusterActions';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { bindActionCreators } from 'redux';
import cmp from 'semver-compare';
import { Providers } from 'shared/constants';
import NodeCountSelector from 'shared/NodeCountSelector';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';

class ScaleClusterModal extends React.Component {
  // eslint-disable-next-line no-magic-numbers
  static rollupAnimationDuration = 500;

  /**
   * Returns true if autoscaling of worker nodes is possible in this
   * tenant cluster.
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
    return cmp(releaseVer, '6.2.99') === 1;
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

  pluralize = nodes => {
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

      if (this.state.scaling.min !== this.props.cluster.scaling.min) {
        return {
          title: 'Apply',
          style: 'success',
          disabled: !(
            this.state.scaling.minValid && this.state.scaling.maxValid
          ),
        };
      }

      if (this.state.scaling.max !== this.props.cluster.scaling.max) {
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
      <BootstrapModal.Body>
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
      </BootstrapModal.Body>
    );
    let footer = (
      <BootstrapModal.Footer>
        {this.buttonProperties().disabled ? (
          undefined
        ) : (
          <Button
            bsStyle={this.buttonProperties().style}
            disabled={this.buttonProperties().disabled}
            loading={this.state.loading}
            loadingPosition='left'
            onClick={this.submit}
            type='submit'
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
      <BootstrapModal onHide={this.close} show={this.state.modalVisible}>
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
  maxWorkersPerCluster: PropTypes.number,
  workerNodesRunning: PropTypes.number,
  workerNodesDesired: PropTypes.number,
};

function mapStateToProps(state) {
  const propsToPush = {};

  if (state.app.info.workers.count_per_cluster.max) {
    propsToPush.maxWorkersPerCluster =
      state.app.info.workers.count_per_cluster.max;
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
