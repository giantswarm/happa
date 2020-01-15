import '@testing-library/jest-dom/extend-expect';

import { renderWithTheme } from 'testUtils/renderUtils';

import InstallAppForm from '../InstallAppForm';

it('renders without crashing', () => {
  renderWithTheme(InstallAppForm);
});

it('renders a normal namespace field usually', () => {
  const { getByLabelText } = renderWithTheme(InstallAppForm);

  const namespaceField = getByLabelText('Namespace:');
  expect(namespaceField).not.toHaveAttribute('read-only');
});

it('renders a readonly namespace field for nginx-ingress-controller-app', () => {
  const { getByLabelText } = renderWithTheme(InstallAppForm, {
    appName: 'nginx-ingress-controller-app',
  });

  const namespaceField = getByLabelText('Namespace:');
  expect(namespaceField).toHaveAttribute('readOnly');
});
