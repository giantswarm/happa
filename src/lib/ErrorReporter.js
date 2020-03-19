class ErrorReporter {
  static _instance = null;

  static getInstance() {
    if (!ErrorReporter._instance) {
      ErrorReporter._instance = new ErrorReporter();
    }

    return ErrorReporter._instance;
  }

  notifier = null;

  notify(error) {
    // eslint-disable-next-line no-unused-expressions
    this.notifier?.notify(error);
  }
}

export default ErrorReporter;
