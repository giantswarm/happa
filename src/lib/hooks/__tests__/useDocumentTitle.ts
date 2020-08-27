import { act, renderHook } from '@testing-library/react-hooks';

import useDocumentTitle from '../useDocumentTitle';

describe('useDocumentTitle', () => {
  let initialTitle = '';

  beforeAll(() => {
    initialTitle = document.title;
  });

  beforeEach(() => {
    document.title = initialTitle;
  });

  afterAll(() => {
    document.title = initialTitle;
  });

  it('sets the document title with the initially provided value', () => {
    const testTitle = 'Test title';
    renderHook(() => useDocumentTitle(testTitle));

    expect(document.title).toContain(testTitle);
  });

  it('handles document title changes', () => {
    const titles = ['Test title 1', 'Test title 2'];

    const { result } = renderHook(() => useDocumentTitle(titles[0]));

    act(() => {
      result.current[1](titles[1]);
    });

    expect(document.title).toContain(titles[1]);
  });

  it(`suffixes document titles with the '| Giant Swarm' label `, () => {
    const suffix = '| Giant Swarm';
    const titles = ['Test title 1', 'Test title 2'];

    const { result } = renderHook(() => useDocumentTitle(titles[0]));

    expect(document.title).toBe(`${titles[0]} ${suffix}`);

    act(() => {
      result.current[1](titles[1]);
    });

    expect(document.title).toBe(`${titles[1]} ${suffix}`);
  });
});
