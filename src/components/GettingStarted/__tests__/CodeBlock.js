import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render, wait } from '@testing-library/react';
import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import React from 'react';
import { getComponentWithTheme } from 'testUtils/renderUtils';

import { CodeBlock, Output, Prompt } from '../CodeBlock';

jest.mock('lib/effects/useCopyToClipboard');

let setClipboardContentMockFn = null;

const getComponentWithProps = (props = {}) =>
  getComponentWithTheme(CodeBlock, props);
const renderWithProps = (props = {}) => render(getComponentWithProps(props));

describe('CodeBlock', () => {
  beforeEach(() => {
    useCopyToClipboard.mockClear();

    setClipboardContentMockFn = jest.fn();
    useCopyToClipboard.mockReturnValueOnce([false, setClipboardContentMockFn]);
  });

  it('renders without crashing', () => {
    renderWithProps();
  });

  it('accepts a command and its output and renders them', () => {
    const command = 'testcommand run test';
    const commandOutput = 'What did you expect to happen?';
    const { getByText } = renderWithProps({
      children: (
        <>
          <Prompt>{command}</Prompt>
          <Output>{commandOutput}</Output>
        </>
      ),
    });

    expect(getByText('$')).toBeInTheDocument();
    expect(getByText(command)).toBeInTheDocument();
  });

  it('copies content to clipboard after pressing the copy button', async () => {
    const command = 'testcommand run test';
    const componentProps = {
      /**
       * Need to use an array since fragments get treated as
       * a regular element, and CodeBlock no longer finds
       * the Prompt component
       */
      children: [
        <Prompt key='1'>{command}</Prompt>,
        <Output key='2'>What did you expect to happen?</Output>,
      ],
    };
    const { getByTitle, findByTitle, queryByText, rerender } = renderWithProps(
      componentProps
    );

    const copyButton = getByTitle(/copy content to clipboard/i);
    expect(copyButton).toBeInTheDocument();
    fireEvent.mouseUp(copyButton);

    expect(setClipboardContentMockFn).toBeCalledWith(command);

    /**
     * Check if finishing the click event on the
     * button resets the clipboard value
     */
    fireEvent.click(copyButton);
    expect(setClipboardContentMockFn).toBeCalledWith(null);

    // Set content in clipboard
    useCopyToClipboard.mockReturnValueOnce([true, setClipboardContentMockFn]);
    rerender(getComponentWithProps(componentProps));

    // Check if validation is in the document
    const copyConfirmationLabel = await findByTitle(
      /content copied to clipboard/i
    );
    expect(copyConfirmationLabel).toBeInTheDocument();

    // Reset content in clipboard
    useCopyToClipboard.mockReturnValueOnce([false, setClipboardContentMockFn]);
    rerender(getComponentWithProps(componentProps));

    // Check if the copy confirmation is no longer visible
    await wait(() => {
      expect(
        queryByText(/content copied to clipboard/i)
      ).not.toBeInTheDocument();
    });
  });
});
