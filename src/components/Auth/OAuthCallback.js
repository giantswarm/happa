import { push } from 'connected-react-router';
import { spinner } from 'images';
import Auth from 'lib/auth0';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { MainRoutes } from 'shared/constants/routes';
import * as mainActions from 'stores/main/actions';
import SlideTransition from 'styles/transitions/SlideTransition';

const OAuthCallback = ({ location, dispatch, actions }) => {
  const [error, setError] = useState(null);
  const auth = useRef(Auth.getInstance());

  useEffect(() => {
    async function handleAuth() {
      await auth.current.init();
      auth.current.handleAuthentication(async (err, authResult) => {
        if (!err) {
          // Login user officially
          try {
            await actions.auth0Login(authResult);
            dispatch(push(MainRoutes.Home));
          } catch (authError) {
            setError(authError);
          }
        } else {
          setError(err);
        }
      });
    }
    handleAuth();
  }, [location, dispatch, actions]);

  return (
    <>
      <div className='login_form--mask' />

      <SlideTransition in={true} appear={true} direction='down'>
        <div className='login_form--container login_form--admin'>
          {error ? (
            <>
              <h1>Something went wrong</h1>
              <p>{error.errorDescription}</p>
              <Link to={MainRoutes.AdminLogin}>Try again</Link>
            </>
          ) : (
            <img className='loader' src={spinner} />
          )}
        </div>
      </SlideTransition>
    </>
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
    actions: bindActionCreators(mainActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OAuthCallback);
