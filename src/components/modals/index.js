import { clusterDeleteConfirmed } from 'actions/clusterActions';
import { connect } from 'react-redux';
import { modalHide } from 'actions/modalActions';
import {
  organizationAddMemberConfirmed,
  organizationAddMemberTyping,
  organizationCreateConfirmed,
  organizationDeleteConfirmed,
  organizationRemoveMemberConfirmed,
} from 'actions/organizationActions';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/button';
import ClusterIDLabel from 'UI/cluster_id_label';
import EmailField from 'shared/email_field';
import PropTypes from 'prop-types';
import React from 'react';

class Modals extends React.Component {
  state = {
    emailValid: false,
  };

  close = () => {
    this.props.dispatch(modalHide());
  };

  deleteClusterConfirmed = clusterId => {
    this.props.dispatch(clusterDeleteConfirmed(clusterId));
  };

  deleteOrganisation = orgId => {
    this.props.dispatch(organizationDeleteConfirmed(orgId));
  };

  createOrganisation = e => {
    if (e) {
      e.preventDefault();
    }
    var orgId = this.orgId.value;
    this.props.dispatch(organizationCreateConfirmed(orgId));
  };

  addMember = e => {
    if (e) {
      e.preventDefault();
    }

    if (this.state.emailValid) {
      var email = this.email.value();
      this.props.dispatch(
        organizationAddMemberConfirmed(
          this.props.modal.templateValues.orgId,
          email
        )
      );
    }
  };

  removeMember = e => {
    if (e) {
      e.preventDefault();
    }

    var email = this.props.modal.templateValues.email;
    var orgId = this.props.modal.templateValues.orgId;
    this.props.dispatch(organizationRemoveMemberConfirmed(orgId, email));
  };

  emailFieldChanged = emailField => {
    var email = this.props.modal.templateValues.email;
    var orgId = this.props.modal.templateValues.orgId;
    this.props.dispatch(organizationAddMemberTyping(orgId, email));

    if (emailField.valid()) {
      this.setState({
        emailValid: true,
      });
    } else {
      this.setState({
        emailValid: false,
      });
    }
  };

  render() {
    switch (this.props.modal.template) {
      case 'organizationDelete':
        return (
          <BootstrapModal
            onHide={this.close.bind(this)}
            show={this.props.modal.visible}
          >
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>
                Delete an Organization
              </BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>
                Are you sure you want to delete{' '}
                <code>{this.props.modal.templateValues.orgId}</code>?
              </p>
              <small>There is no undo</small>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='danger'
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={this.deleteOrganisation.bind(
                  this,
                  this.props.modal.templateValues.orgId
                )}
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Deleting Organization'
                  : 'Delete Organization'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationCreate':
        return (
          <BootstrapModal
            onHide={this.close.bind(this)}
            show={this.props.modal.visible}
          >
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>
                Create an Organization
              </BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <form onSubmit={this.createOrganisation.bind(this)}>
                <label>Organization Name:</label>
                <input
                  autoFocus
                  ref={i => {
                    this.orgId = i;
                  }}
                  type='text'
                />
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='primary'
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={this.createOrganisation.bind(this)}
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Creating Organization'
                  : 'Create Organization'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationAddMember':
        return (
          <BootstrapModal
            onHide={this.close.bind(this)}
            show={this.props.modal.visible}
          >
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Add a Member</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>
                You can only add users to this organization if they already have
                a user account.
              </p>

              <form onSubmit={this.addMember.bind(this)}>
                <label>Email:</label>
                <EmailField
                  autofocus
                  errorMessage={this.props.modal.templateValues.errorMessage}
                  name='email'
                  onChange={this.emailFieldChanged.bind(this)}
                  ref={e => {
                    this.email = e;
                  }}
                />
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='primary'
                disabled={!this.state.emailValid}
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={this.addMember.bind(this)}
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Adding Member'
                  : 'Add Member to Organization'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationRemoveMember':
        return (
          <BootstrapModal
            onHide={this.close.bind(this)}
            show={this.props.modal.visible}
          >
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Remove Member</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>
                Are you sure you want to remove{' '}
                {this.props.modal.templateValues.email} from{' '}
                {this.props.modal.templateValues.orgId}
              </p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='danger'
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={this.removeMember.bind(this)}
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Removing Member'
                  : 'Remove Member from Organization'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'clusterDelete':
        var cluster = this.props.modal.templateValues.cluster;
        var clusterId = this.props.modal.templateValues.cluster.id;
        var clusterName = this.props.modal.templateValues.cluster.name;
        return (
          <BootstrapModal
            onHide={this.close.bind(this)}
            show={this.props.modal.visible}
          >
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>
                Are you sure you want to delete cluster{' '}
                <strong>{clusterName}</strong>{' '}
                <ClusterIDLabel clusterID={clusterId} />?
              </BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>
                All workloads on this cluster will be terminated. Data stored on
                the worker nodes will be lost.
              </p>
              <p>There is no way to undo this action.</p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='danger'
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={this.deleteClusterConfirmed.bind(this, cluster)}
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Deleting Cluster'
                  : 'Delete Cluster'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      default:
        return null;
    }
  }
}

Modals.propTypes = {
  dispatch: PropTypes.func,
  modal: PropTypes.object,
  clusters: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    modal: state.modal,
    selectedOrganization: state.app.selectedOrganization,
    organizations: state.entities.organizations.items,
    clusters: state.entities.clusters.items,
  };
}

export default connect(mapStateToProps)(Modals);
