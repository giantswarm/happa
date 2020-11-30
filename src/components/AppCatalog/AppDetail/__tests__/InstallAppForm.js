import '@testing-library/jest-dom/extend-expect';

import { renderWithTheme } from 'testUtils/renderUtils';

import InstallAppForm from '../InstallAppForm';

it('renders without crashing', () => {
  renderWithTheme(InstallAppForm, { version: '1' });
});

it('renders a normal namespace field usually', () => {
  const { getByLabelText } = renderWithTheme(InstallAppForm, { version: '1' });

  const namespaceField = getByLabelText('Namespace:');
  expect(namespaceField).not.toHaveAttribute('read-only');
});

it('use kube-system as default namespace for nginx-ingress-controller-app', () => {
  const onChangeNamespaceMock = jest.fn();

  renderWithTheme(InstallAppForm, {
    appName: 'nginx-ingress-controller-app',
    version: '1',
    onChangeNamespace: onChangeNamespaceMock,
  });

  expect(onChangeNamespaceMock).toHaveBeenCalledWith('kube-system');
});
