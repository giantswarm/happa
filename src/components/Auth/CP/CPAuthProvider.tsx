import CPAuth from 'lib/CPAuth/CPAuth';
import { OAuth2Events } from 'lib/OAuth2/OAuth2';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import React, { ReactElement, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  loadUserSuccess,
  userExpired,
  userExpiring,
  userSignedOut,
} from 'stores/cpauth/actions';

interface ICPAuthProviderProps extends React.PropsWithChildren<{}> {}

const CPAuthProvider: React.FC<ICPAuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  const onUserLoaded = useCallback(
    (event: CustomEvent<IOAuth2User | null>) => {
      dispatch(loadUserSuccess(event.detail));
    },
    [dispatch]
  );

  const onUserSignedOut = useCallback(() => {
    dispatch(userSignedOut());
  }, [dispatch]);

  const onTokenExpiring = useCallback(() => {
    dispatch(userExpiring());
  }, [dispatch]);

  const onTokenExpired = useCallback(() => {
    dispatch(userExpired());
  }, [dispatch]);

  useEffect(() => {
    const cpAuth = CPAuth.getInstance();
    cpAuth.addEventListener(OAuth2Events.UserLoaded, onUserLoaded);
    cpAuth.addEventListener(OAuth2Events.UserUnloaded, onUserSignedOut);
    cpAuth.addEventListener(OAuth2Events.UserSignedOut, onUserSignedOut);
    cpAuth.addEventListener(OAuth2Events.TokenExpiring, onTokenExpiring);
    cpAuth.addEventListener(OAuth2Events.TokenExpired, onTokenExpired);
    cpAuth.addEventListener(OAuth2Events.SilentRenewError, onUserSignedOut);

    return () => {
      cpAuth.removeEventListener(OAuth2Events.UserLoaded, onUserLoaded);
      cpAuth.removeEventListener(OAuth2Events.UserUnloaded, onUserSignedOut);
      cpAuth.removeEventListener(OAuth2Events.UserSignedOut, onUserSignedOut);
      cpAuth.removeEventListener(OAuth2Events.TokenExpiring, onTokenExpiring);
      cpAuth.removeEventListener(OAuth2Events.TokenExpired, onTokenExpired);
      cpAuth.removeEventListener(
        OAuth2Events.SilentRenewError,
        onUserSignedOut
      );
    };
  }, [onUserLoaded, onUserSignedOut, onTokenExpiring, onTokenExpired]);

  if (typeof children === 'undefined' || children === null) {
    return null;
  }

  return React.Children.only(children as ReactElement);
};

CPAuthProvider.propTypes = {};

export default CPAuthProvider;
