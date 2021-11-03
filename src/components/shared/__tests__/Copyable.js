import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render, waitFor } from '@testing-library/react';
import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import { getComponentWithTheme } from 'testUtils/renderUtils';

import Copyable from '../Copyable';

jest.mock('lib/hooks/useCopyToClipboard');

let setClipboardContentMockFn = null;

const getComponentWithProps = (props = {}) =>
  getComponentWithTheme(Copyable, props);
const renderWithProps = (props = {}) => render(getComponentWithProps(props));

describe('Copyable', () => {
  beforeEach(() => {
    useCopyToClipboard.mockClear();

    setClipboardContentMockFn = jest.fn();
    useCopyToClipboard.mockReturnValueOnce([false, setClipboardContentMockFn]);
  });

  it('renders without crashing', () => {
    renderWithProps();
  });

  it('accepts content and renders it', () => {
    const content = 'This is a test';
    const { getByText } = renderWithProps({ children: content });

    expect(getByText(content)).toBeInTheDocument();
  });

  it('copies content to clipboard after pressing the copy button', async () => {
    const content = 'This is a test';
    const componentProps = {
      children: content,
      copyText: content,
    };
    const { getByTitle, queryByText, rerender } =
      renderWithProps(componentProps);

    const copyButton = getByTitle(/copy content to clipboard/i);
    expect(copyButton).toBeInTheDocument();
    fireEvent.mouseOver(copyButton);
    fireEvent.click(copyButton);

    expect(setClipboardContentMockFn).toBeCalledWith(content);

    // Check if moving the cursor from the
    // button resets the clipboard content
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

    // Check if the copy confirmation is no longer visible
    await waitFor(() => {
      expect(
        queryByText(/content copied to clipboard/i)
      ).not.toBeInTheDocument();
    });
  });
});
