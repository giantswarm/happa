import DocumentTitle from 'shared/DocumentTitle';
import React from 'react';
import { getComponentWithTheme } from 'testUtils/renderUtils';
import { render } from '@testing-library/react';

let initialTitle = '';

const getComponent = props => {
  const propsWithChildren = Object.assign({}, props, { children: <p /> });

  return getComponentWithTheme(DocumentTitle, propsWithChildren);
};
const renderWithProps = props => render(getComponent(props));

describe('DocumentTitle', () => {
  beforeAll(() => {
    initialTitle = document.title;
  });

  afterAll(() => {
    document.title = initialTitle;
  });

  beforeEach(() => {
    document.title = initialTitle;
  });

  it('renders without crashing', () => {
    renderWithProps({});
  });

  it(`sets title to 'Giant Swarm' if no title prop is provided`, () => {
    renderWithProps({});

    expect(document.title).toBe('Giant Swarm');
  });

  it(`handles title changes`, () => {
    const titles = ['Test title 1', 'Test title 2'];

    const { rerender } = renderWithProps({ title: titles[0] });

    expect(document.title).toBe(titles[0]);

    rerender(
      getComponent({
        title: titles[1],
      })
    );

    expect(document.title).toBe(titles[1]);
  });

  it(`resets to previous title after unmount`, () => {
    const { unmount } = renderWithProps({ title: 'Test title' });

    unmount();

    expect(document.title).toBe(initialTitle);
  });
});
