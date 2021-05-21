export interface IErrorReporterNotifier {
  notify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: Error | string | Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraInfo?: Record<string, any>
  ): Promise<void>;
}

/**
 * A singleton helper to report errors to a
 * 3rd party provider.
 */
class ErrorReporter {
  /**
   * Singleton instance.
   */
  private static _instance: ErrorReporter | null = null;

  /**
   * Get current instance of the reporter or
   * create a new one, if it doesn't exist.
   */
  public static getInstance(): ErrorReporter {
    if (!ErrorReporter._instance) {
      ErrorReporter._instance = new ErrorReporter();
    }

    return ErrorReporter._instance;
  }

  /**
   * The 3rd party error reporter.
   */
  notifier: IErrorReporterNotifier | null = null;

  /**
   * Report an error.
   * error - The error to report.
   */
  async notify(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: Error | string | Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraInfo?: Record<string, any>
  ): Promise<void> {
    await this.notifier?.notify(error, extraInfo);
  }
}

export default ErrorReporter;
