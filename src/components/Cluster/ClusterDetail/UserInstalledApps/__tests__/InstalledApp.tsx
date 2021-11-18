import { renderWithTheme } from 'test/renderUtils';

import InstalledApp from '../InstalledApp';

describe('InstalledApp', () => {
  it('renders without crashing', () => {
    renderWithTheme(InstalledApp, {
      name: 'app-name',
      version: '',
      onIconError: jest.fn(),
      onClick: jest.fn(),
    } as React.ComponentPropsWithoutRef<typeof InstalledApp>);
  });
});
