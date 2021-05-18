import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { History } from 'history';
import React from 'react';
import { RouteProps } from 'react-router-dom';
import { AnyAction } from 'redux';

import { IErrorReporterNotifier } from './ErrorReporter';

export interface ISentryErrorNotifierConfig {
  projectName: string;
  dsn: string;
  releaseVersion: string;
  environment: string;
  history: History<History.LocationState>;
  debug?: boolean;
  sampleRate?: number;
}

export class SentryErrorNotifier implements IErrorReporterNotifier {
  constructor(config: ISentryErrorNotifierConfig) {
    Sentry.init({
      dsn: config.dsn,
      release: `${config.projectName}@${config.releaseVersion}`,
      integrations: [
        new Integrations.BrowserTracing({
          routingInstrumentation: Sentry.reactRouterV5Instrumentation(
            config.history
          ),
        }),
      ],
      tracesSampleRate: config.sampleRate,
      debug: config.debug,
      environment: config.environment,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  public async notify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: Error | string | Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraInfo?: Record<string, any>
  ): Promise<void> {
    switch (true) {
      case error instanceof Error:
        Sentry.captureException(error, { extra: extraInfo });
        break;

      case typeof error === 'string':
        Sentry.captureException(new Error(error as string), {
          extra: extraInfo,
        });
        break;

      default:
        Sentry.captureException(error, { extra: extraInfo });
        break;
    }

    return Promise.resolve();
  }

  public static createReduxEnhancer() {
    return Sentry.createReduxEnhancer({
      actionTransformer(action: AnyAction) {
        // Exclude any possibly sensitive information.
        if (action.type.toLowerCase().includes('password')) {
          return null;
        }

        return action;
      },
      stateTransformer() {
        // Don't send the current state.
        return null;
      },
    });
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
