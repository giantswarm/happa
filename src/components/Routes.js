import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRoutes } from 'shared/constants/routes';

import Layout from './Layout';
import LoadingOverlay from './UI/LoadingOverlay';

const AdminLogin = lazy(() =>
  import(/* webpackChunkName: "AdminLogin" */ './Auth/AdminLogin')
);
const Login = lazy(() =>
  import(/* webpackChunkName: "Login" */ './Auth/Login')
);
const StyleGuide = lazy(() =>
  import(/* webpackChunkName: "StyleGuide" */ './UI/StyleGuide')
);
const Logout = lazy(/* webpackChunkName: "Logout" */ () => './Auth/Logout');
const OAuthCallback = lazy(
  /* webpackChunkName: "OAuthCallback" */ () => './Auth/OAuthCallback'
);
const ForgotPassword = lazy(
  /* webpackChunkName: "ForgotPassword" */ () =>
    './ForgotPassword/ForgotPassword'
);
const SetPassword = lazy(
  /* webpackChunkName: "SetPassword" */ () => './ForgotPassword/SetPassword'
);
const SignUp = lazy(/* webpackChunkName: "SignUp" */ () => './SignUp/SignUp');

const Routes = () => {
  return (
    <Switch>
      <Route
        path={AppRoutes.AdminLogin}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <AdminLogin {...routeProps} />
          </Suspense>
        )}
      />
      <Route
        component={Login}
        path={AppRoutes.Login}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <Login {...routeProps} />
          </Suspense>
        )}
      />
      <Route
        path={AppRoutes.Logout}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <Logout {...routeProps} />
          </Suspense>
        )}
      />
      <Route
        path={AppRoutes.SetPassword}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <SetPassword {...routeProps} />
          </Suspense>
        )}
      />
      <Route
        path={AppRoutes.ForgotPassword}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <ForgotPassword {...routeProps} />
          </Suspense>
        )}
      />
      <Route
        path={AppRoutes.SignUp}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <SignUp {...routeProps} />
          </Suspense>
        )}
      />
      <Route
        path={AppRoutes.OAuthCallback}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <OAuthCallback {...routeProps} />
          </Suspense>
        )}
      />
      <Route
        path={AppRoutes.StyleGuide}
        render={routeProps => (
          <Suspense fallback={<LoadingOverlay loading={true} />}>
            <StyleGuide {...routeProps} />
          </Suspense>
        )}
      />
      <Route component={Layout} path={AppRoutes.Home} />
    </Switch>
  );
};

export default Routes;
