import { fireEvent, screen } from '@testing-library/react';
import { renderWithTheme } from 'test/renderUtils';

import CurrencyInput from '..';

describe('CurrencyInput', () => {
  it('renders without crashing', () => {
    const { container } = renderWithTheme(CurrencyInput, {});
    expect(container.firstChild).toMatchSnapshot();
  });

  it('only allows base 10 number values', () => {
    const onChangeMockFn = jest.fn();
    renderWithTheme(CurrencyInput, {
      onChange: onChangeMockFn,
      id: 'test-input',
      label: 'Test input',
    });

    const input = screen.getByLabelText('Test input') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        value: '35',
      },
    });
    // eslint-disable-next-line no-magic-numbers
    expect(onChangeMockFn).toBeCalledWith(35);

    fireEvent.change(input, {
      target: {
        value: 'asd3f',
      },
    });
    // eslint-disable-next-line no-magic-numbers
    expect(onChangeMockFn).toBeCalledWith(0);

    fireEvent.change(input, {
      target: {
        value: '0xff35dd',
      },
    });
    // eslint-disable-next-line no-magic-numbers
    expect(onChangeMockFn).toBeCalledWith(0);
  });

  it('allows setting the number precision, for handling float values', () => {
    const onChangeMockFn = jest.fn();
    renderWithTheme(CurrencyInput, {
      onChange: onChangeMockFn,
      id: 'test-input',
      label: 'Test input',
      precision: 5,
      value: 13.12312031,
    });

    const input = screen.getByLabelText('Test input') as HTMLInputElement;

    expect(input.value).toBe('13.12312');
    // eslint-disable-next-line no-magic-numbers
    expect(input.valueAsNumber).toBe(13.12312);

    fireEvent.change(input, {
      target: {
        value: '25.1679850404500004',
      },
    });
    // eslint-disable-next-line no-magic-numbers
    expect(onChangeMockFn).toBeCalledWith(25.16799);
  });

  it('respects value constraints', () => {
    const onChangeMockFn = jest.fn();
    renderWithTheme(CurrencyInput, {
      onChange: onChangeMockFn,
      id: 'test-input',
      label: 'Test input',
      min: 1,
      max: 10,
    });

    const input = screen.getByLabelText('Test input') as HTMLInputElement;

    fireEvent.change(input, {
      target: {
        value: '-10',
      },
    });
    // eslint-disable-next-line no-magic-numbers
    expect(onChangeMockFn).toBeCalledWith(1);

    fireEvent.change(input, {
      target: {
        value: '20',
      },
    });
    // eslint-disable-next-line no-magic-numbers
    expect(onChangeMockFn).toBeCalledWith(10);

    fireEvent.change(input, {
      target: {
        value: '1',
      },
    });
    expect(onChangeMockFn).toBeCalledWith(1);
  });

  it('allows displaying a validation error', () => {
    const onChangeMockFn = jest.fn();
    renderWithTheme(CurrencyInput, {
      onChange: onChangeMockFn,
      id: 'test-input',
      label: 'Test input',
      value: 1,
      error: 'Naah. Wrong value',
    });

    expect(screen.getByText('Naah. Wrong value')).toBeInTheDocument();
  });
});
