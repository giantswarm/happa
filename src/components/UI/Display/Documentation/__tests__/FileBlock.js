import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render } from '@testing-library/react';
import useCopyToClipboard from 'lib/hooks/useCopyToClipboard';
import { getComponentWithTheme } from 'test/renderUtils';

import FileBlock from '../FileBlock';

jest.mock('lib/hooks/useCopyToClipboard');
global.URL.createObjectURL = jest.fn();

const testContent = 'This is a test';
let setClipboardContentMockFn = null;

const getComponentWithProps = (props = {}) => {
  const propsWithDefaults = Object.assign({}, { children: testContent }, props);

  return getComponentWithTheme(FileBlock, propsWithDefaults);
};
const renderWithProps = (props = {}) => render(getComponentWithProps(props));

describe('FileBlock', () => {
  beforeEach(() => {
    useCopyToClipboard.mockClear();
    global.URL.createObjectURL.mockClear();

    setClipboardContentMockFn = jest.fn();
    useCopyToClipboard.mockReturnValueOnce([false, setClipboardContentMockFn]);
  });

  it('renders without crashing', () => {
    renderWithProps();
  });

  it('renders the content and the filename', () => {
    const fileName = 'Test filename';
    const { getByText } = renderWithProps({ fileName });

    expect(getByText(fileName)).toBeInTheDocument();
    expect(getByText(testContent)).toBeInTheDocument();
  });

  it('downloads file after pressing on the download button', () => {
    const { getByTitle } = renderWithProps();

    const downloadButton = getByTitle(/download file/i);
    const expectedFileBlob = new Blob([testContent], {
      type: 'application/plain;charset=utf-8',
    });

    fireEvent.click(downloadButton);

    expect(global.URL.createObjectURL).toBeCalledWith(expectedFileBlob);
  });

  it('copies the command to clipboard after pressing the copy button', async () => {
    const { getByText, getByTitle, findByTitle, rerender } = renderWithProps();

    // Check if content is displayed
    expect(getByText(testContent)).toBeInTheDocument();

    const copyButton = getByTitle(/copy content to clipboard/i);
    expect(copyButton).toBeInTheDocument();
    fireEvent.mouseUp(copyButton);

    // Check if it copied the right content
    expect(setClipboardContentMockFn).toBeCalledWith(testContent);

    // Check if it tries to reset the clipboard after copying
    fireEvent.click(copyButton);
    expect(setClipboardContentMockFn).toBeCalledWith(null);

    // Set content in clipboard
    useCopyToClipboard.mockReturnValueOnce([true, setClipboardContentMockFn]);
    rerender(getComponentWithProps());

    // Check if validation is in the document
    const copyConfirmationLabel = await findByTitle(
      /content copied to clipboard/i
    );
    expect(copyConfirmationLabel).toBeInTheDocument();
  });

  it(`has the content hidden if it's desired`, () => {
    const { queryByText } = renderWithProps({
      hideText: true,
    });

    // Check if content is hidden
    expect(queryByText(testContent)).not.toBeInTheDocument();
  });
});
