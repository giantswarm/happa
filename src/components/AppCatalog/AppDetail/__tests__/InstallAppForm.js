import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import React from 'react';
import theme from 'styles/theme';

import InstallAppForm from '../InstallAppForm';

it('renders without crashing', () => {
  render(
    <ThemeProvider theme={theme}>
      <InstallAppForm />
    </ThemeProvider>
  );
});

it('renders a normal namespace field usually', () => {
  const { getByLabelText } = render(
    <ThemeProvider theme={theme}>
      <InstallAppForm />
    </ThemeProvider>
  );

  const namespaceField = getByLabelText('Namespace:');
  expect(namespaceField).not.toHaveAttribute('read-only');
});

it('renders a readonly namespace field for nginx-ingress-controller-app', () => {
  const { getByLabelText } = render(
    <ThemeProvider theme={theme}>
      <InstallAppForm appName='nginx-ingress-controller-app' />
    </ThemeProvider>
  );

  const namespaceField = getByLabelText('Namespace:');
  expect(namespaceField).toHaveAttribute('readOnly');
});
