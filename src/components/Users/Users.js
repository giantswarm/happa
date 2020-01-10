import { invitationCreate, invitationsLoad } from 'actions/invitationActions';
import {
  userDelete,
  userRemoveExpiration,
  usersLoad,
} from 'actions/userActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import Button from 'UI/Button';

import DeleteUserModal from './DeleteUserModal';
import InviteUserModal from './InviteUserModal';
import UnexpireUserModal from './UnexpireUserModal';
import UsersTable from './UsersTable';
import { formatStatus } from './UsersUtils';

const UserModalTypes = {
  Unexpire: 'unexpire',
  Delete: 'delete',
  Invite: 'invite',
};

class Users extends React.Component {
  state = {
    selectedUser: null,
    modal: {
      template: '',
      visible: false,
      loading: false,
      invitationResult: {},
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
        template: UserModalTypes.Unexpire,
        visible: true,
        loading: false,
      },
    });
  };

  confirmRemoveExpiration = email => {
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
  };

  deleteUser = email => {
    this.setState({
      selectedUser: email,
      modal: {
        template: UserModalTypes.Delete,
        visible: true,
        loading: false,
      },
    });
  };

  confirmDeleteUser = email => {
    this.setState({
      modal: {
        template: UserModalTypes.Delete,
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
  };

  inviteUser = () => {
    this.setState({
      modal: {
        template: UserModalTypes.Invite,
        visible: true,
        loading: false,
      },
    });
  };

  confirmInviteUser = invitationForm => {
    this.setState({
      modal: {
        template: UserModalTypes.Invite,
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
            template: UserModalTypes.Invite,
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

  closeModal = () => {
    this.setState({
      modal: {
        visible: false,
        loading: false,
      },
    });
  };

  renderModalComponent() {
    let ModalComponent = InviteUserModal;

    const { modal, selectedUser } = this.state;
    const { organizations, initialSelectedOrganizations } = this.props;
    const propsToAdd = {};

    switch (modal.template) {
      case UserModalTypes.Unexpire:
        ModalComponent = UnexpireUserModal;

        propsToAdd.forUser = selectedUser;
        propsToAdd.onConfirm = this.confirmRemoveExpiration.bind(
          this,
          selectedUser
        );

        break;

      case UserModalTypes.Delete:
        ModalComponent = DeleteUserModal;

        propsToAdd.forUser = selectedUser;
        propsToAdd.onConfirm = this.confirmDeleteUser.bind(this, selectedUser);

        break;

      default:
        propsToAdd.onConfirm = this.confirmInviteUser;
        propsToAdd.organizations = organizations;
        propsToAdd.initiallySelectedOrganizations = initialSelectedOrganizations;
        propsToAdd.invitationResult = modal.invitationResult;
    }

    return (
      <ModalComponent
        {...propsToAdd}
        show={modal.visible}
        onClose={this.closeModal}
        isLoading={modal.loading}
      />
    );
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
        <DocumentTitle title='Users'>
          <div>
            <div className='row'>
              <div className='col-7'>
                <h1>Users</h1>
              </div>
              <div className='col-5'>
                <div className='pull-right btn-group'>
                  <Button onClick={this.inviteUser}>
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
            {this.renderModalComponent()}
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

function mapStateToProps(state) {
  const users = Object.entries(state.entities.users.items).map(([, user]) => {
    return {
      email: user.email,
      emaildomain: user.emaildomain,
      created: user.created,
      expiry: user.expiry,
      status: formatStatus(user),
    };
  });

  const invitations = Object.entries(state.entities.invitations.items).map(
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

  const invitationsAndUsers = users.concat(invitations);

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
