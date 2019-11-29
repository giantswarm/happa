import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { invitationCreate, invitationsLoad } from 'actions/invitationActions';
import { push } from 'connected-react-router';
import {
  userDelete,
  userRemoveExpiration,
  usersLoad,
} from 'actions/userActions';
import Button from 'UI/button';
import DeleteUserModal from './DeleteUserModal';
import DocumentTitle from 'react-document-title';
import InviteUserModal from './InviteUserModal';
import PropTypes from 'prop-types';
import React from 'react';
import UnexpireUserModal from './UnexpireUserModal';
import UsersTable from './UsersTable';
import moment from 'moment';

class Users extends React.Component {
  state = {
    selectedUser: null,
    modal: {
      visible: false,
      loading: false,
    },
    invitationForm: {
      email: '',
      error: '',
      organizations: this.props.initialSelectedOrganizations,
      sendEmail: true,
      valid: true,
    },
  };

  componentDidMount() {
    if (this.props.currentUser.isAdmin) {
      this.props
        .dispatch(usersLoad())
        .then(this.props.dispatch(invitationsLoad()));
    } else {
      this.props.dispatch(push('/'));
    }
  }

  removeExpiration = email => {
    this.setState({
      selectedUser: email,
      modal: {
        template: 'unexpireUser',
        visible: true,
        loading: false,
      },
    });
  };

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

  deleteUser = email => {
    this.setState({
      selectedUser: email,
      modal: {
        template: 'deleteUser',
        visible: true,
        loading: false,
      },
    });
  };

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
    });
  }

  confirmInviteUser = invitationForm => {
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
        return this.props.dispatch(invitationCreate(invitationForm));
      })
      .then(result => {
        this.setState({
          modal: {
            template: 'inviteUser',
            invitationResult: result,
            visible: true,
            loading: false,
          },
        });
      })
      .catch(() => {
        this.closeModal();
      });
  };

  closeModal() {
    this.setState({
      modal: {
        visible: false,
        loading: false,
      },
    });
  }

  render() {
    const {
      users,
      invitations,
      installation_name,
      invitationsAndUsers,
    } = this.props;

    const installationNameLabel = installation_name || 'unknown installation';

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
              <code>{installationNameLabel}</code>
            </p>
            <br />
            <h5>What about SSO users?</h5>
            <p>
              SSO users don&apos;t have user objects. They are defined by
              whatever is in the JWT token being used by that user.
            </p>
            <br />
            <UsersTable
              users={users}
              invitationsAndUsers={invitationsAndUsers}
              onRemoveExpiration={this.removeExpiration}
              onDelete={this.deleteUser}
              invitations={invitations}
            />
            {(() => {
              switch (this.state.modal.template) {
                case 'unexpireUser':
                  return (
                    <UnexpireUserModal
                      show={this.state.modal.visible}
                      forUser={this.state.selectedUser}
                      onClose={this.closeModal.bind(this)}
                      onConfirm={this.confirmRemoveExpiration.bind(
                        this,
                        this.state.selectedUser
                      )}
                      isLoading={this.state.modal.loading}
                    />
                  );

                case 'deleteUser':
                  return (
                    <DeleteUserModal
                      show={this.state.modal.visible}
                      forUser={this.state.selectedUser}
                      onClose={this.closeModal.bind(this)}
                      onConfirm={this.confirmDeleteUser.bind(
                        this,
                        this.state.selectedUser
                      )}
                      isLoading={this.state.modal.loading}
                    />
                  );

                case 'inviteUser':
                  return (
                    <InviteUserModal
                      show={this.state.modal.visible}
                      onClose={this.closeModal.bind(this)}
                      onConfirm={this.confirmInviteUser}
                      isLoading={this.state.modal.loading}
                      organizations={this.props.organizations}
                      initiallySelectedOrganizations={
                        this.props.initialSelectedOrganizations
                      }
                      invitationResult={this.state.modal.invitationResult}
                    />
                  );
              }
            })()}
          </div>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

Users.propTypes = {
  dispatch: PropTypes.func,
  currentUser: PropTypes.object,
  users: PropTypes.object,
  organizations: PropTypes.object,
  invitationsAndUsers: PropTypes.array,
  initialSelectedOrganizations: PropTypes.array,
  invitations: PropTypes.object,
  installation_name: PropTypes.string,
};

const formatStatus = user => {
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
};

const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

const isExpired = timestamp => {
  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;

  if (timestamp === NEVER_EXPIRES) {
    return false;
  }

  return expirySeconds < 0;
};

const isExpiringSoon = timestamp => {
  const expirySeconds =
    moment(timestamp)
      .utc()
      .diff(moment().utc()) / 1000;

  return expirySeconds > 0 && expirySeconds < 60 * 60 * 24;
};

function mapStateToProps(state) {
  var users = Object.entries(state.entities.users.items).map(([, user]) => {
    return {
      email: user.email,
      emaildomain: user.emaildomain,
      created: user.created,
      expiry: user.expiry,
      status: formatStatus(user),
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
        status: formatStatus(invitation),
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
    initialSelectedOrganizations: [state.app.selectedOrganization],
    installation_name: state.app.info.general.installation_name,
  };
}

export default connect(mapStateToProps)(Users);
