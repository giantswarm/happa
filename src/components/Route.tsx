import * as React from 'react';
import {
  Route as ReactRouterRoute,
  RouteProps as ReactRouterRouteProps,
} from 'react-router-dom';
import { SentryErrorNotifier } from 'utils/errors/SentryErrorNotifier';

interface IRouteProps extends ReactRouterRouteProps {}

const Route: React.FC<IRouteProps> = (props) => {
  return <ReactRouterRoute {...props} />;
};

export default SentryErrorNotifier.decorateRoute(Route);
