import PropTypes from 'prop-types';
import React from 'react';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { connect } from 'react-redux';
import {
  batchedClusterDeleteConfirmed,
  batchedOrganizationDeleteConfirmed,
} from 'stores/batchActions';
import { modalHide } from 'stores/modal/actions';
import { nodePoolDeleteConfirmed } from 'stores/nodepool/actions';
import {
  organizationAddMemberConfirmed,
  organizationCreateConfirmed,
  organizationRemoveMemberConfirmed,
} from 'stores/organization/actions';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import TextInput from 'UI/Inputs/TextInput';

const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const organizationNameRegexp = /^(([a-z][-a-z0-9]*)?[a-z0-9])?$/;

const NodePoolTextDiv = styled.div`
  strong {
    font-weight: 700;
  }
  .details {
    margin-bottom: 10px;
    > * {
      margin-left: 15px;
    }
  }
`;

class Modals extends React.Component {
  state = {
    email: '',
    emailValidationError: 'Must not be empty',
    organizationNameValidationError: 'Must not be empty',
    organizationName: '',
  };

  componentDidUpdate(prevProps) {
    const { visible: modalWasVisible } = prevProps.modal;

    if (modalWasVisible && this.props.modal.visible !== modalWasVisible) {
      this.clear();
    }
  }

  close = () => {
    this.props.dispatch(modalHide());
  };

  clear() {
    const newOrgName = '';
    const organizationNameValidationError = this.validateOrganizationName(
      newOrgName
    );

    const newEmail = '';
    const emailValidationError = this.validateOrganizationName(newEmail);

    this.setState({
      email: newEmail,
      emailValidationError,
      organizationNameValidationError,
      organizationName: newOrgName,
    });
  }

  createOrganisation = (e) => {
    e.preventDefault();

    const { organizationName, organizationNameValidationError } = this.state;
    if (organizationNameValidationError.length < 1) {
      this.props.dispatch(organizationCreateConfirmed(organizationName));
    }
  };

  addMember = (e) => {
    e.preventDefault();

    const { email, emailValidationError } = this.state;
    if (emailValidationError.length < 1) {
      this.props.dispatch(
        organizationAddMemberConfirmed(
          this.props.modal.templateValues.orgId,
          email
        )
      );
    }
  };

  removeMember = (e) => {
    e.preventDefault();

    const email = this.props.modal.templateValues.email;
    const orgId = this.props.modal.templateValues.orgId;
    this.props.dispatch(organizationRemoveMemberConfirmed(orgId, email));
  };

  emailFieldChanged = (e) => {
    const email = e.target.value;

    const validationError = !emailRegexp.test(email)
      ? 'Must be a valid email address'
      : '';
    this.setState({
      email,
      emailValidationError: validationError,
    });
  };

  onOrganizationNameChange = (e) => {
    const organizationName = e.target.value;

    const validationError = this.validateOrganizationName(organizationName);
    this.setState({
      organizationName,
      organizationNameValidationError: validationError,
    });
  };

  validateOrganizationName = (organizationName) => {
    switch (true) {
      case !organizationName:
        return 'Must not be empty';
      // eslint-disable-next-line no-magic-numbers
      case organizationName.length < 4 || organizationName.length > 63:
        return 'Must be between 4 and 63 characters long';
      case !organizationNameRegexp.test(organizationName):
        return 'Must have valid format';
      default:
        return '';
    }
  };

