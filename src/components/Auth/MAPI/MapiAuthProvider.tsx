import { push } from 'connected-react-router';
import { IOAuth2Provider, OAuth2Events } from 'lib/OAuth2/OAuth2';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import { loginSuccess, logoutSuccess } from 'model/stores/main/actions';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useDispatch } from 'react-redux';
import { MainRoutes } from 'shared/constants/routes';

const authContext = createContext<IOAuth2Provider | null>(null);

interface IMapiAuthProviderProps {
  auth: IOAuth2Provider;
}

const MapiAuthProvider: React.FC<IMapiAuthProviderProps> = ({
  children,
  auth,
}) => {
  const dispatch = useDispatch();

  const onUserInvalid = useCallback(() => {
    dispatch(push(MainRoutes.Login));
    dispatch(logoutSuccess());
  }, [dispatch]);

  const onUserLoaded = useCallback(
    (event: CustomEvent<IOAuth2User | null>) => {
      if (!event.detail) {
        onUserInvalid();

        return;
      }

      const user = mapOAuth2UserToUser(event.detail);
      dispatch(loginSuccess(user));
    },
    [onUserInvalid, dispatch]
  );

  useEffect(() => {
    auth.addEventListener(OAuth2Events.UserLoaded, onUserLoaded);
    auth.addEventListener(OAuth2Events.UserUnloaded, onUserInvalid);
    auth.addEventListener(OAuth2Events.SilentRenewError, onUserInvalid);
    auth.addEventListener(OAuth2Events.UserSignedOut, onUserInvalid);

    return () => {
      auth.removeEventListener(OAuth2Events.UserLoaded, onUserLoaded);
      auth.removeEventListener(OAuth2Events.UserUnloaded, onUserInvalid);
      auth.removeEventListener(OAuth2Events.SilentRenewError, onUserInvalid);
      auth.removeEventListener(OAuth2Events.UserSignedOut, onUserInvalid);
    };
  }, [onUserLoaded, onUserInvalid, auth]);

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
};

export function useAuthProvider(): IOAuth2Provider {
  const authProvider = useContext(authContext);
  if (!authProvider) {
    throw new Error('useAuthProvider must be used within an AuthProvider.');
  }

  return useMemo(() => authProvider, [authProvider]);
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
