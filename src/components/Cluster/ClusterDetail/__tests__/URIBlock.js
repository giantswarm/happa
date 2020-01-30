import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render } from '@testing-library/react';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import { getComponentWithTheme } from 'testUtils/renderUtils';

import URIBlock from '../URIBlock';

jest.mock('lib/effects/useCopyToClipboard');

let setClipboardContentMockFn = null;

const getComponentWithProps = (props = {}) =>
  getComponentWithTheme(URIBlock, props);
const renderWithProps = (props = {}) => render(getComponentWithProps(props));

describe('URIBlock', () => {
  beforeEach(() => {
    useCopyToClipboard.mockClear();

    setClipboardContentMockFn = jest.fn();
    useCopyToClipboard.mockReturnValueOnce([false, setClipboardContentMockFn]);
  });

  it('renders without crashing', () => {
    renderWithProps();
  });

  it('accepts a title and renders it', () => {
    const title = 'This is a test';
    const { getByText } = renderWithProps({ title });

    expect(getByText(title)).toBeInTheDocument();
  });

  it('copies content to clipboard after pressing the copy button', () => {
    const content = 'This is a test';
    const componentProps = {
      children: content,
    };
    const { getByText, getByTitle, rerender } = renderWithProps(componentProps);

    // Check if content is displayed
    expect(getByText(content)).toBeInTheDocument();

    const copyButton = getByTitle(/copy content to clipboard/i);
    expect(copyButton).toBeInTheDocument();
    fireEvent.mouseOver(copyButton);
    fireEvent.click(copyButton);

    expect(setClipboardContentMockFn).toBeCalledWith(content);

    /**
     * Check if moving the cursor from the
     * button resets the clipboard content
     */
    fireEvent.mouseLeave(copyButton);
    expect(setClipboardContentMockFn).toBeCalledWith(null);

    // Set content in clipboard
    useCopyToClipboard.mockReturnValueOnce([true, setClipboardContentMockFn]);
    rerender(getComponentWithProps(componentProps));

    // Check if validation is in the document
    const copyConfirmationLabel = getByTitle(/content copied to clipboard/i);
    expect(copyConfirmationLabel).toBeInTheDocument();

    // Reset content in clipboard
    useCopyToClipboard.mockReturnValueOnce([false, setClipboardContentMockFn]);
    rerender(getComponentWithProps(componentProps));

    // Check if copy button is back
    expect(getByTitle(/copy content to clipboard/i)).toBeInTheDocument();
  });
});
