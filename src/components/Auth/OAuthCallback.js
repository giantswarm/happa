import * as userActions from 'actions/userActions';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import Auth from 'lib/auth0';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { AppRoutes } from 'shared/constants/routes';
import SlideTransition from 'styles/transitions/SlideTransition';

const OAuthCallback = ({ location, dispatch, actions }) => {
  const [error, setError] = useState(null);
  const auth = useRef(Auth.getInstance());

  useEffect(() => {
    if (/id_token|error/.test(location.hash)) {
      auth.current.handleAuthentication(async (err, authResult) => {
        if (err) {
          setError(err);

          return;
        }

        // Login user officially
        try {
          await actions.auth0Login(authResult);
          dispatch(push(AppRoutes.Home));
        } catch (authError) {
          setError(authError);
        }
      });
    } else {
      setError({
        error: 'unauthorized',
        errorDescription:
          'Invalid or empty response from the authentication provider.',
      });
    }
  }, [location, dispatch, actions]);

  return (
    <div>
      <div className='login_form--mask' />

      <SlideTransition in={true} appear={true} direction='down'>
        <div className='login_form--container col-4 login_form--admin'>
          {error ? (
            <div>
              <h1>Something went wrong</h1>
              <p>{error.errorDescription}</p>
              <Link to={AppRoutes.AdminLogin}>Try again</Link>
            </div>
          ) : (
            <img className='loader' src={spinner} />
          )}
        </div>
      </SlideTransition>
    </div>
  );
};

OAuthCallback.propTypes = {
  actions: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    user: state.main.loggedInUser,
    flashMessages: state.flashMessages,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OAuthCallback);
