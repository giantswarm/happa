import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { MainRoutes, UsersRoutes } from 'shared/constants/routes';
import { getLoggedInUser } from 'stores/main/selectors';
import {
  invitationCreate,
  invitationsLoad,
  userDelete,
  userRemoveExpiration,
  usersLoad,
} from 'stores/user/actions';
import Button from 'UI/Controls/Button';
import Section from 'UI/Layout/Section';

import DeleteUserModal from './DeleteUserModal';
import InvitesTable from './InvitesTable';
import InviteUserModal from './InviteUserModal';
import UnexpireUserModal from './UnexpireUserModal';
import UsersTable from './UsersTable';

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
      this.props.dispatch(push(MainRoutes.Home));
    }
  }

  removeExpiration = (email) => {
    this.setState({
      selectedUser: email,
      modal: {
        template: UserModalTypes.Unexpire,
        visible: true,
        loading: false,
      },
    });
  };

  confirmRemoveExpiration = (email) => {
    this.setState({
      modal: {
        template: UserModalTypes.Unexpire,
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

  deleteUser = (email) => {
    this.setState({
      selectedUser: email,
      modal: {
        template: UserModalTypes.Delete,
        visible: true,
        loading: false,
      },
    });
  };

  confirmDeleteUser = (email) => {
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

  confirmInviteUser = (invitationForm) => {
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
      .then((result) => {
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
    const { users, invitations, installation_name } = this.props;

    const installationNameLabel = installation_name || 'unknown installation';

    return (
      <Breadcrumb data={{ title: 'USERS', pathname: UsersRoutes.Home }}>
        <DocumentTitle title='Users'>
          <>
            <h1>Users</h1>
            <Section title='Open invites'>
              <>
                <InvitesTable invitations={invitations} />
                <Button onClick={this.inviteUser}>
                  <i className='fa fa-add-circle' /> INVITE USER
                </Button>
              </>
            </Section>
            <Section title='User accounts'>
              <UsersTable
                users={users}
                onRemoveExpiration={this.removeExpiration}
                onDelete={this.deleteUser}
              />
            </Section>
            <Section title='Additional information'>
              <>
                <p>
                  This page lists the user accounts and account invites for
                  installation <code>{installationNameLabel}</code>. Only Giant
                  Swarm staff can access this page.
                </p>
                <p>
                  Giant Swarm staff members normally do not require user
                  accounts, as they log in via Single Sign-On (SSO).
                </p>
              </>
            </Section>
            {this.renderModalComponent()}
          </>
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
  initialSelectedOrganizations: PropTypes.array,
  invitations: PropTypes.object,
  installation_name: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    currentUser: getLoggedInUser(state),
    users: state.entities.users,
    invitations: state.entities.users.invitations,
    organizations: state.entities.organizations,
    initialSelectedOrganizations: [state.main.selectedOrganization],
    installation_name: state.main.info.general.installation_name,
  };
}

export default connect(mapStateToProps)(Users);
