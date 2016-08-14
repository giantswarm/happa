"use strict";

import React from 'react';
import {connect} from 'react-redux';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import {modalHide} from '../../actions/modalActions';

class Modal extends React.Component {
  close() {
    this.props.dispatch(modalHide());
  }

  confirm() {
    this.props.dispatch(this.props.modal.confirmAction);
  }

  render() {
    switch(this.props.modal.template) {
      case "organizationDelete":
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Delete an Organization</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <h4>Are you sure you want to delete <code>{this.props.modal.templateValues.orgId}</code>?</h4>
              <small>There is no undo</small>
              <p></p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button bsStyle="danger" onClick={this.confirm.bind(this)}>Delete Organization</Button>
              <Button bsStyle="link" onClick={this.close.bind(this)}>Cancel</Button>
            </BootstrapModal.Footer>
          </BootstrapModal>
        );
      default:
        return null;
    }
  }
}

function mapStateToProps(state, ownProps) {
  return {
    modal: state.modal
  };
}

export default connect(mapStateToProps)(Modal);