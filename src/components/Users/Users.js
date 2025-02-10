import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import { Text } from 'grommet';
import { MainRoutes, UsersRoutes } from 'model/constants/routes';
import { getLoggedInUser } from 'model/stores/main/selectors';
import {
  userDelete,
  userRemoveExpiration,
  usersLoad,
} from 'model/stores/user/actions';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import Section from 'UI/Layout/Section';
import ErrorReporter from 'utils/errors/ErrorReporter';

import DeleteUserModal from './DeleteUserModal';
import UnexpireUserModal from './UnexpireUserModal';
import UsersTable from './UsersTable';

const UserModalTypes = {
  Unexpire: 'unexpire',
  Delete: 'delete',
};

function canManageUsers(user, writeAllGroup) {
  return user?.isAdmin && writeAllGroup && user?.groups?.includes(writeAllGroup);
}

class Users extends React.Component {
  state = {
    selectedUser: null,
    modal: {
      template: '',
      visible: false,
      loading: false,
    },
  };

  componentDidMount() {
    if (!this.props.currentUser?.isAdmin) {
      this.props.dispatch(push(MainRoutes.Home));

      return;
    }

    if (canManageUsers(this.props.currentUser, this.props.write_all_group)) {
      this.props.dispatch(usersLoad());
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
      .catch((err) => {
        this.closeModal();

        ErrorReporter.getInstance().notify(err);
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
      .catch((err) => {
        this.closeModal();

        ErrorReporter.getInstance().notify(err);
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
    const { modal, selectedUser } = this.state;
    const propsToAdd = {};
    let ModalComponent = null;

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
        return null;
    }

    return ModalComponent ? (
      <ModalComponent
        {...propsToAdd}
        show={modal.visible}
        onClose={this.closeModal}
        isLoading={modal.loading}
      />
    ) : null;
  }

  render() {
    const {
      users,
      installation_name,
      currentUser,
      write_all_group,
    } = this.props;

    const userItems = users?.items || [];

    const installationNameLabel = installation_name || 'unknown installation';

    return (
      <Breadcrumb data={{ title: 'USERS', pathname: UsersRoutes.Home }}>
        <DocumentTitle title='Users'>
          <div>
            <h1>Users</h1>
            {canManageUsers(currentUser, write_all_group) ? (
              <Section title='User accounts'>
                <UsersTable
                  users={userItems}
                  onRemoveExpiration={this.removeExpiration}
                  onDelete={this.deleteUser}
                />
              </Section>
            ) : (
              <Text>
                <i className='fa fa-warning' role='presentation' /> In order to
                manage users, you must be a member of the{' '}
                <code>{write_all_group}</code> group. Please log in with the
                appropriate connector.
              </Text>
            )}
            <Section title='Additional information'>
              <div>
                <p>
                  This page lists the user accounts for installation{' '}
                  <code>{installationNameLabel}</code>. Only Giant Swarm staff can
                  access this page.
                </p>
                <p>
                  Giant Swarm staff members normally do not require user accounts,
                  as they log in via Single Sign-On (SSO).
                </p>
              </div>
            </Section>
            {this.renderModalComponent()}
          </div>
        </DocumentTitle>
      </Breadcrumb>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: getLoggedInUser(state),
    users: state.entities.users,
    installation_name: window.config.info.general.installationName,
    write_all_group: window.config.mapiAuthAdminGroups[0],
  };
}

export default connect(mapStateToProps)(Users);
