import { fireEvent } from '@testing-library/react';
import PageVisibilityTracker from 'utils/pageVisibilityTracker';

describe('pageVisibilityTracker', () => {
  it('notifies listeners when the page became visible', () => {
    const tracker = new PageVisibilityTracker();
    const handler = jest.fn();
    tracker.addEventListener(handler);

    fireEvent(document, new Event('visibilitychange'));
    expect(handler).toHaveBeenCalled();

    tracker.removeEventListener(handler);
    handler.mockClear();

    fireEvent(document, new Event('visibilitychange'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('gets the current visibility state of the page', () => {
    const initialValue = document.hidden;

    const tracker = new PageVisibilityTracker();

    Object.defineProperty(document, 'hidden', {
      value: true,
      configurable: true,
    });
    expect(tracker.isVisible()).toBeFalsy();

    // @ts-expect-error
    delete document.hidden;
    Object.defineProperty(document, 'hidden', {
      value: false,
      configurable: true,
    });
    expect(tracker.isVisible()).toBeTruthy();

    // @ts-expect-error
    delete document.hidden;
    Object.defineProperty(document, 'hidden', {
      value: initialValue,
      configurable: false,
    });
  });
});
