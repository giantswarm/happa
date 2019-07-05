import * as clusterActions from '../../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  FlashMessage,
  messageTTL,
  messageType,
} from '../../../lib/flash_message';
import _ from 'underscore';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../../UI/button';
import diff from 'deep-diff';
import PropTypes from 'prop-types';
import React from 'react';

class UpgradeClusterModal extends React.Component {
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
      modalVisible: false,
    });
  };

  inspectChanges = () => {
    this.setState({
      page: 'inspect-changes',
    });
  };

  changedComponents = () => {
    var currentComponents = {};
    if (this.props.release && this.props.release.components) {
      currentComponents = this.props.release.components;
    }

    var components = {};
    currentComponents.forEach(component => {
      components[component.name] = component;
    });

    var targetComponents = {};
    this.props.targetRelease.components.forEach(component => {
      targetComponents[component.name] = component;
    });

    var changedComponents = diff.diff(components, targetComponents);

    return (
      <div>
        {this.props.release === undefined ? (
          <div className='flash-messages--flash-message flash-messages--info'>
            Could not get component information for release version{' '}
            {this.props.cluster.release_version}.<br />
            Unable to show you an exact diff.
          </div>
        ) : (
          undefined
        )}
        <p>
          <b>Component Changes</b>
        </p>
        <div className='release-selector-modal--components'>
          {_.sortBy(changedComponents, 'name').map(diffEdit => {
            if (diffEdit.kind === 'E') {
              let component = components[diffEdit.path[0]];
              return (
                <div
                  className='release-selector-modal--component'
                  key={component.name}
                >
                  <span className='release-selector-modal--component--name'>
                    {component.name}
                  </span>
                  <span className='release-selector-modal--component--version'>
                    <span className='lhs'>
                      <span>{diffEdit.lhs}</span>
                      <span />
                    </span>{' '}
                    <span className='rhs'>{diffEdit.rhs}</span>
                  </span>
                </div>
              );
            }

            if (diffEdit.kind === 'N') {
              let component = diffEdit.rhs;
              return (
                <div
                  className='release-selector-modal--component'
                  key={component.name}
                >
                  <span className='release-selector-modal--component--name'>
                    {component.name}
                  </span>
                  <span className='release-selector-modal--component--version'>
                    <span className='rhs'>{component.version} (added)</span>
                  </span>
                </div>
              );
            }

            if (diffEdit.kind === 'D') {
              let component = diffEdit.lhs;
              return (
                <div
                  className='release-selector-modal--component'
                  key={component.name}
                >
                  <span className='release-selector-modal--component--name'>
                    {component.name}
                  </span>
                  <span className='release-selector-modal--component--version'>
                    <span className='lhs'>
                      <span>{component.version}</span> <span>(removed)</span>
                    </span>
                  </span>
                </div>
              );
            }
          })}
        </div>

        <p>
          <b>Changes</b>
        </p>
        <ul>
          {this.props.targetRelease.changelog.map((changelog, i) => {
            return (
              <li key={changelog.component + i}>
                <b>{changelog.component}:</b> {changelog.description}
              </li>
            );
          })}
        </ul>
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
              The master node will be terminated and replaced by a new one. The
              Kubernetes API will be unavailable during this time.
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
            loading={this.state.loading}
            onClick={this.submit}
          >
            Start Upgrade
          </Button>
          <Button bsStyle='link' onClick={this.close}>
            Cancel
          </Button>
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
        var targetReleaseVersion = this.props.targetRelease.version;

        this.props.clusterActions
          .clusterPatch({
            id: this.props.cluster.id,
            release_version: targetReleaseVersion,
          })
          .then(patchedCluster => {
            this.setState(
              {
                loading: false,
              },
              () => {
                this.props.clusterActions.clusterLoadDetailsSuccess(
                  patchedCluster
                );

                new FlashMessage(
                  'Cluster upgrade initiated.',
                  messageType.INFO,
                  messageTTL.MEDIUM,
                  'Keep an eye on <code>kubectl get nodes</code> to follow the upgrade progress.'
                );

                this.close();
              }
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

  currentPage = () => {
    if (this.state.page === 'about-upgrading') {
      return this.aboutUpgradingPage();
    } else if (this.state.page === 'inspect-changes') {
      return this.inspectChangesPage();
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

export default connect(
  undefined,
  mapDispatchToProps,
  undefined,
  { forwardRef: true }
)(UpgradeClusterModal);
