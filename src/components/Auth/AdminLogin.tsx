import { CallHistoryMethodAction, push } from 'connected-react-router';
import { spinner } from 'images';
import Auth from 'lib/auth0';
import { clearQueues } from 'lib/flashMessage';
import { isJwtExpired } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { AuthorizationTypes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import * as mainActions from 'stores/main/actions';
import { MainActions } from 'stores/main/types';
import { IState } from 'stores/state';

interface IStateProps {
  user?: ILoggedInUser | null;
}

interface IDispatchProps {
  dispatch: ThunkDispatch<IState, void, MainActions | CallHistoryMethodAction>;
}

interface IAdminLoginProps extends IStateProps, IDispatchProps {}

const AdminLogin: React.FC<IAdminLoginProps> = ({ user, dispatch }) => {
  useEffect(() => {
    const auth = Auth.getInstance();
    const handleLogin = async () => {
      try {
        if (user?.auth?.scheme === AuthorizationTypes.BEARER) {
          if (isJwtExpired(user.auth.token)) {
            try {
              // Token is expired. Try to renew it silently, and if that succeeds, redirect
              // the user to the dashboard. Otherwise, send them to Auth0 to refresh the token that way.
              const result = await auth.renewToken();
              // Update state with new token.
              await dispatch(mainActions.auth0Login(result));

              // Redirect to dashboard.
              dispatch(push(AppRoutes.Home));
            } catch {
              // Unable to refresh token silently, so send the down the auth0
              // flow.
              auth.login();
            }
          } else {
            // Token isn't expired yet, so just redirect the user to the dashboard.
            dispatch(push(AppRoutes.Home));
          }
        } else {
          // User doesn't have any previous token at all, send them to auth0 so
          // they can get one.
          auth.login();
        }
      } catch (err) {
        // NOOP
      }
    };

    handleLogin();

    return () => {
      clearQueues();
    };
  }, [dispatch, user]);

  return (
    <>
      <div className='login_form--mask' />

      <div className='login_form--container login_form--admin'>
        <img className='loader' src={spinner} />
        <p>
          Verifying credentials, and redirecting to our authentication provider
          if necessary.
        </p>
        <p>If nothing happens please let us know in #support.</p>
      </div>
    </>
  );
};

AdminLogin.propTypes = {
  dispatch: PropTypes.func.isRequired,
  // @ts-ignore
  user: PropTypes.object,
};

function mapStateToProps(state: IState): IStateProps {
  return {
    user: state.main.loggedInUser,
  };
}

function mapDispatchToProps(dispatch: Dispatch): IDispatchProps {
  return {
    dispatch: dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminLogin);
