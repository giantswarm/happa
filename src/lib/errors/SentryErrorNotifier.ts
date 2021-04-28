import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';

import { IErrorReporterNotifier } from './ErrorReporter';

export interface ISentryErrorNotifierConfig {
  projectName: string;
  dsn: string;
  releaseVersion: string;
  environment: string;
}

export class SentryErrorNotifier implements IErrorReporterNotifier {
  constructor(config: ISentryErrorNotifierConfig) {
    Sentry.init({
      dsn: config.dsn,
      release: `${config.projectName}@${config.releaseVersion}`,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0.5,
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
}
