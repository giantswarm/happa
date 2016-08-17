"use strict";

import React from 'react';
import {connect} from 'react-redux';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../button';
import {modalHide} from '../../actions/modalActions';
import {organizationDeleteConfirm,
        organizationCreateConfirm,
        organizationAddMemberConfirm,
        organizationRemoveMemberConfirm} from '../../actions/organizationActions';

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

  addMember(e) {
    if (e) {
      e.preventDefault();
    }
    var username = this.refs.username.value;
    this.props.dispatch(organizationAddMemberConfirm(this.props.modal.templateValues.orgId, username));
  }

  removeMember(e) {
    if (e) {
      e.preventDefault();
    }

    var username = this.props.modal.templateValues.username;
    var orgId = this.props.modal.templateValues.orgId;
    this.props.dispatch(organizationRemoveMemberConfirm(orgId, username));
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
              <Button
                type="submit"
                bsStyle="danger"
                loading={this.props.modal.templateValues.loading}
                onClick={this.deleteOrganisation.bind(this, this.props.modal.templateValues.orgId)}>
                {
                  this.props.modal.templateValues.loading ?
                  "Deleting Organization"
                  :
                  "Delete Organization"
                }
              </Button>

              {
                this.props.modal.templateValues.loading ?
                null
                :
                <Button
                  bsStyle="link"
                  onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              }
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
              <Button
                type="submit"
                bsStyle="primary"
                loading={this.props.modal.templateValues.loading}
                onClick={this.createOrganisation.bind(this)}>
                {
                  this.props.modal.templateValues.loading ?
                  "Creating Organization"
                  :
                  "Create Organization"
                }
              </Button>

              {
                this.props.modal.templateValues.loading ?
                null
                :
                <Button
                  bsStyle="link"
                  onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              }
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case "organizationAddMember":
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Add a Member</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <h4>Username:</h4>
              <form onSubmit={this.addMember.bind(this)} >
                <input ref="username" autoFocus type="text"/>
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button bsStyle="primary" onClick={this.addMember.bind(this)}>Add Member to Organization</Button>
              <Button bsStyle="link" onClick={this.close.bind(this)}>Cancel</Button>
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case "organizationRemoveMember":
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Remove Member</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>Are you sure you want to remove {this.props.modal.templateValues.username} from {this.props.modal.templateValues.orgId}</p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button bsStyle="danger" onClick={this.removeMember.bind(this)}>Remove Member from Organization</Button>
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