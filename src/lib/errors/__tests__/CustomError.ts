import CustomError, { IStackFrame } from 'lib/errors/CustomError';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { IStackTraceGPS } from 'stacktrace-gps';

const mockResolver: IStackTraceGPS = {
  pinpoint: jest.fn(),
} as unknown as IStackTraceGPS;

const mockStackFrame = ({
  functionName,
  fileName,
  lineNumber,
  columnNumber,
}: Partial<IStackFrame>): IStackFrame => {
  return {
    functionName,
    fileName,
    lineNumber,
    columnNumber,
    toString() {
      return `${functionName}()@${fileName}:${lineNumber}:${columnNumber}`;
    },
  };
};

const mockReporter: ErrorReporter = {
  notify: jest.fn(),
} as unknown as ErrorReporter;

describe('CustomError', () => {
  afterEach(() => {
    (mockResolver.pinpoint as jest.Mock).mockClear();

    // @ts-expect-error
    window.navigator.onLine = false;
  });

  it('can be instantiated without any arguments', () => {
    expect(() => new CustomError()).not.toThrow();
  });

  it('can be instantiated with arguments', () => {
    const error = new CustomError('Some error', 'Something blew up!');

    expect(error.name).toBe('Some error');
    expect(error.message).toBe('Something blew up!');
    // Displays error name and message
    expect(error.stack).toMatch(/Some error: Something blew up!/);
    /**
     * This function name is part of the stack,
     * so we assume the whole stack is correct
     */
    expect(error.stack).toMatch(/CustomError.generateStack/);
  });

  it('can be instantiated with a native error object', () => {
    const error = new Error('Something happened!');
    let customError = CustomError.createFromError(error);

    expect(customError.name).toBe('Error');
    expect(customError.message).toBe('Something happened!');
    // Displays error name and message
    expect(customError.stack).toMatch(/Error: Something happened!/);
    /**
     * This function name is part of the stack,
     * so we assume the whole stack is correct
     */
    expect(customError.stack).toMatch(/CustomError.generateStack/);

    // Instantiate with custom name
    customError = CustomError.createFromError(error, 'Some cool name');

    expect(customError.name).toBe('Some cool name');
    expect(customError.message).toBe('Something happened!');
    // Displays error name and message
    expect(customError.stack).toMatch(/Some cool name: Something happened!/);
    /**
     * This function name is part of the stack,
     * so we assume the whole stack is correct
     */
    expect(customError.stack).toMatch(/CustomError.generateStack/);
  });

  it('regenerates the stack on demand', () => {
    const error = new CustomError('Custom type', 'Oops!');
    const stack = error.stack;

    error.generateStack();

    expect(error.stack).not.toBe(stack);
    expect(error.stack).toMatch(/Custom type: Oops!/);
    /**
     * This function name is part of the stack,
     * so we assume the whole stack is correct
     */
    expect(error.stack).toMatch(/CustomError.generateStack/);
  });

  it('generates a detailed stack trace if the client is online', async () => {
    // @ts-expect-error
    window.navigator.onLine = true;

    (mockResolver.pinpoint as jest.Mock).mockResolvedValue(
      mockStackFrame({
        functionName: 'testFn',
        fileName: 'some/path/to/a/file.js',
        lineNumber: 23,
        columnNumber: 165,
      })
    );

    const error = new CustomError('Custom type', 'Oops!');
    error.resolver = mockResolver;

    await error.generateDetailedStack();

    expect(error.stack).toMatch(/Custom type: Oops!/);
    /**
     * This function name is part of the stack,
     * so we assume the whole stack is correct
     */
    expect(error.stack).toMatch(
      /at testFn\(\)\@some\/path\/to\/a\/file.js:23:165/
    );
  });

  it('generates the original stack with a warning if trying to generate detailed stack with client offline', async () => {
    const error = new CustomError('Custom type', 'Oops!');
    error.resolver = mockResolver;

    await error.generateDetailedStack();

    expect(mockResolver.pinpoint).not.toHaveBeenCalled();

    expect(error.stack).toMatch(
      /Couldn't get the detailed stack: The client is offline/
    );
    expect(error.stack).toMatch(/Custom type: Oops!/);
  });

  it('generates the original stack with a warning if trying to generate detailed stack fails', async () => {
    // @ts-expect-error
    window.navigator.onLine = true;

    (mockResolver.pinpoint as jest.Mock).mockRejectedValue(
      new Error('YOU FAILED!')
    );

    const error = new CustomError('Custom type', 'Oops!');
    error.resolver = mockResolver;

    await error.generateDetailedStack();

    expect(error.stack).toMatch(/Couldn't get the detailed stack: YOU FAILED/);
    expect(error.stack).toMatch(/Custom type: Oops!/);
  });

  it('can get serialized for easy storage', () => {
    const error = new CustomError('Custom type', 'Oops!');
    expect(error.serialize()).toStrictEqual({
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  });

  it('can get deserialized from an already serialized input', () => {
    const error = new CustomError('Custom type', 'Oops!');
    const newError = new CustomError();

    newError.deserialize(error.serialize());

    expect(newError.name).toBe(error.name);
    expect(newError.message).toBe(error.message);
    expect(newError.stack).toBe(error.stack);
  });

  it('can be instantiated from an already serialized input', () => {
    const error = new CustomError('Custom type', 'Oops!');

    const newError = CustomError.createFromObject(error.serialize());

    expect(newError.name).toBe(error.name);
    expect(newError.message).toBe(error.message);
    expect(newError.stack).toBe(error.stack);
  });

  it('can be converted to json', () => {
    const error = new CustomError('Custom type', 'Oops!');
    const serializedError = error.serialize();

    const json = JSON.stringify(error);
    expect(JSON.parse(json)).toStrictEqual(serializedError);
  });

  it('can be converted to string', () => {
    const error = new CustomError('Custom type', 'Oops!');

    expect(error.toString()).toBe(error.stack);
    expect(String(error)).toBe(error.stack);
  });

  it('reports errors to a 3rd party error reporter', () => {
    const error = new CustomError('Custom type', 'Oops!');
    error.reporter = mockReporter;

    error.report();

    expect(mockReporter.notify).toHaveBeenCalledWith({
      error: error.serialize(),
      context: { severity: 'error' },
    });
  });

  it('creates a pretty-printed stack', () => {
    const frames = [
      mockStackFrame({
        functionName: 'testFn',
        fileName: 'some/path/to/a/file.js',
        lineNumber: 23,
        columnNumber: 165,
      }),
      mockStackFrame({
        functionName: 'someFn',
        fileName: 'some/other/path/to/anotherFile.js',
        lineNumber: 35,
        columnNumber: 253,
      }),
      mockStackFrame({
        functionName: 'someOtherFn',
        fileName: 'path/index.js',
        lineNumber: 1,
        columnNumber: 5,
      }),
    ];

    const stack = CustomError.stringifyStack('Custom type', 'Oops!', frames);
    expect(stack).toMatch(/at testFn\(\)\@some\/path\/to\/a\/file.js:23:165/);
    expect(stack).toMatch(
      /at someFn\(\)\@some\/other\/path\/to\/anotherFile.js:35:253/
    );
    expect(stack).toMatch(/at someOtherFn\(\)\@path\/index.js:1:5/);
  });
});
