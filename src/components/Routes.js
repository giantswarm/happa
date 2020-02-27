import React, { lazy, Suspense } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppRoutes } from 'shared/constants/routes';

import LoadingOverlay from './UI/LoadingOverlay';

const Layout = lazy(() => import(/* webpackChunkName: "Layout" */ './Layout'));

const AdminLogin = lazy(() =>
  import(/* webpackChunkName: "AdminLogin" */ './Auth/AdminLogin')
);
const Login = lazy(() =>
  import(/* webpackChunkName: "Login" */ './Auth/Login')
);
const StyleGuide = lazy(() =>
  import(/* webpackChunkName: "StyleGuide" */ './UI/StyleGuide')
);
const Logout = lazy(
  /* webpackChunkName: "Logout" */ () => import('./Auth/Logout')
);
const OAuthCallback = lazy(
  /* webpackChunkName: "OAuthCallback" */ () => import('./Auth/OAuthCallback')
);
const ForgotPassword = lazy(
  /* webpackChunkName: "ForgotPassword" */ () =>
    import('./ForgotPassword/ForgotPassword')
);
const SetPassword = lazy(
  /* webpackChunkName: "SetPassword" */ () =>
    import('./ForgotPassword/SetPassword')
);
const SignUp = lazy(
  /* webpackChunkName: "SignUp" */ () => import('./SignUp/SignUp')
);

const Routes = () => {
  return (
    <Suspense fallback={<LoadingOverlay loading={true} />}>
      <Switch>
        <Route path={AppRoutes.AdminLogin} component={AdminLogin} />
        <Route path={AppRoutes.Login} component={Login} />
        <Route path={AppRoutes.Logout} component={Logout} />
        <Route path={AppRoutes.SetPassword} component={SetPassword} />
        <Route path={AppRoutes.ForgotPassword} component={ForgotPassword} />
        <Route path={AppRoutes.SignUp} component={SignUp} />
        <Route path={AppRoutes.OAuthCallback} component={OAuthCallback} />
        <Route path={AppRoutes.StyleGuide} component={StyleGuide} />
        <Route path={AppRoutes.Home} component={Layout} />
      </Switch>
    </Suspense>
  );
};

export default Routes;
