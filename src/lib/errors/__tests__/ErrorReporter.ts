import ErrorReporter, { IErrorReporterNotifier } from '../ErrorReporter';

const testNotifier: IErrorReporterNotifier = {
  notify: jest.fn(),
};

describe('ErrorReporter', () => {
  it('is a singleton', () => {
    const reporter = new ErrorReporter();
    const sameReporter = ErrorReporter.getInstance();

    expect(reporter).toEqual(sameReporter);
  });

  it(`doesn't crash on notifying, if there is no notifier`, () => {
    const reporter = ErrorReporter.getInstance();

    expect(() => reporter.notify('CRAAAASH')).not.toThrow();
  });

  it('notifies a 3rd party tool', () => {
    const errMessage = 'CRAAAAAASH';

    const reporter = ErrorReporter.getInstance();
    reporter.notifier = testNotifier;

    reporter.notify(errMessage);

    expect(testNotifier.notify).toBeCalledWith(errMessage, undefined);
  });
});
