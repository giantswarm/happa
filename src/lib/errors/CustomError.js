import { ErrorReporter } from 'lib/errors';
import StackTraceGPS from 'stacktrace-gps';
import StackTrace from 'stacktrace-js';

/**
 * @typedef {Object} ICustomError
 * @property {string} name - Error name
 * @property {string} message - Error message
 * @property {string} stack - Pretty-printed stack trace
 */

/**
 * A custom error object that can create custom stack traces
 * (and even really detailed ones)
 */
export class CustomError extends Error {
  /**
   * Resolver that finds sourcemaps and resolves
   * function names, line numbers, file names
   */
  static resolver = new StackTraceGPS();

  /**
   * Create a custom error object from previously
   * serialized custom error
   * @param {ICustomError} obj - Serialized custom error
   * @return {CustomError}
   */
  static createFromObject(obj) {
    const newError = new CustomError();
    newError.deserialize(obj);

    return newError;
  }

  /**
   * Create a custom error object from a regular
   * error object
   * @param {Error} error - Regular error
   * @param {string} [customName] - The error name (defaults to the error constructor name)
   * @return {CustomError}
   */
  static createFromError(error, customName = error.constructor.name) {
    const newError = new CustomError(customName, error.message);

    return newError;
  }

  /**
   * Pretty-print the stack trace
   * @param {string} name - Error name
   * @param {string} message - Error message
   * @param {StackTrace.StackFrame[]} stackFrames - Error stack frames
   * @return {string}
   */
  static stringifyStack(name, message, stackFrames) {
    // Stringify error in the same way the native Error would be stringified
    // {Error name}: {Error message}
    let output = `${name}: ${message}\n`;
    // *tab* at {File}:{Line} *newline*
    output += stackFrames.map(trace => `\tat ${trace.toString()}`).join('\n');

    return output;
  }

  /**
   * Create new Custom error object
   * @param {string} name - Error name
   * @param {string} message - Error message
   */
  constructor(name, message) {
    super(message);

    this.name = name;
    this.generateStack();
  }

  /**
   * Generate the error stack, starting from the current
   * execution point
   */
  generateStack() {
    const stackFrames = StackTrace.getSync();
    const stack = CustomError.stringifyStack(
      this.name,
      this.message,
      stackFrames
    );

    this.stack = stack;
  }

  /**
   * Generate a more detailed error stack, starting from the current
   * execution point. This also includes resolved sourcemaps and
   * guessed names for anonymous functions
   * @return {Promise<void>}
   */
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

  /**
   * Send a report to the error reporter endpoint
   * @return {Promise<void>}
   */
  report() {
    // await this.generateDetailedStack();

    ErrorReporter.getInstance().notify({
      error: this.serialize(),
      context: { severity: 'error' },
    });
  }

  /**
   * Return an easier to store variant
   * of the error
   * @return {ICustomError}
   */
  serialize() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
    };
  }

  /**
   * Deserialize an already serialized variant
   * of the error
   * @param {ICustomError} obj - An already serialized error
   */
  deserialize(obj) {
    this.name = obj.name;
    this.message = obj.message;
    this.stack = obj.stack;
  }

  /**
   * This dictates the output of `JSON.stringify()`
   * @return {ICustomError}
   */
  toJSON() {
    return this.serialize();
  }

  /**
   * Return the pretty-printed error stack
   * @return {string}
   */
  toString() {
    return this.stack;
  }
}
