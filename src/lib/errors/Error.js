import ErrorStackParser from 'error-stack-parser';
import StackTraceGPS from 'stacktrace-gps';
import StackTrace from 'stacktrace-js';

export class Error {
  static createFromError(error, customType = error.constructor.name) {
    const newError = new Error(customType, error.message);
    const newStack = ErrorStackParser.parse(error);
    newError.setStack(newStack);

    return newError;
  }

  _type = '';
  _message = '';
  _stack = [];

  constructor(type, message) {
    this.setType(type);
    this.setMessage(message);
    this.generateStack();
  }

  setType(newType) {
    this._type = newType;
  }

  getType() {
    return this._type;
  }

  setMessage(newMessage) {
    this._message = newMessage;
  }

  getMessage() {
    return this._message;
  }

  generateStack() {
    const stack = StackTrace.getSync({
      // filter: frame => {
      //   const regex = new RegExp(/Error.generateStack|new Error/);
      //   return !regex.test(frame.functionName);
      // },
    });
    this.setStack(stack);
  }

  async generateDetailedStack() {
    let stackFrames = this.getStack();

    if (window.navigator.onLine) {
      const gps = new StackTraceGPS();

      stackFrames = stackFrames.map(frame => {
        return gps.pinpoint(frame);
      });
      stackFrames = await Promise.all(stackFrames);
    }

    this.setStack(stackFrames);
  }

  setStack(newStack) {
    this._stack = newStack;
  }

  getStack() {
    return this._stack;
  }

  serialize(stringifyStack = false) {
    let stack = this.getStack();

    if (stringifyStack) {
      stack = this.toString();
    }

    return {
      type: this.getType(),
      message: this.getMessage(),
      stack,
    };
  }

  toJSON() {
    return this.serialize(true);
  }

  toString() {
    const serializedError = this.serialize();

    // Stringify error in the same way the native Error would be stringified
    // {Error Type}: {Error message}
    let output = `${serializedError.type}: ${serializedError.message}\n`;
    // *tab* at {File}:{Line} *newline*
    output += serializedError.stack
      .map(trace => `\tat ${trace.toString()}`)
      .join('\n');

    return output;
  }

  async report() {
    await this.generateDetailedStack();

    console.log(this.toString());
  }
}
