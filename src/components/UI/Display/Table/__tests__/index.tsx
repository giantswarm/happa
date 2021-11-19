import { renderWithTheme } from 'test/renderUtils';

import { Simple } from '../stories/Simple';

describe('Table', () => {
  it('renders a simple table', () => {
    const { container } = renderWithTheme(Simple, {
      caption: 'Expenses',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
