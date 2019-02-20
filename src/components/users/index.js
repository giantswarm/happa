'use strict';

import React from 'react';
import { connect } from 'react-redux';
import {
  usersLoad,
  userRemoveExpiration,
  userDelete,
} from '../../actions/userActions';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import {
  invitationsLoad,
  invitationCreate,
} from '../../actions/invitationActions';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'react-breadcrumbs';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { push } from 'connected-react-router';
import Button from '../shared/button';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
import { relativeDate } from '../../lib/helpers.js';
import copy from 'copy-to-clipboard';

class Users extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedUser: null,
      modal: {
        visible: false,
        loading: false,
      },
      invitationForm: {
        email: '',
        error: '',
        organization: props.organizations,
        sendEmail: true,
        valid: true,
      },
    };
  }

  componentDidMount() {
    if (this.props.currentUser.isAdmin) {
      this.props
        .dispatch(usersLoad())
        .then(this.props.dispatch(invitationsLoad()));
    } else {
      this.props.dispatch(push('/'));
    }
  }

  removeExpiration(email) {
    this.setState({
      selectedUser: email,
      modal: {
        template: 'unexpireUser',
        visible: true,
        loading: false,
      },
    });
  }

  confirmRemoveExpiration(email) {
    this.setState({
      modal: {
        visible: true,
        loading: true,
      },
    });

    this.props
      .dispatch(userRemoveExpiration(email))
      .then(() => {
        this.closeModal();
      })
      .catch(() => {
        this.closeModal();
      });
  }

  deleteUser(email) {
    this.setState({
      selectedUser: email,
      modal: {
        template: 'deleteUser',
        visible: true,
        loading: false,
      },
    });
  }

  confirmDeleteUser(email) {
    this.setState({
      modal: {
        template: 'deleteUser',
        visible: true,
        loading: true,
      },
    });

    this.props
      .dispatch(userDelete(email))
      .then(() => {
        this.closeModal();
      })
      .catch(() => {
        this.closeModal();
      });
  }

  inviteUser() {
    this.setState({
      modal: {
        template: 'inviteUser',
        visible: true,
        loading: false,
      },
      invitationForm: {
        email: '',
        error: '',
        organization: this.props.selectedOrganization,
        sendEmail: true,
        valid: true,
      },
    });
  }

  confirmInviteUser() {
    this.setState({
      modal: {
        template: 'inviteUser',
        visible: true,
        loading: true,
      },
    });

    this.props
      .dispatch(usersLoad()) // Hack to ensure fresh Giant Swarm access token before inviting the user.
      .then(() => {
        return this.props.dispatch(invitationCreate(this.state.invitationForm));
      })
      .then(result => {
        this.setState({
          modal: {
            template: 'inviteUserDone',
            invitationResult: result,
            visible: true,
            loading: false,
          },
        });
      })
      .catch(() => {
        this.closeModal();
      });
  }

  handleEmailChange(e) {
    var invitationForm = Object.assign({}, this.state.invitationForm);

    invitationForm.email = e.target.value;

    invitationForm = this.validateInvitationForm(invitationForm);

    this.setState({
      invitationForm: invitationForm,
    });
  }

  validateInvitationForm(invitationForm) {
    invitationForm.valid = true;
    invitationForm.error = '';

    // Don't allow adding non @giantswarm.io emails to the giantswarm org
    // since we know there is a serverside validation against that as well.
    if (invitationForm.organization === 'giantswarm') {
      if (!isGiantSwarmEmail(invitationForm.email)) {
        invitationForm.valid = false;
        invitationForm.error =
          'Only @giantswarm.io domains may be invited to the giantswarm organization.';
      }
    }

    return invitationForm;
  }

  handleSendEmailChange(e) {
    var invitationForm = Object.assign({}, this.state.invitationForm);
    var checked = e.target.checked;
    invitationForm.sendEmail = checked;

    this.setState({
      invitationForm: invitationForm,
    });
  }

  handleOrganizationChange(orgId) {
    var invitationForm = Object.assign({}, this.state.invitationForm);

    invitationForm.organization = orgId;

    invitationForm = this.validateInvitationForm(invitationForm);

    this.setState({
      invitationForm: invitationForm,
    });
  }

  closeModal() {
    this.setState({
      modal: {
        visible: false,
        loading: false,
      },
    });
  }

  // Provides the configuraiton for the clusters table
  getTableColumnsConfig = () => {
    return [
      {
        dataField: 'email',
        text: 'Email',
        sort: true,
      },
      {
        dataField: 'emaildomain',
        text: 'Email Domain',
        sort: true,
      },
      {
        dataField: 'created',
        text: 'Created',
        sort: true,
        formatter: relativeDate,
      },
      {
        dataField: 'expiry',
        text: 'Expiry',
        sort: true,
        formatter: expiryCellFormatter.bind(this),
      },
      {
        dataField: 'actionsDummy',
        isDummyField: true,
        text: '',
        align: 'right',
        formatter: actionsCellFormatter.bind(this),
      },
    ];
  };

  copyToClipboard(value) {
    this.setState({
      copied: true,
    });

    setTimeout(() => {
      this.setState({
        copied: false,
      });
    }, 1000);

    copy(value);
  }

  // Provides the configuraiton for the clusters table
  getTableColumnsConfig = () => {
    return [
      {
        classes: 'email',
        dataField: 'email',
        text: 'Email',
        sort: true,
      },
      {
        classes: 'emaildomain',
        dataField: 'emaildomain',
        text: 'Email Domain',
        sort: true,
      },
      {
        classes: 'created',
        dataField: 'created',
        text: 'Created',
        sort: true,
        formatter: relativeDate,
      },
      {
        classes: 'expiry',
        dataField: 'expiry',
        text: 'Expiry',
        sort: true,
        formatter: expiryCellFormatter.bind(this),
      },
      {
        classes: 'status',
        dataField: 'status',
        text: 'STATUS',
        sort: true,
        formatter: statusCellFormatter.bind(this),
      },
      {
        classes: 'actions',
        dataField: 'actionsDummy',
        isDummyField: true,
        text: '',
        align: 'right',
        formatter: actionsCellFormatter.bind(this),
      },
    ];
  };

  render() {
    return (
      <Breadcrumb data={{ title: 'USERS', pathname: '/users/' }}>
        <DocumentTitle title='Users | Giant Swarm'>
          <div>
            <div className='row'>
              <div className='col-7'>
                <h1>Users</h1>
              </div>
              <div className='col-5'>
                <div className='pull-right btn-group'>
                  <Button onClick={this.inviteUser.bind(this)}>
                    <i className='fa fa-add-circle' /> INVITE USER
                  </Button>
                </div>
              </div>
            </div>
            <p>
              This is the list of user accounts on{' '}
              <code>
                {this.props.installation_name
                  ? this.props.installation_name
                  : 'unknown installation'}
              </code>
            </p>
            <br />
            <h5>What about SSO users?</h5>
            <p>
              SSO users don&apos;t have user objects. They are defined by
              whatever is in the JWT token being used by that user.
            </p>
            <br />
            {(() => {
              if (
                !this.props.users ||
                (this.props.users.isFetching &&
                  Object.keys(this.props.users.items).length === 0)
              ) {
                return (
                  <img
                    className='loader'
                    src='/images/loader_oval_light.svg'
                    width='20px'
                    height='20px'
                  />
                );
              } else if (
                Object.keys(this.props.users.items).length === 0 &&
                Object.keys(this.props.invitations.items).length === 0
              ) {
                return (
                  <div>
                    <p>No users in the system yet.</p>
                  </div>
                );
              } else {
                return (
                  <div className='users-table'>
                    <BootstrapTable
                      keyField='email'
                      data={Object.values(this.props.invitationsAndUsers)}
                      columns={this.getTableColumnsConfig()}
                      bordered={false}
                      defaultSorted={tableDefaultSorting}
                      defaultSortDirection='asc'
                    />
                  </div>
                );
              }
            })()}

            {(() => {
              switch (this.state.modal.template) {
                case 'unexpireUser':
                  return (
                    <BootstrapModal
                      className='create-key-pair-modal'
                      show={this.state.modal.visible}
                      onHide={this.closeModal.bind(this)}
                    >
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>
                          Remove Expiration Date from {this.state.selectedUser}
                        </BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <p>
                          Are you sure you want to remove the expiration date
                          from {this.state.selectedUser}?
                        </p>
                        <p>This account will never expire.</p>
                        <p>
                          If the account was expired, the user will be able to
                          log in again.
                        </p>
                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          type='submit'
                          bsStyle='primary'
                          loading={this.state.modal.loading}
                          onClick={this.confirmRemoveExpiration.bind(
                            this,
                            this.state.selectedUser
                          )}
                        >
                          {this.state.modal.loading
                            ? 'Removing Expiration'
                            : 'Remove Expiration'}
                        </Button>

                        {this.state.modal.loading ? null : (
                          <Button
                            bsStyle='link'
                            onClick={this.closeModal.bind(this)}
                          >
                            Cancel
                          </Button>
                        )}
                      </BootstrapModal.Footer>
                    </BootstrapModal>
                  );

                case 'deleteUser':
                  return (
                    <BootstrapModal
                      className='create-key-pair-modal'
                      show={this.state.modal.visible}
                      onHide={this.closeModal.bind(this)}
                    >
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>
                          Delete {this.state.selectedUser}
                        </BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <p>
                          Are you sure you want to delete{' '}
                          {this.state.selectedUser}?
                        </p>
                        <p>There is no undo.</p>
                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          type='submit'
                          bsStyle='danger'
                          loading={this.state.modal.loading}
                          onClick={this.confirmDeleteUser.bind(
                            this,
                            this.state.selectedUser
                          )}
                        >
                          {this.state.modal.loading
                            ? 'Deleting User'
                            : 'Delete User'}
                        </Button>

                        {this.state.modal.loading ? null : (
                          <Button
                            bsStyle='link'
                            onClick={this.closeModal.bind(this)}
                          >
                            Cancel
                          </Button>
                        )}
                      </BootstrapModal.Footer>
                    </BootstrapModal>
                  );

                case 'inviteUser':
                  return (
                    <BootstrapModal
                      className='create-key-pair-modal'
                      show={this.state.modal.visible}
                      onHide={this.closeModal.bind(this)}
                    >
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>
                          Invite a New User
                        </BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <form
                          onSubmit={e => {
                            e.preventDefault();
                          }}
                        >
                          <p>
                            Creating an invitation is the way to get new people
                            onto this installation.
                          </p>
                          <p>Invitations are valid for 48 hours.</p>

                          <div className='textfield'>
                            <label>Email:</label>
                            <input
                              autoFocus
                              type='text'
                              onChange={this.handleEmailChange.bind(this)}
                              value={this.state.invitationForm.email}
                            />
                          </div>

                          <div className='textfield'>
                            <label>Organization:</label>
                            <DropdownButton
                              id='organizationDropdown'
                              className='outline'
                              title={this.state.invitationForm.organization}
                            >
                              {_.sortBy(
                                this.props.organizations.items,
                                'id'
                              ).map(organization => (
                                <MenuItem
                                  key={organization.id}
                                  onClick={this.handleOrganizationChange.bind(
                                    this,
                                    organization.id
                                  )}
                                >
                                  {organization.id}
                                </MenuItem>
                              ))}
                            </DropdownButton>
                          </div>

                          <div className='textfield'>
                            <label>Send Email:</label>
                            <div className='checkbox'>
                              <label htmlFor='sendEmail'>
                                <input
                                  type='checkbox'
                                  onChange={this.handleSendEmailChange.bind(
                                    this
                                  )}
                                  id='sendEmail'
                                  checked={this.state.invitationForm.sendEmail}
                                />
                                Send the invitee an e-mail with the accept
                                invitation link.
                              </label>
                            </div>
                          </div>
                          {this.state.invitationForm.error !== '' ? (
                            <div className='flash-messages--flash-message flash-messages--danger'>
                              {this.state.invitationForm.error}
                            </div>
                          ) : (
                            undefined
                          )}
                        </form>
                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          type='submit'
                          bsStyle='primary'
                          loading={this.state.modal.loading}
                          disabled={!this.state.invitationForm.valid}
                          onClick={this.confirmInviteUser.bind(this)}
                        >
                          {this.state.modal.loading
                            ? 'Inviting User'
                            : 'Invite User'}
                        </Button>

                        {this.state.modal.loading ? null : (
                          <Button
                            bsStyle='link'
                            onClick={this.closeModal.bind(this)}
                          >
                            Cancel
                          </Button>
                        )}
                      </BootstrapModal.Footer>
                    </BootstrapModal>
                  );

                case 'inviteUserDone':
                  return (
                    <BootstrapModal
                      className='create-key-pair-modal'
                      show={this.state.modal.visible}
                      onHide={this.closeModal.bind(this)}
                    >
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>
                          {this.state.invitationForm.email} has been Invited
                        </BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <p>Invitation has been created succesfully!</p>
                        {this.state.invitationForm.sendEmail ? (
                          <p>
                            An email has been sent to{' '}
                            {this.state.invitationForm.email} with further
                            instructions.
                          </p>
                        ) : (
                          <p>
                            You&apos;ve chosen not to send them an email. Send
                            them the link below to accept the invitation.
                          </p>
                        )}
                        <label>Invitation Accept Link:</label>
                        <br />
                        <code>
                          {
                            this.state.modal.invitationResult
                              .invitation_accept_link
                          }
                        </code>
                        &nbsp;
                        {this.state.copied ? (
                          <i className='fa fa-done' aria-hidden='true' />
                        ) : (
                          <OverlayTrigger
                            placement='top'
                            overlay={
                              <Tooltip id='tooltip'>Copy to clipboard.</Tooltip>
                            }
                          >
                            <i
                              className='copy-link fa fa-content-copy'
                              onClick={this.copyToClipboard.bind(
                                this,
                                this.state.modal.invitationResult
                                  .invitation_accept_link
                              )}
                              aria-hidden='true'
                            />
                          </OverlayTrigger>
                        )}
                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          bsStyle='link'
                          onClick={this.closeModal.bind(this)}
                        >
                          Close
                        </Button>
                      </BootstrapModal.Footer>
                    </BootstrapModal>
                  );
              }
            })()}
          </div>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

Users.contextTypes = {
  router: PropTypes.object,
};

Users.propTypes = {
  dispatch: PropTypes.func,
  currentUser: PropTypes.object,
  users: PropTypes.object,
  organizations: PropTypes.object,
  invitationsAndUsers: PropTypes.array,
  selectedOrganization: PropTypes.string,
  invitations: PropTypes.object,
  installation_name: PropTypes.string,
};

const tableDefaultSorting = [
  {
    dataField: 'email',
    order: 'asc',
  },
];

const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

function actionsCellFormatter(cell, row) {
  if (row.invited_by) {
    return '';
  } else {
    return (
      <Button
        bsStyle='default'
        type='button'
        onClick={this.deleteUser.bind(this, row.email)}
      >
        Delete
      </Button>
    );
  }
}

function expiryCellFormatter(cell, row) {
  var expiryClass = '';

  if (isExpiringSoon(cell)) {
    expiryClass = 'expiring';
  }

  if (cell === NEVER_EXPIRES) {
    return '';
  } else {
    return (
      <span className={expiryClass}>
        {relativeDate(cell)} &nbsp;
        <i
          className='fa fa-close clickable'
          title='Remove expiration'
          onClick={this.removeExpiration.bind(this, row.email)}
        />
      </span>
    );
  }
}

function statusCellFormatter(cell, row) {
  var status = cell;
  var subText = row.invited_by ? 'Invited by ' + row.invited_by : undefined;

  return (
    <div>
      <small>{status}</small>
      <small>{subText}</small>
    </div>
  );
}

function statusFor(user) {
  if (user.invited_by) {
    return 'PENDING';
  }

  if (isExpired(user.expiry)) {
    return 'EXPIRED';
  }

  if (isExpiringSoon(user.expiry)) {
    return 'EXPIRING SOON';
  }

  return 'ACTIVE';
}

function isExpiringSoon(timestamp) {
  var expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;
  if (expirySeconds < 60 * 60 * 24) {
    return true;
  }

  return false;
}

function isExpired(timestamp) {
  var expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;

  if (timestamp === NEVER_EXPIRES) {
    return false;
  } else if (expirySeconds < 0) {
    return true;
  }

  return false;
}

function isGiantSwarmEmail(email) {
  if (email && typeof email === 'string') {
    var domain = email.split('@')[1];
    if (domain === 'giantswarm.io') {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

function mapStateToProps(state) {
  var users = Object.entries(state.entities.users.items).map(([, user]) => {
    return {
      email: user.email,
      emaildomain: user.emaildomain,
      created: user.created,
      expiry: user.expiry,
      status: statusFor(user),
    };
  });

  var invitations = Object.entries(state.entities.invitations.items).map(
    ([, invitation]) => {
      return {
        email: invitation.email,
        emaildomain: invitation.emaildomain,
        created: invitation.created,
        expiry: invitation.expiry,
        invited_by: invitation.invited_by,
        status: statusFor(invitation),
      };
    }
  );

  var invitationsAndUsers = users.concat(invitations);

  return {
    currentUser: state.app.loggedInUser,
    users: state.entities.users,
    invitations: state.entities.invitations,
    invitationsAndUsers: invitationsAndUsers,
    organizations: state.entities.organizations,
    selectedOrganization: state.app.selectedOrganization,
    installation_name: state.app.info.general.installation_name,
  };
}

export default connect(mapStateToProps)(Users);
