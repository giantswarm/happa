'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { usersLoad, userRemoveExpiration, userDelete } from '../../actions/userActions';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';
import { invitationsLoad, invitationCreate } from '../../actions/invitationActions';
import UserRow from './user_row';
import InvitationRow from './invitation_row';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'react-breadcrumbs';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { push } from 'connected-react-router';
import Button from '../button';
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
        organization: props.organizations,
        sendEmail: true
      }
    };
  }

  componentDidMount() {
    if (this.props.currentUser.isAdmin) {
      this.props.dispatch(usersLoad());
      this.props.dispatch(invitationsLoad());
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
      }
    });
  }

  confirmRemoveExpiration(email) {
    this.setState({
      modal: {
        visible: true,
        loading: true,
      }
    });

    this.props.dispatch(userRemoveExpiration(email))
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
      }
    });
  }

  confirmDeleteUser(email) {
    this.setState({
      modal: {
        template: 'deleteUser',
        visible: true,
        loading: true,
      }
    });

    this.props.dispatch(userDelete(email))
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
        loading: false
      },
      invitationForm: {
        email: '',
        organization: this.props.selectedOrganization,
        sendEmail: true
      }
    });
  }


  confirmInviteUser() {
    this.setState({
      modal: {
        template: 'inviteUser',
        visible: true,
        loading: true
      }
    });

    this.props.dispatch(invitationCreate(this.state.invitationForm))
    .then((result) => {
      this.setState({
        modal: {
          template: 'inviteUserDone',
          invitationResult: result,
          visible: true,
          loading: false
        }
      });
    })
    .catch(() => {
      this.closeModal();
    });
  }

  handleEmailChange(e) {
    var invitationForm = Object.assign({}, this.state.invitationForm);

    invitationForm.email = e.target.value;

    this.setState({
      invitationForm: invitationForm
    });
  }

  handleSendEmailChange(e) {
    var invitationForm = Object.assign({}, this.state.invitationForm);
    var checked = e.target.checked;
    invitationForm.sendEmail = checked;

    this.setState({
      invitationForm: invitationForm
    });
  }

  handleOrganizationChange(orgId) {
    var invitationForm = Object.assign({}, this.state.invitationForm);

    invitationForm.organization = orgId;

    this.setState({
      invitationForm: invitationForm
    });
  }

  closeModal() {
    this.setState({
      modal: {
        visible: false,
        loading: false
      }
    });
  }

  copyToClipboard(value) {
    this.setState({
      copied: true
    });

    setTimeout(() => {this.setState({
      copied: false
    });}, 1000);

    copy(value);
  }

  render() {
    return (
      <Breadcrumb data={{title: 'USERS', pathname: '/users/'}}>
        <DocumentTitle title='Users | Giant Swarm'>
          <div>
            <div className='row'>
              <div className='col-7'>
                <h1>
                  Users
                </h1>
              </div>
              <div className='col-5'>
                <div className='pull-right btn-group'>
                  <Button onClick={this.inviteUser.bind(this)}>INVITE USER</Button>
                </div>
              </div>
            </div>
            <p>This is the list of user accounts on <code>{this.props.installation_name ? this.props.installation_name : 'unknown installation'}</code></p>
            <br/>
            <h5>What about SSO users?</h5>
            <p>SSO users don&apos;t have user objects. They are defined by whatever is in the JWT token being used by that user.</p>
            <br/>
            {(() => {
              if (!this.props.users || (this.props.users.isFetching && Object.keys(this.props.users.items).length === 0)) {
                return <img className='loader' src='/images/loader_oval_light.svg' width='20px' height='20px' />;
              } else if (Object.keys(this.props.users.items).length === 0 && Object.keys(this.props.invitations.items).length === 0) {
                return <div>
                  <p>No users in the system yet.</p>
                  </div>;
              } else {
                return <div>
                  <table className={this.props.users.isFetching ? 'fetching' : ''}>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Email Domain</th>
                        <th>Expires</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        _.map(_.sortBy(this.props.users.items, 'email'), (user) => {
                            return <UserRow user={user}
                                                  key={user.email}
                                                  removeExpiration={this.removeExpiration.bind(this, user.email)}
                                                  deleteUser={this.deleteUser.bind(this, user.email)}
                                   />;
                          }
                        )
                      }

                      {
                        _.map(_.sortBy(this.props.invitations.items, 'email'), (invitation) => {
                            return <InvitationRow invitation={invitation}
                                                  key={invitation.email}
                                   />;
                          }
                        )
                      }
                    </tbody>
                  </table>
                </div>;
              }
            })()}

            {
              (() => {
                switch(this.state.modal.template) {
                  case 'unexpireUser':
                    return <BootstrapModal className='create-key-pair-modal' show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Remove Expiration Date from {this.state.selectedUser}</BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <p>Are you sure you want to remove the expiration date from {this.state.selectedUser}?</p>
                        <p>This account will never expire.</p>
                        <p>If the account was expired, the user will be able to log in again.</p>
                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          type='submit'
                          bsStyle='primary'
                          loading={this.state.modal.loading}
                          onClick={this.confirmRemoveExpiration.bind(this, this.state.selectedUser)}>
                          {
                            this.state.modal.loading ?
                            'Removing Expiration'
                            :
                            'Remove Expiration'
                          }
                        </Button>

                        {
                          this.state.modal.loading ?
                          null
                          :
                          <Button
                            bsStyle='link'
                            onClick={this.closeModal.bind(this)}>
                            Cancel
                          </Button>
                        }
                      </BootstrapModal.Footer>
                    </BootstrapModal>;

                  case 'deleteUser':
                    return <BootstrapModal className='create-key-pair-modal' show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Delete {this.state.selectedUser}</BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <p>Are you sure you want to delete {this.state.selectedUser}?</p>
                        <p>There is no undo.</p>
                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          type='submit'
                          bsStyle='danger'
                          loading={this.state.modal.loading}
                          onClick={this.confirmDeleteUser.bind(this, this.state.selectedUser)}>
                          {
                            this.state.modal.loading ?
                            'Deleting User'
                            :
                            'Delete User'
                          }
                        </Button>

                        {
                          this.state.modal.loading ?
                          null
                          :
                          <Button
                            bsStyle='link'
                            onClick={this.closeModal.bind(this)}>
                            Cancel
                          </Button>
                        }
                      </BootstrapModal.Footer>
                    </BootstrapModal>;

                  case 'inviteUser':
                    return <BootstrapModal className='create-key-pair-modal' show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>Invite a New User</BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <form onSubmit={(e) => {e.preventDefault();}}>
                        <p>Creating an invitation is the way to get new people onto this installation.</p>
                        <p>Invitations are valid for 48 hours.</p>

                        <div className='textfield'>
                          <label>Email:</label>
                          <input autoFocus type='text' onChange={this.handleEmailChange.bind(this)} value={this.state.invitationForm.email} />
                        </div>

                        <div className='textfield'>
                          <label>Organization:</label>
                          <DropdownButton id="organizationDropdown" className="outline" title={this.state.invitationForm.organization}>
                            {
                              _.map(_.sortBy(this.props.organizations.items, 'id'), (organization) =>
                                <MenuItem key={organization.id} onClick={this.handleOrganizationChange.bind(this, organization.id)}>
                                  {organization.id}
                                </MenuItem>
                              )
                            }
                          </DropdownButton>
                        </div>

                        <div className='textfield'>
                          <label>Send Email:</label>
                          <div className='checkbox'>
                            <label htmlFor='sendEmail'>
                              <input type='checkbox' onChange={this.handleSendEmailChange.bind(this)} id='sendEmail' checked={this.state.invitationForm.sendEmail} />
                              Send the invitee an e-mail with the accept invitation link.
                            </label>
                          </div>
                        </div>

                        </form>
                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          type='submit'
                          bsStyle='primary'
                          loading={this.state.modal.loading}
                          onClick={this.confirmInviteUser.bind(this)}>
                          {
                            this.state.modal.loading ?
                            'Inviting User'
                            :
                            'Invite User'
                          }
                        </Button>

                        {
                          this.state.modal.loading ?
                          null
                          :
                          <Button
                            bsStyle='link'
                            onClick={this.closeModal.bind(this)}>
                            Cancel
                          </Button>
                        }
                      </BootstrapModal.Footer>
                    </BootstrapModal>;

                  case 'inviteUserDone':
                    return <BootstrapModal className='create-key-pair-modal' show={this.state.modal.visible} onHide={this.closeModal.bind(this)}>
                      <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title>{this.state.invitationForm.email} has been Invited</BootstrapModal.Title>
                      </BootstrapModal.Header>

                      <BootstrapModal.Body>
                        <p>Invitation has been created succesfully!</p>
                        {
                          this.state.invitationForm.sendEmail ?
                          <p>An email has been sent to {this.state.invitationForm.email} with further instructions.</p>
                          :
                          <p>You&apos;ve chosen not to send them an email. Send them the link below to accept the invitation.</p>
                        }
                        <label>Invitation Accept Link:</label><br/>
                        <code>{ this.state.modal.invitationResult.invitation_accept_link }</code>&nbsp;

                        {
                          this.state.copied ?
                            <i className='fa fa-check' aria-hidden='true'></i>
                          :
                          <OverlayTrigger placement="top" overlay={
                              <Tooltip id="tooltip">Copy to clipboard.</Tooltip>
                            }>
                            <i className='copy-link fa fa-clipboard'  onClick={this.copyToClipboard.bind(this, this.state.modal.invitationResult.invitation_accept_link)} aria-hidden='true'></i>
                          </OverlayTrigger>
                        }

                      </BootstrapModal.Body>
                      <BootstrapModal.Footer>
                        <Button
                          bsStyle='link'
                          onClick={this.closeModal.bind(this)}>
                          Close
                        </Button>
                      </BootstrapModal.Footer>
                    </BootstrapModal>;

                }
              })()
            }
          </div>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

Users.contextTypes = {
  router: PropTypes.object
};

Users.propTypes = {
  dispatch: PropTypes.func,
  currentUser: PropTypes.object,
  users: PropTypes.object,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.object,
  invitations: PropTypes.object,
  installation_name: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    currentUser: state.app.loggedInUser,
    users: state.entities.users,
    invitations: state.entities.invitations,
    organizations: state.entities.organizations,
    selectedOrganization: state.app.selectedOrganization,
    installation_name: state.app.info.general.installation_name,
  };
}

export default connect(mapStateToProps)(Users);
