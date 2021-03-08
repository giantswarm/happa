import { IOAuth2Provider, OAuth2Events } from 'lib/OAuth2/OAuth2';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import PropTypes from 'prop-types';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, logoutSuccess } from 'stores/main/actions';
import { mapOAuth2UserToUser } from 'stores/main/utils';

const authContext = createContext<IOAuth2Provider | null>(null);

interface IMapiAuthProviderProps {
  auth: IOAuth2Provider;
}

const MapiAuthProvider: React.FC<IMapiAuthProviderProps> = ({
  children,
  auth,
}) => {
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
    auth.addEventListener(OAuth2Events.UserLoaded, onUserLoaded);
    auth.addEventListener(OAuth2Events.UserUnloaded, onUserInvalid);
    auth.addEventListener(OAuth2Events.TokenExpired, onUserInvalid);
    auth.addEventListener(OAuth2Events.SilentRenewError, onUserInvalid);

    return () => {
      auth.removeEventListener(OAuth2Events.UserLoaded, onUserLoaded);
      auth.removeEventListener(OAuth2Events.UserUnloaded, onUserInvalid);
      auth.removeEventListener(OAuth2Events.TokenExpired, onUserInvalid);
      auth.removeEventListener(OAuth2Events.SilentRenewError, onUserInvalid);
    };
  }, [onUserLoaded, onUserInvalid, auth]);

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

MapiAuthProvider.propTypes = {
  // @ts-expect-error
  auth: PropTypes.object.isRequired,
  children: PropTypes.node,
};

export function useAuthProvider(): IOAuth2Provider {
  const authProvider = useContext(authContext);
  if (!authProvider) {
    throw new Error('useAuthProvider must be used within an AuthProvider.');
  }

  return authProvider;
}

export interface IPropsWithAuthProvider {
  authProvider: IOAuth2Provider;
}

export function withAuthProvider<T, U extends T & IPropsWithAuthProvider>(
  Component: React.ComponentType<T>
): React.ComponentType<U> {
  return class ComponentWithAuthProvider extends React.Component<U> {
    public render(): React.ReactNode {
      return (
        <authContext.Consumer>
          {(authProvider) => {
            if (!authProvider) {
              throw new Error(
                'withAuthProvider must be used within an AuthProvider.'
              );
            }

            return <Component {...this.props} authProvider={authProvider} />;
          }}
        </authContext.Consumer>
      );
    }
  };
}

export default MapiAuthProvider;
