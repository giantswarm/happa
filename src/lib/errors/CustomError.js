import ErrorReporter from 'lib/ErrorReporter';
import StackTraceGPS from 'stacktrace-gps';
import StackTrace from 'stacktrace-js';

// TODO: Attach deserialization methods
// TODO: Attach custom payloads

export class CustomError extends Error {
  static resolver = new StackTraceGPS();

  static createFromError(error, customType = error.constructor.name) {
    const newError = new CustomError(customType, error.message);

    return newError;
  }

  static stringifyStack(type, message, stackFrames) {
    // Stringify error in the same way the native Error would be stringified
    // {Error Type}: {Error message}
    let output = `${type}: ${message}\n`;
    // *tab* at {File}:{Line} *newline*
    output += stackFrames.map(trace => `\tat ${trace.toString()}`).join('\n');

    return output;
  }

  constructor(type, message) {
    super(message);

    this.name = type;
    this.generateStack();
  }

  generateStack() {
    const stackFrames = StackTrace.getSync();
    const stack = CustomError.stringifyStack(
      this.name,
      this.message,
      stackFrames
    );

    this.stack = stack;
  }

  async generateDetailedStack() {
    let stack = '';

    try {
      if (!window.navigator.onLine) {
        throw new Error('The client is offline');
      }

      let stackFrames = StackTrace.getSync();
      stackFrames = stackFrames.map(frame => {
        return CustomError.resolver.pinpoint(frame);
      });
      stackFrames = await Promise.all(stackFrames);

      stack = CustomError.stringifyStack(this.name, this.message, stackFrames);
    } catch (err) {
      stack = `Couldn't get the detailed stack: ${err.message}

${this.stack}
      `;
    }

    this.stack = stack;
  }

  serialize() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
    };
  }

  toJSON() {
    return this.serialize();
  }

  toString() {
    return this.stack;
  }

  async report() {
    await this.generateDetailedStack();

    ErrorReporter.getInstance().notify(this.toString());
    console.log(`reported:\n${this.toString()}`);
  }
}
