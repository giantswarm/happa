import StackTraceGPS from 'stacktrace-gps';
import StackTrace from 'stacktrace-js';
import ErrorReporter from 'utils/errors/ErrorReporter';

export interface ICustomError {
  name: string;
  message: string;
  // Pretty-printed stack trace.
  stack: string;
}

export interface IStackFrame {
  toString: () => string;
  isConstructor?: boolean;
  isEval?: boolean;
  isNative?: boolean;
  isTopLevel?: boolean;
  columnNumber?: number;
  lineNumber?: number;
  fileName?: string;
  functionName?: string;
  source?: string;
  args?: unknown[];
  evalOrigin?: IStackFrame;
}

/**
 * A custom error object that can create custom stack traces
 * (and even really detailed ones).
 */
class CustomError extends Error implements ICustomError {
  /**
   * Create a custom error object from previously
   * serialized custom error.
   * @param obj - Serialized custom error.
   */
  public static createFromObject(obj: ICustomError): CustomError {
    const newError = new CustomError();
    newError.deserialize(obj);

    return newError;
  }

  /**
   * Create a custom error object from a regular
   * error object.
   * @param error - Regular error.
   * @param [customName] - The error name (defaults to the error constructor name).
   */
  public static createFromError(
    error: Error,
    customName = error.name
  ): CustomError {
    const newError = new CustomError(customName, error.message);

    return newError;
  }

  /**
   * Pretty-print the stack trace.
   * @param name - Error name.
   * @param message - Error message.
   * @param stackFrames - Error stack frames.
   */
  public static stringifyStack(
    name: string,
    message: string,
    stackFrames: IStackFrame[]
  ): string {
    // Stringify error in the same way the native Error would be stringified.
    // {Error name}: {Error message}
    let output = `${name}: ${message}\n`;
    // *tab* at {File}:{Line} *newline*
    output += stackFrames.map((trace) => `\tat ${trace.toString()}`).join('\n');

    return output;
  }

  public stack: string = '';

  /**
   * Resolver that finds sourcemaps and resolves
   * function names, line numbers, file names.
   */
  public resolver = new StackTraceGPS();

  /**
   * Reporter that "reports" the error to a
   * 3rd party error notifier.
   */
  public reporter = ErrorReporter.getInstance();

  /**
   * Create new Custom error object.
   * @param name - Error name.
   * @param message - Error message.
   */
  constructor(name = '', message = '') {
    super(message);

    this.name = name;
    this.generateStack();
  }

  /**
   * Generate the error stack, starting from the current
   * execution point.
   */
  public generateStack() {
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
   * guessed names for anonymous functions.
   */
  public async generateDetailedStack(): Promise<void> {
    let stack = '';

    try {
      if (!window.navigator.onLine) {
        throw new Error('The client is offline');
      }

      let stackFrames = StackTrace.getSync();
      stackFrames = stackFrames.map((frame) => {
        return this.resolver.pinpoint(frame);
      });
      stackFrames = await Promise.all(stackFrames);

      stack = CustomError.stringifyStack(this.name, this.message, stackFrames);
    } catch (err) {
      stack = `Couldn't get the detailed stack: ${(err as Error).message}

${this.stack}`;
    }

    this.stack = stack;
  }

  /**
   * Send a report to the error reporter endpoint.
   */
  public report(): Promise<void> {
    return this.reporter.notify({
      error: this.serialize(),
      context: { severity: 'error' },
    });
  }

  /**
   * Return an easier to store variant
   * of the error.
   */
  public serialize(): ICustomError {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack,
    };
  }

  /**
   * Deserialize an already serialized variant
   * of the error.
   * @param obj - An already serialized error.
   */
  public deserialize(obj: ICustomError) {
    this.name = obj.name;
    this.message = obj.message;
    this.stack = obj.stack;
  }

  /**
   * This dictates the output of `JSON.stringify()`.
   */
  public toJSON(): ICustomError {
    return this.serialize();
  }

  /**
   * Return the pretty-printed error stack.
   */
  public toString() {
    return this.stack;
  }
}

export default CustomError;
