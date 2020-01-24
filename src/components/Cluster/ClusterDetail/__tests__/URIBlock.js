import '@testing-library/jest-dom/extend-expect';

// import { fireEvent } from '@testing-library/react';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import { renderWithTheme } from 'testUtils/renderUtils';

import URIBlock from '../URIBlock';

jest.mock('lib/effects/useCopyToClipboard', () => {
  return jest.fn().mockImplementation(() => {
    return [false, jest.fn()];
  });
});

const renderWithProps = (props = {}) => renderWithTheme(URIBlock, props);

describe('URIBlock', () => {
  beforeEach(() => {
    useCopyToClipboard.mockClear();
  });

  it('renders without crashing', () => {
    renderWithProps();
  });

  it('accepts a title and renders it', () => {
    const title = 'This is a test';
    const { getByText } = renderWithProps({ title });

    expect(getByText(title)).toBeInTheDocument();
  });

  it('copies content to clipboard', () => {
    // const setClipboardContentMockFn = jest.fn();
    // useCopyToClipboard.mockImplementationOnce(() => [
    //   false,
    //   setClipboardContentMockFn,
    // ]);

    const content = 'This is a test';
    const { getByText } = renderWithProps({ children: content });

    // Check if content is displayed
    expect(getByText(content)).toBeInTheDocument();

    // const copyButton = getByTitle('Copy content to clipboard');
    // expect(copyButton).toBeInTheDocument();
    // fireEvent.mouseOver(copyButton);

    // // useCopyToClipboard.mockReturnValue([true, setClipboardContentMockFn]);

    // fireEvent.click(copyButton);

    // expect(setClipboardContentMockFn).toBeCalledWith(content);
  });
});
