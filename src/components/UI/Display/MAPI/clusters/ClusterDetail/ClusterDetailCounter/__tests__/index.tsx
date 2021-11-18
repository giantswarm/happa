import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailCounter from '..';

describe('ClusterDetailCounter', () => {
  it('renders a simple counter', () => {
    const { container } = renderWithTheme(ClusterDetailCounter, {
      label: 'dog',
      value: 1,
    });
    expect(container.firstChild).toMatchSnapshot();
  });

  it('renders a counter with a pluralized label', () => {
    const { container } = renderWithTheme(ClusterDetailCounter, {
      label: 'dog',
      value: 35,
      pluralize: true,
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
