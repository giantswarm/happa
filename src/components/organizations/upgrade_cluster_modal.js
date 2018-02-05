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
    };
  }

  show = () => {
    this.setState({
      modalVisible: true
    });
  }

  close = () => {
    this.setState({
      modalVisible: false
    });
  }

  render() {
    return (
      <BootstrapModal show={this.state.modalVisible} onHide={this.close}>
        <BootstrapModal.Header closeButton>
          <BootstrapModal.Title>Upgrade Cluster</BootstrapModal.Title>
        </BootstrapModal.Header>
          <BootstrapModal.Body>
          </BootstrapModal.Body>
          <BootstrapModal.Footer>
            <Button
              bsStyle='link'
              onClick={this.close}>
              Cancel
            </Button>
            </BootstrapModal.Footer>
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

