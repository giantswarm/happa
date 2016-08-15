"use strict";

import React from 'react';
import {connect} from 'react-redux';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import {modalHide} from '../../actions/modalActions';
import {organizationDeleteConfirm, organizationCreateConfirm} from '../../actions/organizationActions';

class Modal extends React.Component {
  close() {
    this.props.dispatch(modalHide());
  }

  deleteOrganisation(orgId) {
    this.props.dispatch(organizationDeleteConfirm(orgId));
  }

  createOrganisation(e) {
    if (e) {
      e.preventDefault();
    }
    var orgId = this.refs.orgId.value;
    this.props.dispatch(organizationCreateConfirm(orgId));
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
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button bsStyle="danger" onClick={this.deleteOrganisation.bind(this, this.props.modal.templateValues.orgId)}>Delete Organization</Button>
              <Button bsStyle="link" onClick={this.close.bind(this)}>Cancel</Button>
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case "organizationCreate":
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Create an Organization</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <h4>Organization Name:</h4>
              <form onSubmit={this.createOrganisation.bind(this)} >
                <input ref="orgId" autoFocus type="text"/>
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button bsStyle="primary" onClick={this.createOrganisation.bind(this)}>Create Organization</Button>
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