import MapiAuth from 'lib/MapiAuth/MapiAuth';
import { OAuth2Events } from 'lib/OAuth2/OAuth2';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import React, { ReactElement, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  loadUserSuccess,
  userExpired,
  userExpiring,
  userSignedOut,
} from 'stores/mapiauth/actions';

interface IMapiAuthProviderProps extends React.PropsWithChildren<{}> {}

const MapiAuthProvider: React.FC<IMapiAuthProviderProps> = ({ children }) => {
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
    const mapiAuth = MapiAuth.getInstance();
    mapiAuth.addEventListener(OAuth2Events.UserLoaded, onUserLoaded);
    mapiAuth.addEventListener(OAuth2Events.UserUnloaded, onUserSignedOut);
    mapiAuth.addEventListener(OAuth2Events.UserSignedOut, onUserSignedOut);
    mapiAuth.addEventListener(OAuth2Events.TokenExpiring, onTokenExpiring);
    mapiAuth.addEventListener(OAuth2Events.TokenExpired, onTokenExpired);
    mapiAuth.addEventListener(OAuth2Events.SilentRenewError, onUserSignedOut);

    return () => {
      mapiAuth.removeEventListener(OAuth2Events.UserLoaded, onUserLoaded);
      mapiAuth.removeEventListener(OAuth2Events.UserUnloaded, onUserSignedOut);
      mapiAuth.removeEventListener(OAuth2Events.UserSignedOut, onUserSignedOut);
      mapiAuth.removeEventListener(OAuth2Events.TokenExpiring, onTokenExpiring);
      mapiAuth.removeEventListener(OAuth2Events.TokenExpired, onTokenExpired);
      mapiAuth.removeEventListener(
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

MapiAuthProvider.propTypes = {};

export default MapiAuthProvider;
