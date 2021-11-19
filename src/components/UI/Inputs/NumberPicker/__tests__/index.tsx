import { renderWithTheme } from 'test/renderUtils';

import NumberPicker from '..';

describe('NumberPicker', () => {
  it('renders a simple input', () => {
    const { container } = renderWithTheme(NumberPicker, {
      value: 3,
      id: 'money',
      label: 'Count your money',
      info: 'Aha! Did not know that',
      help: 'A very helpful message',
    });
    expect(container.firstChild).toMatchSnapshot();
  });
});
