import diff from 'deep-diff';
import { clusterUpgradeChecklistURL } from 'lib/docs';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from 'stores/cluster/actions';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ComponentChangelog from 'UI/Display/Cluster/ComponentChangelog';
import ReleaseComponentLabel from 'UI/Display/Cluster/ReleaseComponentLabel';
import FlashMessageComponent from 'UI/Display/FlashMessage';
import { groupBy, sortBy } from 'underscore';

const Pages = {
  AboutUpgrading: 'about-upgrading',
  InspectChanges: 'inspect-changes',
};

const DetailsHeadline = styled.p`
  margin-top: 10px;
`;

class UpgradeClusterModal extends React.Component {
  static getMasterNodesInfo(cluster) {
    if (
      cluster.capabilities.supportsHAMasters &&
      cluster.master_nodes?.high_availability
    ) {
      return (
        <p>
          Since this cluster provides high-availability Kubernetes masters, the
          Kubernetes API will be available during the upgrade.
        </p>
      );
    }

    return (
      <p>
        As this cluster has one master node, the{' '}
        <strong>Kubernetes API will be unavailable for a few minutes</strong>{' '}
        during the upgrade.
      </p>
    );
  }

  state = {
    loading: false,
    modalVisible: false,
    page: Pages.AboutUpgrading,
  };

  show = () => {
    this.setState({
      modalVisible: true,
      page: Pages.AboutUpgrading,
    });
  };

  close = () => {
    this.setState({
      loading: false,
      modalVisible: false,
    });
  };

  goToPage = (page) => {
    this.setState({
      page,
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
          <FlashMessageComponent type='info'>
            Could not get component information for release version{' '}
            {this.props.cluster.release_version}.<br />
            Unable to show you an exact diff.
          </FlashMessageComponent>
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
                  key={component.name}
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
                  key={component.name}
                  version={component.version}
                />
              );
            }

            return null;
          })}
        </div>

        <DetailsHeadline>
          <b>Details</b>
        </DetailsHeadline>
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

  aboutUpgradingPage = (targetRelease) => {
    return (
      <div>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>
            Upgrade to v{targetRelease}
          </BootstrapModal.Title>
        </BootstrapModal.Header>
        <BootstrapModal.Body>
          <p>
            Please read our{' '}
            <a
              href={clusterUpgradeChecklistURL}
              rel='noopener noreferrer'
              target='_blank'
            >
              checklist for cluster upgrades&nbsp;
              <i className='fa fa-open-in-new' />
            </a>{' '}
            to ensure the cluster and workloads are{' '}
            <strong>prepared for an upgrade</strong>.
          </p>
          {UpgradeClusterModal.getMasterNodesInfo(this.props.cluster)}
        </BootstrapModal.Body>
        <BootstrapModal.Footer>
          <Button
            bsStyle='primary'
            onClick={() => this.goToPage(Pages.InspectChanges)}
          >
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
            Changes from v{this.props.cluster.release_version} to v
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
          .catch((err) => {
            this.setState({
              loading: false,
            });

            ErrorReporter.getInstance().notify(err);
          });
      }
    );
  };

  currentPage = () => {
    switch (this.state.page) {
      case Pages.AboutUpgrading:
        return this.aboutUpgradingPage(this.props.targetRelease?.version);

      case Pages.InspectChanges:
        return this.inspectChangesPage();

      default:
        return null;
    }
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
