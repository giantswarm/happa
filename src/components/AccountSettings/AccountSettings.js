import * as UserActions from 'actions/userActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ChangeEmailForm from './ChangeEmailForm';
import ChangePasswordForm from './ChangePasswordForm';

const AccountSettings = props => (
  <Breadcrumb
    data={{ title: 'ACCOUNT SETTINGS', pathname: '/account-settings/' }}
  >
    <DocumentTitle title='Account Settings'>
      <div>
        <div className='row'>
          <div className='col-12'>
            <h1>Your Account Settings</h1>
          </div>
        </div>

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Email</h3>
          </div>
          <div className='col-9'>
            <p>
              This address is used for logging in and for all communication. Be
              aware that it is also visible to other members of your
              organization.
            </p>

            <ChangeEmailForm actions={props.actions} user={props.user} />
          </div>
        </div>

        <ChangePasswordForm actions={props.actions} user={props.user} />

        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Delete Account</h3>
          </div>
          <div className='col-9'>
            <p>
              Please send an email to{' '}
              <a href='mailto:support@giantswarm.io?subject=Please delete my account'>
                support@giantswarm.io
              </a>{' '}
              to delete your account.
            </p>
          </div>
        </div>
      </div>
    </DocumentTitle>
  </Breadcrumb>
);

AccountSettings.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    user: state.app.loggedInUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UserActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountSettings);
