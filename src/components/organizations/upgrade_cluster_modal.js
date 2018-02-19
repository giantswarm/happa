'use strict';

import React from 'react';
import Button from '../button/index';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import * as flashActions from '../../actions/flashMessageActions';
import diff from 'deep-diff';
import _ from 'underscore';

class UpgradeClusterModal extends React.Component {
  constructor (props){
    super(props);

    this.state = {
      loading: false,
      modalVisible: false,
      page: 'about-upgrading'
    };
  }

  show = () => {
    this.setState({
      modalVisible: true,
      page: 'about-upgrading'
    });
  }

  close = () => {
    this.setState({
      modalVisible: false
    });
  }

  inspectChanges = () => {
    this.setState({
      page: 'inspect-changes'
    });
  }

  changedComponents = () => {
    var components = {};
    _.each(this.props.release.components, (component) => {
      components[component.name] = component;
    });

    var targetComponents = {};
    _.each(this.props.targetRelease.components, (component) => {
      targetComponents[component.name] = component;
    });

    var changedComponents = diff.diff(components, targetComponents);

    var changedComponentNames = _.map(changedComponents, (diffEdit) => {
      let component = components[diffEdit.path[0]];

      if (component) {
        return component.name;
      } else {
        return undefined;
      }
    });

    var unchangedComponents = _.filter(components, (component) => {
      return changedComponentNames.indexOf(component.name) === -1;
    });

    return <div>
      <p>
        <b>Component Changes</b>
      </p>
      <div className='release-selector-modal--components'>
        {
           _.map(_.sortBy(changedComponents, 'name'), (diffEdit) => {
            if(diffEdit.kind === 'E') {
              let component = components[diffEdit.path[0]];
              return <div className='release-selector-modal--component' key={component.name}>
                <span className='release-selector-modal--component--name'>{component.name}</span>
                <span className='release-selector-modal--component--version'>
                  <span className='lhs'>
                    <span>{diffEdit.lhs}</span>
                    <span></span>
                  </span>
                  {' '}
                  <span className='rhs'>{diffEdit.rhs}</span>
                </span>
              </div>;
            }

            if(diffEdit.kind === 'N') {
              let component = diffEdit.rhs;
              return <div className='release-selector-modal--component' key={component.name}>
                <span className='release-selector-modal--component--name'>{component.name}</span>
                <span className='release-selector-modal--component--version'>
                  <span className='rhs'>{component.version} (added)</span>
                </span>
              </div>;
            }

            if(diffEdit.kind === 'D') {
              let component = diffEdit.lhs;
              return <div className='release-selector-modal--component' key={component.name}>
                <span className='release-selector-modal--component--name'>{component.name}</span>
                <span className='release-selector-modal--component--version'>
                  <span className='lhs'>
                    <span>{component.version}</span>
                    {' '}
                    <span>(removed)</span>
                  </span>
                </span>
              </div>;
            }
          })
        }
      </div>
      <p>
        <b>Unchanged Components</b>
      </p>
      {
         _.map(_.sortBy(unchangedComponents, 'name'), (component) => {
          return <div className='release-selector-modal--component' key={component.name}>
            <span className='release-selector-modal--component--name'>{component.name}</span>
            <span className='release-selector-modal--component--version'>{component.version}</span>
          </div>;
        })
      }

      <p>
        <b>Changes</b>
      </p>
      <ul>
        {
          _.map(this.props.targetRelease.changelog, (changelog, i) => {
            return <li key={changelog.component + i}>
              <b>{changelog.component}</b><br/>
              {changelog.description}
            </li>;
          })
        }
      </ul>
    </div>;
  }

  aboutUpgradingPage = () => {
    return <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>About Upgrading</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
        <p>Before upgrading please acknowledge the following</p>
        <ul>
          <li>Worker nodes will be drained and then terminated one after another to be replaced by new ones.</li>
          <li>To be able to run all workloads with one worker node missing, please make sure to have enough workers before upgrading.</li>
          <li>The master node will be terminated and replaced by a new one. The Kubernetes API will be unavailable during this time.</li>
        </ul>
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button
          bsStyle='primary'
          onClick={this.inspectChanges}>
          Inspect Changes
        </Button>
        <Button
          bsStyle='link'
          onClick={this.close}>
          Cancel
        </Button>
      </BootstrapModal.Footer>
    </div>;
  }

  inspectChangesPage = () => {
    return <div>
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>Inspect changes from version {this.props.cluster.release_version} to {this.props.targetRelease.version}</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>
      { this.changedComponents() }
      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button
          bsStyle='primary'
          onClick={this.submit}
          loading={this.state.loading}>
          Start Upgrade
        </Button>
        <Button
          bsStyle='link'
          onClick={this.close}>
          Cancel
        </Button>
      </BootstrapModal.Footer>
    </div>;
  }

  submit = () => {
    this.setState({
      loading: true
    }, () => {
      var targetReleaseVersion = this.props.targetRelease.version;

      this.props.clusterActions.clusterPatch({id: this.props.cluster.id, release_version: targetReleaseVersion})
      .then((patchedCluster) => {
        this.setState({
          loading: false
        }, () => {
          this.props.clusterActions.clusterLoadDetailsSuccess(patchedCluster);
          this.props.flashActions.flashAdd({
            message: <div>
              <strong>Successfully requested cluster upgrade.</strong><br/>
              Keep an eye on <code>kubectl get nodes</code> to see the progress of the upgrade.
            </div>,
            class: 'success'
          });
          this.close();
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: error
        });
      });
    });
  }

  currentPage = () => {
    if (this.state.page === 'about-upgrading') {
      return this.aboutUpgradingPage();
    } else if (this.state.page === 'inspect-changes') {
      return this.inspectChangesPage();
    }
  }

  render() {
    return (
      <BootstrapModal show={this.state.modalVisible} onHide={this.close}>
      { this.currentPage() }
      </BootstrapModal>
    );
  }
}

UpgradeClusterModal.propTypes = {
  cluster: React.PropTypes.object,
  clusterActions: React.PropTypes.object,
  flashActions: React.PropTypes.object,
  giantSwarm: React.PropTypes.func,
  release: React.PropTypes.object,
  targetRelease: React.PropTypes.object,
  user: React.PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    flashActions: bindActionCreators(flashActions, dispatch),
  };
}

export default connect(undefined, mapDispatchToProps, undefined, {withRef: true})(UpgradeClusterModal);

