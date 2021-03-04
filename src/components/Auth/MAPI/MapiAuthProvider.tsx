import MapiAuth from 'lib/MapiAuth/MapiAuth';
import { OAuth2Events } from 'lib/OAuth2/OAuth2';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import React, { ReactElement, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess } from 'stores/main/actions';
import { mapOAuth2UserToUser } from 'stores/main/utils';

interface IMapiAuthProviderProps extends React.PropsWithChildren<{}> {}

const MapiAuthProvider: React.FC<IMapiAuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();

  const onUserLoaded = useCallback(
    (event: CustomEvent<IOAuth2User | null>) => {
      if (!event.detail) {
        dispatch(logoutSuccess());

        return;
      }

      const user = mapOAuth2UserToUser(event.detail);
      dispatch(loginSuccess(user));
    },
    [dispatch]
  );

  const onUserInvalid = useCallback(() => {
    dispatch(logoutSuccess());
  }, [dispatch]);

  useEffect(() => {
    const mapiAuth = MapiAuth.getInstance();
    mapiAuth.addEventListener(OAuth2Events.UserLoaded, onUserLoaded);
    mapiAuth.addEventListener(OAuth2Events.UserUnloaded, onUserInvalid);
    mapiAuth.addEventListener(OAuth2Events.TokenExpired, onUserInvalid);
    mapiAuth.addEventListener(OAuth2Events.SilentRenewError, onUserInvalid);

    return () => {
      mapiAuth.removeEventListener(OAuth2Events.UserLoaded, onUserLoaded);
      mapiAuth.removeEventListener(OAuth2Events.UserUnloaded, onUserInvalid);
      mapiAuth.removeEventListener(OAuth2Events.TokenExpired, onUserInvalid);
      mapiAuth.removeEventListener(
        OAuth2Events.SilentRenewError,
        onUserInvalid
      );
    };
  }, [onUserLoaded, onUserInvalid]);

  if (typeof children === 'undefined' || children === null) {
    return null;
  }

  return React.Children.only(children as ReactElement);
};

MapiAuthProvider.propTypes = {};

export default MapiAuthProvider;
