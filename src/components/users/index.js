'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { usersLoad, userRemoveExpiration, userDelete } from '../../actions/userActions';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'react-breadcrumbs';
import BootstrapModal from 'react-bootstrap/lib/Modal';
import { push } from 'connected-react-router';
import Button from '../button';
import BootstrapTable from 'react-bootstrap-table-next';
import moment from 'moment';
import { relativeDate } from '../../lib/helpers.js';

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

  // Provides the configuraiton for the clusters table
  getTableColumnsConfig = () => {
    return [{
      dataField: 'email',
      text: 'Email',
      sort: true
    }, {
      dataField: 'emaildomain',
      text: 'Email Domain',
      sort: true
    }, {
      dataField: 'created',
      text: 'Created',
      sort: true,
      formatter: relativeDate
    }, {
      dataField: 'expiry',
      text: 'Expiry',
      sort: true,
      formatter: expiryCellFormatter.bind(this)
    }, {
      dataField: 'actionsDummy',
      isDummyField: true,
      text: '',
      align: 'right',
      formatter: actionsCellFormatter.bind(this)
    }];
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
              } else if (Object.keys(this.props.users.items).length === 0) {
                return <div>
                  <p>No users in the system yet.</p>
                  </div>;
              } else {
                return <BootstrapTable keyField='email' data={ Object.values(this.props.users.items) }
                          columns={ this.getTableColumnsConfig() } bordered={ false }
                          defaultSorted={ tableDefaultSorting }
                          defaultSortDirection='asc' />;
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
  installation_name: PropTypes.string,
};

const tableDefaultSorting = [{
  dataField: 'email',
  order: 'asc'
}];

const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

function actionsCellFormatter(cell, row) {
  return (
    <Button bsStyle='default' type='button' onClick={this.deleteUser.bind(this, row.email)}>Delete</Button>
  );
}

function expiryCellFormatter(cell, row) {

  var expiryClass = '';
  var expirySeconds = moment(cell).utc().diff(moment().utc()) / 1000;

  if (expirySeconds < (60 * 60 * 24)) {
    expiryClass = 'expiring';
  }

  if (cell === NEVER_EXPIRES) {
    return ('');
  } else {
    return (
      <span className={expiryClass}>{ relativeDate(cell) } &nbsp;
          <i className='fa fa-times clickable'
                title='Remove expiration'
                onClick={this.removeExpiration.bind(this, row.email)} />
      </span>
    );
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.app.loggedInUser,
    users: state.entities.users,
    installation_name: state.app.info.general.installation_name,
  };
}

export default connect(mapStateToProps)(Users);
