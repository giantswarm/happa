'use strict';

import React from 'react';
import { connect } from 'react-redux';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from '../button';
import { modalHide } from '../../actions/modalActions';
import { organizationDeleteConfirm,
         organizationCreateConfirm,
         organizationAddMemberConfirm,
         organizationAddMemberTyping,
         organizationRemoveMemberConfirm } from '../../actions/organizationActions';

import { clusterDeleteConfirm } from '../../actions/clusterActions';
import ClusterIDLabel from '../shared/cluster_id_label';
import EmailField from './email_field';

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      emailValid: false
    };
  }

  close = () => {
    this.props.dispatch(modalHide());
  }

  deleteClusterConfirm = (clusterId) => {
    this.props.dispatch(clusterDeleteConfirm(clusterId));
  }

  deleteOrganisation = (orgId) => {
    this.props.dispatch(organizationDeleteConfirm(orgId));
  }

  createOrganisation = (e) => {
    if (e) {
      e.preventDefault();
    }
    var orgId = this.orgId.value;
    this.props.dispatch(organizationCreateConfirm(orgId));
  }

  addMember = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (this.state.emailValid) {
      var email = this.email.value();
      this.props.dispatch(organizationAddMemberConfirm(this.props.modal.templateValues.orgId, email));
    }
  }

  removeMember = (e) => {
    if (e) {
      e.preventDefault();
    }

    var email = this.props.modal.templateValues.email;
    var orgId = this.props.modal.templateValues.orgId;
    this.props.dispatch(organizationRemoveMemberConfirm(orgId, email));
  }

  emailFieldChanged = (emailField) => {
    var email = this.props.modal.templateValues.email;
    var orgId = this.props.modal.templateValues.orgId;
    this.props.dispatch(organizationAddMemberTyping(orgId, email));

    if (emailField.valid()) {
      this.setState({
        emailValid: true
      });
    } else {
      this.setState({
        emailValid: false
      });
    }
  }

  render() {
    switch(this.props.modal.template) {
      case 'organizationDelete':
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Delete an Organization</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>Are you sure you want to delete <code>{this.props.modal.templateValues.orgId}</code>?</p>
              <small>There is no undo</small>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                type='submit'
                bsStyle='danger'
                loading={this.props.modal.templateValues.loading}
                onClick={this.deleteOrganisation.bind(this, this.props.modal.templateValues.orgId)}>
                {
                  this.props.modal.templateValues.loading ?
                  'Deleting Organization'
                  :
                  'Delete Organization'
                }
              </Button>

              {
                this.props.modal.templateValues.loading ?
                null
                :
                <Button
                  bsStyle='link'
                  onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              }
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationCreate':
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Create an Organization</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <form onSubmit={this.createOrganisation.bind(this)} >
                <label>Organization Name:</label>
                <input ref={(i) => {this.orgId = i;}} autoFocus type='text'/>
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                type='submit'
                bsStyle='primary'
                loading={this.props.modal.templateValues.loading}
                onClick={this.createOrganisation.bind(this)}>
                {
                  this.props.modal.templateValues.loading ?
                  'Creating Organization'
                  :
                  'Create Organization'
                }
              </Button>

              {
                this.props.modal.templateValues.loading ?
                null
                :
                <Button
                  bsStyle='link'
                  onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              }
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationAddMember':
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Add a Member</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>You can only add users to this organization if they already have a user account.</p>

              <form onSubmit={this.addMember.bind(this)} >
                <label>Email:</label>
                <EmailField name='email'
                            ref={(e) => {this.email = e;}}
                            onChange={this.emailFieldChanged.bind(this)}
                            errorMessage={this.props.modal.templateValues.errorMessage}
                            autofocus/>
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                type='submit'
                bsStyle='primary'
                loading={this.props.modal.templateValues.loading}
                disabled={ ! this.state.emailValid }
                onClick={this.addMember.bind(this)}>
                {
                  this.props.modal.templateValues.loading ?
                  'Adding Member'
                  :
                  'Add Member to Organization'
                }
              </Button>

              {
                this.props.modal.templateValues.loading ?
                null
                :
                <Button
                  bsStyle='link'
                  onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              }
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationRemoveMember':
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Remove Member</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>Are you sure you want to remove {this.props.modal.templateValues.email} from {this.props.modal.templateValues.orgId}</p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                type='submit'
                bsStyle='danger'
                loading={this.props.modal.templateValues.loading}
                onClick={this.removeMember.bind(this)}>
                {
                  this.props.modal.templateValues.loading ?
                  'Removing Member'
                  :
                  'Remove Member from Organization'
                }
              </Button>

              {
                this.props.modal.templateValues.loading ?
                null
                :
                <Button
                  bsStyle='link'
                  onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              }
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'clusterDelete':
        var cluster = this.props.modal.templateValues.cluster;
        var clusterId = this.props.modal.templateValues.cluster.id;
        var clusterName = this.props.modal.templateValues.cluster.name;
        return (
          <BootstrapModal show={this.props.modal.visible} onHide={this.close.bind(this)}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Are you sure you want to delete cluster <strong>{clusterName}</strong> <ClusterIDLabel clusterID={clusterId} />?</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>All workloads on this cluster will be terminated. Data stored on the worker nodes will be lost.</p>
              <p>There is no way to undo this action.</p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                type='submit'
                bsStyle='danger'
                loading={this.props.modal.templateValues.loading}
                onClick={this.deleteClusterConfirm.bind(this, cluster)}>
                {
                  this.props.modal.templateValues.loading ?
                  'Deleting Cluster'
                  :
                  'Delete Cluster'
                }
              </Button>

              {
                this.props.modal.templateValues.loading ?
                null
                :
                <Button
                  bsStyle='link'
                  onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              }
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      default:
        return null;
    }
  }
}

Modal.propTypes = {
  dispatch: React.PropTypes.func,
  modal: React.PropTypes.object,
  clusters: React.PropTypes.object
};

function mapStateToProps(state) {
  return {
    modal: state.modal,
    selectedOrganization: state.app.selectedOrganization,
    organizations: state.entities.organizations.items,
    clusters: state.entities.clusters.items
  };
}

export default connect(mapStateToProps)(Modal);
