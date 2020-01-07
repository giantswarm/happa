import * as userActions from 'actions/userActions';
import { AuthorizationTypes } from 'shared/constants';
import { bindActionCreators } from 'redux';
import { clearQueues } from 'lib/flashMessage';
import { connect } from 'react-redux';
import { isJwtExpired } from 'lib/helpers';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import Auth0 from 'lib/auth0';
import PropTypes from 'prop-types';
import React from 'react';

class AdminLogin extends React.Component {
  componentDidMount() {
    const auth0 = new Auth0();

    if (
      this.props.user &&
      this.props.user.auth &&
      this.props.user.auth.scheme === AuthorizationTypes.BEARER
    ) {
      if (isJwtExpired(this.props.user.auth.token)) {
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
          .catch(e => {
            console.error(e);
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
    clearQueues();
  }

  render() {
    return (
      <div>
        <div className='login_form--mask' />

        <div className='login_form--container login_form--admin col-4'>
          <img className='loader' src={spinner} />
          <p>
            Verifying credentials, and redirecting to our authentication
            provider if necessary.
          </p>
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
  user: PropTypes.object,
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

export default connect(mapStateToProps, mapDispatchToProps)(AdminLogin);
