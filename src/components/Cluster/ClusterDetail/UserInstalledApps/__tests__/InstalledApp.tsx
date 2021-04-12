import { renderWithTheme } from 'testUtils/renderUtils';

import InstalledApp from '../InstalledApp';

describe('InstalledApp', () => {
  it('renders without crashing', () => {
    renderWithTheme(InstalledApp, {
      app: {
        metadata: {
          name: 'app-name',
        },
      },
      onIconError: jest.fn(),
      onClick: jest.fn(),
    } as React.ComponentPropsWithoutRef<typeof InstalledApp>);
  });
});
