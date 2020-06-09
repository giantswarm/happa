import CPAuth from 'lib/CPAuth';
import { OAuth2Events } from 'lib/OAuth2/OAuth2';
import React, { ReactElement, useEffect } from 'react';

interface ICPAuthProviderProps extends React.PropsWithChildren<{}> {}

const CPAuthProvider: React.FC<ICPAuthProviderProps> = ({ children }) => {
  // const dispatch = useDispatch();

  useEffect(() => {
    const cpAuth = CPAuth.getInstance();
    cpAuth.addEventListener(OAuth2Events.UserLoaded, console.log);
    cpAuth.addEventListener(OAuth2Events.UserUnloaded, console.log);
    cpAuth.addEventListener(OAuth2Events.UserSignedOut, console.log);
    cpAuth.addEventListener(OAuth2Events.TokenExpiring, console.log);
    cpAuth.addEventListener(OAuth2Events.TokenExpired, console.log);
    cpAuth.addEventListener(OAuth2Events.SilentRenewError, console.log);

    return () => {
      cpAuth.removeEventListener(OAuth2Events.UserLoaded, console.log);
      cpAuth.removeEventListener(OAuth2Events.UserUnloaded, console.log);
      cpAuth.removeEventListener(OAuth2Events.UserSignedOut, console.log);
      cpAuth.removeEventListener(OAuth2Events.TokenExpiring, console.log);
      cpAuth.removeEventListener(OAuth2Events.TokenExpired, console.log);
      cpAuth.removeEventListener(OAuth2Events.SilentRenewError, console.log);
    };
  }, []);

  if (typeof children === 'undefined') {
    return null;
  }

  return React.Children.only(children as ReactElement);
};

CPAuthProvider.propTypes = {};

export default CPAuthProvider;
