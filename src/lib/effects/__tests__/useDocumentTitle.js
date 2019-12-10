import { act, renderHook } from '@testing-library/react-hooks';
import useDocumentTitle from '../useDocumentTitle';

let initialTitle = '';

describe('useDocumentTitle hook', () => {
  beforeAll(() => {
    initialTitle = document.title;
  });

  afterAll(() => {
    document.title = initialTitle;
  });

  beforeEach(() => {
    document.title = initialTitle;
  });

  it('sets the document title with the initially provided value', () => {
    const testTitle = 'Test title';
    renderHook(() => useDocumentTitle(testTitle));

    expect(document.title).toBe(testTitle);
  });

  it('handles document title changes', () => {
    const titles = ['Test title 1', 'Test title 2'];

    const { result } = renderHook(() => useDocumentTitle(titles[0]));

    act(() => {
      result.current[1](titles[1]);
    });

    expect(document.title).toBe(titles[1]);
  });
});
