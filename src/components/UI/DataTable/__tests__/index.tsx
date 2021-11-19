import { renderWithTheme } from 'test/renderUtils';

import { Simple } from '../stories/Simple';

describe('DataTable', () => {
  it('renders a simple table', () => {
    const { container } = renderWithTheme(Simple, {});
    expect(container.firstChild).toMatchSnapshot();
  });
});
