import '@testing-library/jest-dom/extend-expect';

import { fireEvent, within } from '@testing-library/react';
import { renderWithTheme } from 'test/renderUtils';
import AppVersionPicker from 'UI/Controls/VersionPicker/VersionPicker';

it('renders without crashing', () => {
  renderWithTheme(AppVersionPicker, { selectedVersion: '1' });
});

it('lists all non test versions by default', () => {
  const { getByText, getByTestId } = renderWithTheme(AppVersionPicker, {
    selectedVersion: '1.0.5',
    versions: [
      { chartVersion: '1.0.5', test: false },
      { chartVersion: '1.0.4-test', test: true },
      { chartVersion: '1.0.3', test: false },
    ],
  });

  fireEvent.click(getByText('1.0.5'));

  const menu = getByTestId('menu');

  expect(within(menu).getByText('1.0.5')).toBeInTheDocument();
  expect(within(menu).getByText('1.0.3')).toBeInTheDocument();
  expect(within(menu).queryByText('1.0.4-test')).not.toBeInTheDocument();
});

it('lets me click a toggle switch to show test versions', () => {
  const { getByText, getByTestId } = renderWithTheme(AppVersionPicker, {
    selectedVersion: '1.0.5',
    versions: [
      { chartVersion: '1.0.5', test: false },
      { chartVersion: '1.0.4-test', test: true },
      { chartVersion: '1.0.3', test: false },
    ],
  });

  fireEvent.click(getByText('1.0.5'));
  fireEvent.click(getByText('Include test versions'));

  const menu = getByTestId('menu');

  expect(within(menu).getByText('1.0.5')).toBeInTheDocument();
  expect(within(menu).getByText('1.0.3')).toBeInTheDocument();
  expect(within(menu).getByText('1.0.4-test')).toBeInTheDocument();
});

it('clicking a version calls the onChange prop', () => {
  const mockCallback = jest.fn((x) => `Got version: ${x}`);

  const { getByText, getByTestId } = renderWithTheme(AppVersionPicker, {
    onChange: mockCallback,
    selectedVersion: '1.0.5',
    versions: [
      { chartVersion: '1.0.5', test: false },
      { chartVersion: '1.0.4-test', test: true },
      { chartVersion: '1.0.3', test: false },
    ],
  });

  fireEvent.click(getByText('1.0.5'));

  const menu = getByTestId('menu');

  fireEvent.click(within(menu).getByText('1.0.5'));

  expect(mockCallback.mock.calls.length).toBe(1);
  expect(mockCallback.mock.results[0].value).toBe('Got version: 1.0.5');

  fireEvent.click(within(menu).getByText('1.0.3'));

  expect(mockCallback.mock.results[1].value).toBe('Got version: 1.0.3');
});
