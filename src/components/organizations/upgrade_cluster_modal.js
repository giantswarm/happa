'use strict';

import React from 'react';
import Button from '../button/index';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import * as flashActions from '../../actions/flashMessageActions';

class UpgradeClusterModal extends React.Component {
  constructor (props){
    super(props);

    this.state = {
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
        <BootstrapModal.Title>Inspect changes from version 0.4.0 to  0.6.0</BootstrapModal.Title>
      </BootstrapModal.Header>
      <BootstrapModal.Body>

      </BootstrapModal.Body>
      <BootstrapModal.Footer>
        <Button
          bsStyle='primary'
          onClick={this.inspectChanges}>
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
  giantSwarm: React.PropTypes.func,
  user: React.PropTypes.object,
  clusterActions: React.PropTypes.object,
  flashActions: React.PropTypes.object
};

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    flashActions: bindActionCreators(flashActions, dispatch),
  };
}

export default connect(undefined, mapDispatchToProps, undefined, {withRef: true})(UpgradeClusterModal);

