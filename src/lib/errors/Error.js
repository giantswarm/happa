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
    const stack = StackTrace.getSync();
    this.setStack(stack);
  }

  setStack(newStack) {
    this._stack = newStack;
  }

  getStack() {
    return this._stack;
  }

  async getDetailedStack() {
    let stackFrames = this.getStack();
    const gps = new StackTraceGPS();

    stackFrames = stackFrames.map(frame => {
      return gps.pinpoint(frame);
    });

    stackFrames = await Promise.all(stackFrames);

    return stackFrames;
  }

  serialize() {
    return {
      type: this.getType(),
      message: this.getMessage(),
      stack: this.getStack(),
    };
  }

  toJSON() {
    return this.serialize();
  }

  async report() {
    const serializedError = this.serialize();
    const stackTrace = await this.getDetailedStack();
    serializedError.stack = stackTrace;

    let output = `${serializedError.type}: ${serializedError.message}\n`;
    output += stackTrace.map(trace => `\tat ${trace.toString()}`).join('\n');

    console.log(output);
  }
}
