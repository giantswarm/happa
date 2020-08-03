import * as clusterActions from 'actions/clusterActions';
import diff from 'deep-diff';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from 'UI/Button';
import ComponentChangelog from 'UI/ComponentChangelog';
import ReleaseComponentLabel from 'UI/ReleaseComponentLabel';
import { groupBy, sortBy } from 'underscore';

class UpgradeClusterModal extends React.Component {
  static getMasterNodesInfo(cluster) {
    if (
      cluster.capabilities.supportsHAMasters &&
      cluster.master_nodes?.high_availability
    ) {
      return 'The master nodes will be terminated one by one. The Kubernetes API may be briefly unavailable during this process due to the etcd leader election process.';
    }

    return 'The master node will be terminated and replaced by a new one. The Kubernetes API will be unavailable during this time.';
  }

  state = {
    loading: false,
    modalVisible: false,
    page: 'about-upgrading',
  };

  show = () => {
    this.setState({
      modalVisible: true,
      page: 'about-upgrading',
    });
  };

  close = () => {
    this.setState({
      loading: false,
      modalVisible: false,
    });
  };

  inspectChanges = () => {
    this.setState({
      page: 'inspect-changes',
    });
  };

  changedComponents = () => {
    const { release } = this.props;
    let currentComponents = [];
    if (release && release.components) {
      currentComponents = release.components;
    }

    const components = {};
    currentComponents.forEach((component) => {
      components[component.name] = component;
    });

    const targetComponents = {};
    this.props.targetRelease.components.forEach((component) => {
      targetComponents[component.name] = component;
    });

    const changedComponents = diff.diff(components, targetComponents);

    const changes = groupBy(this.props.targetRelease.changelog, (item) => {
      return item.component;
    });
    const changedComponentNames = Object.keys(changes).sort();

    return (
      <div>
        {typeof release === 'undefined' ? (
          <div className='flash-messages--flash-message flash-messages--info'>
            Could not get component information for release version{' '}
            {this.props.cluster.release_version}.<br />
            Unable to show you an exact diff.
          </div>
        ) : undefined}
        <p>
          <b>Component Changes</b>
        </p>
        <div className='release-selector-modal--components'>
          {sortBy(changedComponents, 'name').map((diffEdit) => {
            if (diffEdit.kind === 'E') {
              const component = components[diffEdit.path[0]];

              return (
                <ReleaseComponentLabel
                  key={component.name}
                  name={component.name}
                  oldVersion={diffEdit.lhs}
                  version={diffEdit.rhs}
                />
              );
            }

            if (diffEdit.kind === 'N') {
              const component = diffEdit.rhs;

              return (
                <ReleaseComponentLabel
                  isAdded
                  name={component.name}
                  version={component.version}
                />
              );
            }

            if (diffEdit.kind === 'D') {
              const component = diffEdit.lhs;

              return (
                <ReleaseComponentLabel
                  isRemoved
                  name={component.name}
                  version={component.version}
                />
              );
            }

            return null;
          })}
        </div>

        <p>
          <b>Changes</b>
        </p>
        <dl>
          {changedComponentNames.map((componentName, index) => {
            return (
              <ComponentChangelog
                changes={changes[componentName].map((c) => {
                  return c.description;
                })}
                key={index}
                name={componentName}
              />
            );
          })}
        </dl>
      </div>
    );
  };

  aboutUpgradingPage = () => {
    return (
      <div>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>About Upgrading</BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <p>Before upgrading please acknowledge the following</p>
          <ul>
            <li>
              Worker nodes will be drained and then terminated one after another
              to be replaced by new ones.
            </li>
            <li>
              To be able to run all workloads with one worker node missing,
              please make sure to have enough workers before upgrading.
            </li>
            <li>
              {UpgradeClusterModal.getMasterNodesInfo(this.props.cluster)}
            </li>
          </ul>
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button bsStyle='primary' onClick={this.inspectChanges}>
            Inspect Changes
          </Button>
          <Button bsStyle='link' onClick={this.close}>
            Cancel
          </Button>
        </BootstrapModal.Footer>
      </div>
    );
  };

  inspectChangesPage = () => {
    const { loading } = this.state;

    return (
      <div>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>
            Inspect changes from version {this.props.cluster.release_version} to{' '}
            {this.props.targetRelease.version}
          </BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>{this.changedComponents()}</BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button
            bsStyle='primary'
            loading={loading}
            onClick={this.submit}
            loadingTimeout={0}
          >
            Start Upgrade
          </Button>

          {!loading && (
            <Button bsStyle='link' onClick={this.close}>
              Cancel
            </Button>
          )}
        </BootstrapModal.Footer>
      </div>
    );
  };

  submit = () => {
    this.setState(
      {
        loading: true,
      },
      () => {
        const targetReleaseVersion = this.props.targetRelease.version;

        this.props.clusterActions
          .clusterPatch(
            this.props.cluster,
            { release_version: targetReleaseVersion },
            true
          )
          .then(() => {
            new FlashMessage(
              'Cluster upgrade initiated.',
              messageType.INFO,
              messageTTL.MEDIUM,
              'Keep an eye on <code>kubectl get nodes</code> to follow the upgrade progress.'
            );

            this.close();
          })
          .catch((_error) => {
            this.setState({
              loading: false,
            });
          });
      }
    );
  };

  currentPage = () => {
    if (this.state.page === 'about-upgrading') {
      return this.aboutUpgradingPage();
    } else if (this.state.page === 'inspect-changes') {
      return this.inspectChangesPage();
    }

    return null;
  };

  render() {
    return (
      <BootstrapModal onHide={this.close} show={this.state.modalVisible}>
        {this.currentPage()}
      </BootstrapModal>
    );
  }
}

UpgradeClusterModal.propTypes = {
  cluster: PropTypes.object,
  clusterActions: PropTypes.object,
  release: PropTypes.object,
  targetRelease: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
  };
}

export default connect(undefined, mapDispatchToProps, undefined, {
  forwardRef: true,
})(UpgradeClusterModal);
