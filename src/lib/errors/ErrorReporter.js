/**
 * A singleton helper to report errors to a
 * 3rd party provider
 */
class ErrorReporter {
  /**
   * Singleton instance
   * @type {ErrorReporter | null}
   * @private
   */
  static _instance = null;

  /**
   * Get current instance of the reporter
   * @return {ErrorReporter}
   */
  static getInstance() {
    if (!ErrorReporter._instance) {
      ErrorReporter._instance = new ErrorReporter();
    }

    return ErrorReporter._instance;
  }

  /**
   * The 3rd party error reporter
   */
  notifier = null;

  /**
   * Report an error
   * @param {string | Object} error - The error to report
   */
  notify(error) {
    this.notifier?.notify(error);
  }
}

export default ErrorReporter;
