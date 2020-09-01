import { act, renderHook } from '@testing-library/react-hooks';
import copy from 'copy-to-clipboard';

import useCopyToClipboard from '../useCopyToClipboard';

jest.mock('copy-to-clipboard');

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    (copy as jest.Mock).mockClear();
  });

  it('has no content in the clipboard initially', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    expect(result.current[0]).toBe(false);
  });

  it('sets content to clipboard and changes hook clipboard status', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const textToCopy = 'randomText';

    act(() => {
      result.current[1](textToCopy);
    });

    expect(copy).toBeCalledWith(textToCopy);
    expect(result.current[0]).toBe(true);
  });

  it('keeps the correct clipboard status between content changes', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    act(() => {
      result.current[1]('randomText');
    });

    act(() => {
      result.current[1]('anotherRandomText');
    });

    expect(copy).toHaveBeenCalledTimes(2);
    expect(result.current[0]).toBe(true);
  });

  it('resets clipboard status after resetting content', () => {
    const { result } = renderHook(() => useCopyToClipboard());

    act(() => {
      result.current[1]('randomText');
    });

    act(() => {
      result.current[1](null);
    });

    expect(copy).toHaveBeenCalledTimes(1);

    expect(result.current[0]).toBe(false);
  });
});
