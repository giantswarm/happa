import { Box } from 'grommet';
import { batchedOrganizationDeleteConfirmed } from 'model/stores/batchActions';
import { modalHide } from 'model/stores/modal/actions';
import { nodePoolDeleteConfirmed } from 'model/stores/nodepool/actions';
import {
  organizationAddMemberConfirmed,
  organizationCreateConfirmed,
  organizationRemoveMemberConfirmed,
} from 'model/stores/organization/actions';
import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import TextInput from 'UI/Inputs/TextInput';
import Modal from 'UI/Layout/Modal';

const emailRegexp =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const organizationNameRegexp = /^(([a-z0-9][-a-z0-9]*)?[a-z0-9])?$/;

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
    const organizationNameValidationError =
      this.validateOrganizationName(newOrgName);

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

  // eslint-disable-next-line class-methods-use-this
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
          <Modal
            onClose={this.close}
            visible={this.props.modal.visible}
            title='Delete an Organization'
            footer={
              <Box gap='small' direction='row' justify='end'>
                <Button
                  danger={true}
                  loading={this.props.modal.templateValues.loading}
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
                    ? 'Deleting organization'
                    : 'Delete organization'}
                </Button>

                {this.props.modal.templateValues.loading ? null : (
                  <Button link={true} onClick={this.close}>
                    Cancel
                  </Button>
                )}
              </Box>
            }
          >
            <p>
              Are you sure you want to delete{' '}
              <code>{this.props.modal.templateValues.orgId}</code>?
            </p>
            <small>There is no undo</small>
          </Modal>
        );

      case 'organizationCreate':
        return (
          <Modal
            onClose={this.close}
            visible={this.props.modal.visible}
            title='Create an Organization'
            footer={
              <Box gap='small' direction='row' justify='end'>
                <Button
                  primary={true}
                  loading={this.props.modal.templateValues.loading}
                  onClick={this.createOrganisation}
                  type='submit'
                  disabled={
                    this.state.organizationNameValidationError.length > 0
                  }
                >
                  {this.props.modal.templateValues.loading
                    ? 'Creating organization'
                    : 'Create organization'}
                </Button>

                {this.props.modal.templateValues.loading ? null : (
                  <Button link={true} onClick={this.close}>
                    Cancel
                  </Button>
                )}
              </Box>
            }
          >
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
          </Modal>
        );

      case 'organizationAddMember':
        return (
          <Modal
            onClose={this.close}
            visible={this.props.modal.visible}
            title='Add a Member'
            footer={
              <Box gap='small' direction='row' justify='end'>
                <Button
                  primary={true}
                  disabled={this.state.emailValidationError.length > 0}
                  loading={this.props.modal.templateValues.loading}
                  onClick={this.addMember}
                  type='submit'
                >
                  {this.props.modal.templateValues.loading
                    ? 'Adding member'
                    : 'Add member to organization'}
                </Button>

                {this.props.modal.templateValues.loading ? null : (
                  <Button link={true} onClick={this.close}>
                    Cancel
                  </Button>
                )}
              </Box>
            }
          >
            <p>
              You can only add users to this organization if they already have a
              user account.
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
          </Modal>
        );

      case 'organizationRemoveMember':
        return (
          <Modal
            onClose={this.close}
            visible={this.props.modal.visible}
            title='Remove Member'
            footer={
              <Box gap='small' direction='row' justify='end'>
                <Button
                  danger={true}
                  loading={this.props.modal.templateValues.loading}
                  onClick={this.removeMember.bind(this)}
                  type='submit'
                >
                  {this.props.modal.templateValues.loading
                    ? 'Removing member'
                    : 'Remove member from organization'}
                </Button>

                {this.props.modal.templateValues.loading ? null : (
                  <Button link={true} onClick={this.close}>
                    Cancel
                  </Button>
                )}
              </Box>
            }
          >
            <p>
              Are you sure you want to remove{' '}
              {this.props.modal.templateValues.email} from{' '}
              {this.props.modal.templateValues.orgId}
            </p>
          </Modal>
        );

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
          <Modal
            onClose={this.close}
            visible={this.props.modal.visible}
            title='Delete node pool'
            footer={
              <Box gap='small' direction='row' justify='end'>
                <Button
                  danger={true}
                  loading={this.props.modal.templateValues.loading}
                  onClick={() =>
                    this.props.dispatch(
                      nodePoolDeleteConfirmed(clusterId, nodePool)
                    )
                  }
                  type='submit'
                >
                  {this.props.modal.templateValues.loading
                    ? 'Deleting node pool'
                    : 'Delete node pool'}
                </Button>

                {this.props.modal.templateValues.loading ? null : (
                  <Button link={true} onClick={this.close}>
                    Cancel
                  </Button>
                )}
              </Box>
            }
          >
            {bodyText}
          </Modal>
        );
      }

      default:
        return null;
    }
  }
}

function mapStateToProps(state) {
  return {
    modal: state.modal,
    selectedOrganization: state.main.selectedOrganization,
    organizations: state.entities.organizations.items,
    clusters: state.entities.clusters.items,
  };
}

export default connect(mapStateToProps)(Modals);
