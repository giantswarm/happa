'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { usersLoad, userRemoveExpiration, userDelete } from '../../actions/userActions';
import { invitationsLoad } from '../../actions/invitationActions';
import UserRow from './user_row';
import InvitationRow from './invitation_row';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'react-breadcrumbs';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { push } from 'connected-react-router';
import Button from '../button';

class Users extends React.Component {
 constructor(props) {
    super(props);

    this.state = {
      selectedUser: null,
      modal: {
        visible: false,
        loading: false,
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

  closeModal() {
    this.setState({
      modal: {
        visible: false,
        loading: false
      }
    });
  }

  render() {
    return (
      <Breadcrumb data={{title: 'USERS', pathname: '/users/'}}>
        <DocumentTitle title='Users | Giant Swarm'>
          <div>
            <h1>Users</h1>

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
  invitations: PropTypes.object,
  installation_name: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    currentUser: state.app.loggedInUser,
    users: state.entities.users,
    invitations: state.entities.invitations,
    installation_name: state.app.info.general.installation_name,
  };
}

export default connect(mapStateToProps)(Users);
