import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { invitationCreate, invitationsLoad } from 'actions/invitationActions';
import { push } from 'connected-react-router';
import { relativeDate } from 'lib/helpers.js';
import { spinner } from 'images';
import {
  userDelete,
  userRemoveExpiration,
  usersLoad,
} from 'actions/userActions';
import BootstrapTable from 'react-bootstrap-table-next';
import Button from 'UI/button';
import DeleteUserModal from './DeleteUserModal';
import DocumentTitle from 'react-document-title';
import InviteUserModal from './InviteUserModal';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import UnexpireUserModal from './UnexpireUserModal';

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
                    height='20px'
                    src={spinner}
                    width='20px'
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
                      bordered={false}
                      columns={this.getTableColumnsConfig()}
                      data={Object.values(this.props.invitationsAndUsers)}
                      defaultSortDirection='asc'
                      defaultSorted={tableDefaultSorting}
                      keyField='email'
                    />
                  </div>
                );
              }
            })()}

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
        onClick={this.deleteUser.bind(this, row.email)}
        type='button'
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
          onClick={this.removeExpiration.bind(this, row.email)}
          title='Remove expiration'
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

  if (expirySeconds > 0 && expirySeconds < 60 * 60 * 24) {
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
    initialSelectedOrganizations: [state.app.selectedOrganization],
    installation_name: state.app.info.general.installation_name,
  };
}

export default connect(mapStateToProps)(Users);
