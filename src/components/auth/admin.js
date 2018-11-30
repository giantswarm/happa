'use strict';

import FlashMessages from '../flash_messages/index.js';
import React from 'react';
import { connect } from 'react-redux';
import { flashClearAll } from '../../actions/flashMessageActions';
import * as userActions from '../../actions/userActions';
import { bindActionCreators } from 'redux';
import Auth0 from '../../lib/auth0';
import {isJwtExpired} from '../../lib/helpers';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';

class AdminLogin extends React.Component {
  componentDidMount() {
    const auth0 = new Auth0();

    if (this.props.user && this.props.user.auth && this.props.user.auth.scheme === 'Bearer') {
      if(isJwtExpired(this.props.user.auth.token)) {
        // Token is expired. Try to renew it silently, and if that succeeds, redirect
        // the user to the dashboard. Otherwise, send them to Auth0 to refresh the token that way.
        auth0
          .renewToken()
          .then(result => {
            // Update state with new token.
            this.props.dispatch(userActions.auth0Login(result));

            // Redirect to dashboard.
            this.props.dispatch(push('/'));
          })
          .catch(() => {
            // Unable to refresh token silently, so send the down the auth0
            // flow.
            auth0.login();
          });
      } else {
        // Token isn't expired yet, so just redirect the user to the dashboard.
        this.props.dispatch(push('/'));
      }
    } else {
      // User doesn't have any previous token at all, send them to auth0 so
      // they can get one.
      auth0.login();
    }
  }

  componentWillUnmount() {
    this.props.dispatch(flashClearAll());
  }

  render() {
    return (
      <div>
        <div className='login_form--mask' />

        <div className='login_form--container login_form--admin col-4'>
          <div className='login_form--flash-container'>
            <FlashMessages />
          </div>

          <img className='loader' src='/images/loader_oval_light.svg' />
          <p>Verifying credentials, and redirecting to our authentication provider if necessary.</p>
          <p>If nothing happens please let us know in #support.</p>
        </div>
      </div>
    );
  }
}

AdminLogin.propTypes = {
  dispatch: PropTypes.func,
  flashMessages: PropTypes.object,
  actions: PropTypes.object,
  user: PropTypes.object
};

function mapStateToProps(state) {
  return {
    user: state.app.loggedInUser,
    flashMessages: state.flashMessages,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch,
  };
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(AdminLogin);
