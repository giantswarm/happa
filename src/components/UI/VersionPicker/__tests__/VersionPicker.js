import '@testing-library/jest-dom/extend-expect';

import { fireEvent, render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import theme from 'styles/theme';
import AppVersionPicker from 'UI/VersionPicker/VersionPicker';

it('renders without crashing', () => {
  render(
    <ThemeProvider theme={theme}>
      <AppVersionPicker />
    </ThemeProvider>
  );
});

it('lists all non test versions by default', () => {
  const { getByText, queryByText } = render(
    <ThemeProvider theme={theme}>
      <AppVersionPicker
        versions={[
          { version: '1.0.5', test: false },
          { version: '1.0.4-test', test: true },
          { version: '1.0.3', test: false },
        ]}
      />
    </ThemeProvider>
  );

  expect(getByText('1.0.5')).toBeInTheDocument();
  expect(getByText('1.0.3')).toBeInTheDocument();
  expect(queryByText('1.0.4-test')).not.toBeInTheDocument();
});

it('lets me click a toggle switch to show test versions', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <AppVersionPicker
        versions={[
          { version: '1.0.5', test: false },
          { version: '1.0.4-test', test: true },
          { version: '1.0.3', test: false },
        ]}
      />
    </ThemeProvider>
  );

  fireEvent.click(getByText('Include test versions'));

  expect(getByText('1.0.5')).toBeInTheDocument();
  expect(getByText('1.0.3')).toBeInTheDocument();
  expect(getByText('1.0.4-test')).toBeInTheDocument();
});

it('the selectedVersion gets highlighted', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <AppVersionPicker
        selectedVersion='1.0.5'
        versions={[
          { version: '1.0.5', test: false },
          { version: '1.0.4-test', test: true },
          { version: '1.0.3', test: false },
        ]}
      />
    </ThemeProvider>
  );

  expect(getByText('1.0.5').classList.contains('selected')).toBe(true);
  expect(getByText('1.0.3').classList.contains('selected')).toBe(false);
});

it('clicking a version calls the onChange prop', () => {
  const mockCallback = jest.fn(x => `Got version: ${x}`);

  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <AppVersionPicker
        onChange={mockCallback}
        selectedVersion='1.0.5'
        versions={[
          { version: '1.0.5', test: false },
          { version: '1.0.4-test', test: true },
          { version: '1.0.3', test: false },
        ]}
      />
    </ThemeProvider>
  );

  fireEvent.click(getByText('1.0.5'));

  expect(mockCallback.mock.calls.length).toBe(1);
  expect(mockCallback.mock.results[0].value).toBe('Got version: 1.0.5');

  fireEvent.click(getByText('1.0.3'));

  expect(mockCallback.mock.results[1].value).toBe('Got version: 1.0.3');
});
