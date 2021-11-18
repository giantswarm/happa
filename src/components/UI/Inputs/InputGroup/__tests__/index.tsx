import { renderWithTheme } from 'test/renderUtils';

import InputGroup from '..';

describe('InputGroup', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(InputGroup, {
      label: 'A nice group of inputs',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
