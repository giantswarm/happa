import { batchedClusterDeleteConfirmed } from 'actions/batchedActions';
import { clusterDeleteConfirmed } from 'actions/clusterActions';
import { modalHide } from 'actions/modalActions';
import { nodePoolDeleteConfirmed } from 'actions/nodePoolActions';
import {
  organizationAddMemberConfirmed,
  organizationAddMemberTyping,
  organizationCreateConfirmed,
  organizationDeleteConfirmed,
  organizationRemoveMemberConfirmed,
} from 'actions/organizationActions';
import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import EmailField from 'shared/EmailField';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';

class Modals extends React.Component {
  state = {
    emailValid: false,
    organizationNameValid: false,
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
    const orgId = this.orgId.value;
    this.props.dispatch(organizationCreateConfirmed(orgId));
  };

  addMember = e => {
    if (e) {
      e.preventDefault();
    }

    if (this.state.emailValid) {
      const email = this.email.value();
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

    const email = this.props.modal.templateValues.email;
    const orgId = this.props.modal.templateValues.orgId;
    this.props.dispatch(organizationRemoveMemberConfirmed(orgId, email));
  };

  emailFieldChanged = emailField => {
    const email = this.props.modal.templateValues.email;
    const orgId = this.props.modal.templateValues.orgId;
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

  organizationNameFieldChanged = event => {
    const { target } = event;
    this.setState({ organizationNameValid: target.validity.valid });
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
              <p>Organization names must:</p>
              <ul>
                <li>be between 4 and 63 characters long</li>
                <li>
                  contain only letters, numbers, dots (.), hyphens (-) and
                  underscores (_)
                </li>
                <li>must start and end with a letter or number</li>
              </ul>
              <form onSubmit={this.createOrganisation.bind(this)}>
                <label htmlFor='create-organization-name'>
                  Organization Name:
                </label>
                <input
                  id='create-organization-name'
                  autoFocus
                  ref={i => {
                    this.orgId = i;
                  }}
                  type='text'
                  required
                  minLength='4'
                  maxLength='63'
                  pattern='^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$'
                  onChange={this.organizationNameFieldChanged}
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
                disabled={!this.state.organizationNameValid}
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
                <EmailField
                  label='Email:'
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

      case 'clusterDelete': {
        const cluster = this.props.modal.templateValues.cluster;
        const clusterId = this.props.modal.templateValues.cluster.id;
        const clusterName = this.props.modal.templateValues.cluster.name;

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
                onClick={() =>
                  this.props.dispatch(batchedClusterDeleteConfirmed(cluster))
                }
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
      }

      case 'nodePoolDelete': {
        const nodePool = this.props.modal.templateValues.nodePool;
        const nodePoolId = this.props.modal.templateValues.nodePool.id;
        const nodePoolName = this.props.modal.templateValues.nodePool.name;
        const clusterId = this.props.modal.templateValues.clusterId;

        return (
          <BootstrapModal
            onHide={this.close.bind(this)}
            show={this.props.modal.visible}
          >
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>
                Are you sure you want to delete node pool{' '}
                <strong>{nodePoolName}</strong>{' '}
                <ClusterIDLabel clusterID={nodePoolId} />?
              </BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>All workloads on this nodePool will be terminated.</p>
              <p>There is no way to undo this action.</p>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='danger'
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={() =>
                  this.props.dispatch(
                    nodePoolDeleteConfirmed(clusterId, nodePool)
                  )
                }
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Deleting Node Pool'
                  : 'Delete Node Pool'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close.bind(this)}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );
      }

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
