import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailAppStatus from '..';

describe('ClusterDetailAppStatus', () => {
  it('renders an app status', () => {
    const { container } = renderWithTheme(ClusterDetailAppStatus, {
      status: 'some-status',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
