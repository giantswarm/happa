import DocumentTitle from 'components/shared/DocumentTitle';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AccountSettingsRoutes } from 'shared/constants/routes';
import * as mainActions from 'stores/main/actions';
import { getLoggedInUser } from 'stores/main/selectors';
import Section from 'UI/Layout/Section';

import ChangeEmailForm from './ChangeEmailForm';
import ChangePasswordForm from './ChangePasswordForm';

const AccountSettings = (props) => (
  <Breadcrumb
    data={{ title: 'ACCOUNT SETTINGS', pathname: AccountSettingsRoutes.Home }}
  >
    <DocumentTitle title='Account Settings'>
      <>
        <h1>Your Account Settings</h1>
        <Section title='Email'>
          <>
            <p>
              This address is used for logging in and for all communication. Be
              aware that it is also visible to other members of your
              organization.
            </p>

            <ChangeEmailForm
              refreshUserInfo={props.actions.refreshUserInfo}
              user={props.user}
              data-testid='account-settings/change-email'
            />
          </>
        </Section>

        <ChangePasswordForm
          giantswarmLogin={props.actions.giantswarmLogin}
          user={props.user}
          data-testid='account-settings/change-password'
        />

        <Section title='Delete Account'>
          <p>
            Please send an email to{' '}
            <a href='mailto:support@giantswarm.io?subject=Please delete my account'>
              support@giantswarm.io
            </a>{' '}
            to delete your account.
          </p>
        </Section>
      </>
    </DocumentTitle>
  </Breadcrumb>
);

AccountSettings.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    user: getLoggedInUser(state),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(mainActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountSettings);
