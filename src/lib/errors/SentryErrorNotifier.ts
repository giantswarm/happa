import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { History } from 'history';
import React from 'react';
import { RouteProps } from 'react-router-dom';

import { IErrorReporterNotifier } from './ErrorReporter';

export interface ISentryErrorNotifierConfig {
  projectName: string;
  dsn: string;
  releaseVersion: string;
  environment: string;
  history: History<History.LocationState>;
}

export class SentryErrorNotifier implements IErrorReporterNotifier {
  constructor(config: ISentryErrorNotifierConfig) {
    Sentry.init({
      dsn: config.dsn,
      release: `${config.projectName}@${config.releaseVersion}`,
      integrations: [
        new Integrations.BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV5Instrumentation(config.history),
        }),
      ],
      tracesSampleRate: 0.3,
      environment: config.environment,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async notify(
    error: Error | string | Record<string, unknown>
  ): Promise<void> {
    Sentry.captureException(error);

    return Promise.resolve();
  }

  public static createReduxEnhancer() {
    return Sentry.createReduxEnhancer();
  }

  public static decorateComponent<T>(component: React.FC<T>) {
    return Sentry.withProfiler(component);
  }

  public static decorateRoute<T extends RouteProps>(
    routeComponent: React.FC<T>
  ): React.FC<T> {
    return Sentry.withSentryRouting(routeComponent as never) as React.FC<T>;
  }
}
