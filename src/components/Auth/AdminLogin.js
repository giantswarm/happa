import * as userActions from 'actions/userActions';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import Auth from 'lib/auth0';
import { clearQueues } from 'lib/flashMessage';
import { isJwtExpired } from 'lib/helpers';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { AuthorizationTypes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';

class AdminLogin extends React.Component {
  componentDidMount() {
    const auth = Auth.getInstance();

    if (
      this.props.user &&
      this.props.user.auth &&
      this.props.user.auth.scheme === AuthorizationTypes.BEARER
    ) {
      if (isJwtExpired(this.props.user.auth.token)) {
        // Token is expired. Try to renew it silently, and if that succeeds, redirect
        // the user to the dashboard. Otherwise, send them to Auth0 to refresh the token that way.
        auth
          .renewToken()
          .then(async result => {
            // Update state with new token.
            await this.props.dispatch(userActions.auth0Login(result));

            // Redirect to dashboard.
            this.props.dispatch(push(AppRoutes.Home));
          })
          .catch(e => {
            // eslint-disable-next-line no-console
            console.error(e);
            // Unable to refresh token silently, so send the down the auth0
            // flow.
            auth.login();
          });
      } else {
        // Token isn't expired yet, so just redirect the user to the dashboard.
        this.props.dispatch(push(AppRoutes.Home));
      }
    } else {
      // User doesn't have any previous token at all, send them to auth0 so
      // they can get one.
      auth.login();
    }
  }

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    clearQueues();
  }

  // eslint-disable-next-line class-methods-use-this
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