  render() {
    switch (this.props.modal.template) {
      case 'organizationDelete':
        return (
          <BootstrapModal onHide={this.close} show={this.props.modal.visible}>
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
                onClick={() =>
                  this.props.dispatch(
                    batchedOrganizationDeleteConfirmed(
                      this.props.modal.templateValues.orgId
                    )
                  )
                }
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Deleting Organization'
                  : 'Delete Organization'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationCreate':
        return (
          <BootstrapModal onHide={this.close} show={this.props.modal.visible}>
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
              <form onSubmit={this.createOrganisation}>
                <TextInput
                  id='create-organization-name'
                  name='create-organization-name'
                  autoFocus={true}
                  label='Organization Name'
                  value={this.state.organizationName}
                  onChange={this.onOrganizationNameChange}
                  error={this.state.organizationNameValidationError}
                />
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='primary'
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={this.createOrganisation}
                type='submit'
                disabled={this.state.organizationNameValidationError.length > 0}
              >
                {this.props.modal.templateValues.loading
                  ? 'Creating Organization'
                  : 'Create Organization'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationAddMember':
        return (
          <BootstrapModal onHide={this.close} show={this.props.modal.visible}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Add a Member</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>
              <p>
                You can only add users to this organization if they already have
                a user account.
              </p>

              <form onSubmit={this.addMember}>
                <TextInput
                  label='Email'
                  autoFocus={true}
                  error={this.props.modal.templateValues.errorMessage}
                  name='email'
                  id='email'
                  value={this.state.email}
                  onChange={this.emailFieldChanged}
                />
              </form>
            </BootstrapModal.Body>
            <BootstrapModal.Footer>
              <Button
                bsStyle='primary'
                disabled={this.state.emailValidationError.length > 0}
                loading={this.props.modal.templateValues.loading}
                loadingPosition='left'
                onClick={this.addMember}
                type='submit'
              >
                {this.props.modal.templateValues.loading
                  ? 'Adding Member'
                  : 'Add Member to Organization'}
              </Button>

              {this.props.modal.templateValues.loading ? null : (
                <Button bsStyle='link' onClick={this.close}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );

      case 'organizationRemoveMember':
        return (
          <BootstrapModal onHide={this.close} show={this.props.modal.visible}>
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
                <Button bsStyle='link' onClick={this.close}>
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
          <BootstrapModal onHide={this.close} show={this.props.modal.visible}>
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
                <Button bsStyle='link' onClick={this.close}>
                  Cancel
                </Button>
              )}
            </BootstrapModal.Footer>
          </BootstrapModal>
        );
      }

      case 'nodePoolDelete': {
        const { nodePool, clusterId } = this.props.modal.templateValues;
        const { id: nodePoolId, name: nodePoolName } = nodePool;
        const isLastNodePool =
          this.props.clusters[clusterId].nodePools.length === 1;

        const details = (
          <div className='details'>
            <ClusterIDLabel clusterID={nodePoolId} />{' '}
            <strong>{nodePoolName}</strong>
          </div>
        );

        const bodyText = isLastNodePool ? (
          <NodePoolTextDiv>
            <p>Do you want to delete this cluster&apos;s only node pool?</p>
            {details}
            <p>
              <strong>Warning</strong>: There are no other node pools. When
              deleting this node pool, all workloads will be terminated and
              cannot be scheduled anywhere.
            </p>
          </NodePoolTextDiv>
        ) : (
          <NodePoolTextDiv>
            <p>Do you want to delete this node pool?</p>
            {details}
            <p>
              Nodes will be drained and workloads re-scheduled, if possible, to
              nodes from other pools.
            </p>
            <p>
              <strong>Note</strong>: Make sure your scheduling rules are
              tolerant enough so that workloads can be re-assigned.
            </p>
          </NodePoolTextDiv>
        );

        return (
          <BootstrapModal onHide={this.close} show={this.props.modal.visible}>
            <BootstrapModal.Header closeButton>
              <BootstrapModal.Title>Delete node pool</BootstrapModal.Title>
            </BootstrapModal.Header>
            <BootstrapModal.Body>{bodyText}</BootstrapModal.Body>
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
                <Button bsStyle='link' onClick={this.close}>
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
    selectedOrganization: state.main.selectedOrganization,
    organizations: state.entities.organizations.items,
    clusters: state.entities.clusters.items,
  };
}

export default connect(mapStateToProps)(Modals);
