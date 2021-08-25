import { Text } from 'grommet';
import * as React from 'react';

import TextInput from '../TextInput';

function formatNumberWithPrecision(num: number, precision: number): number {
  if (Number.isNaN(num)) {
    return 0;
  }

  // eslint-disable-next-line no-magic-numbers
  const precisionFactor = 10 ** precision;

  return Math.round(num * precisionFactor) / precisionFactor;
}

interface ICurrencyInputProps
  extends Omit<
    React.ComponentPropsWithRef<typeof TextInput>,
    'type' | 'onChange' | 'step'
  > {
  /**
   * Define a currency to be displayed in the
   * left side of the input.
   */
  currencyLabel?: string;
  /**
   * The number of decimal places allowed.
   */
  precision?: number;
  /**
   * The controlled value of the input.
   */
  value?: number;
  /**
   * The minimum allowed value.
   */
  min?: number;
  /**
   * The maximum allowed value
   */
  max?: number;
  /**
   * The value change event handler.
   */
  onChange?: (newValue: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, ICurrencyInputProps>(
  (
    { currencyLabel, precision, value, min, max, onChange, disabled, ...props },
    ref
  ) => {
    // eslint-disable-next-line no-magic-numbers
    const step = 1 / 10 ** precision!;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let valueConvertedToPrecision = formatNumberWithPrecision(
        e.target.valueAsNumber,
        precision!
      );

      if (min) {
        valueConvertedToPrecision = Math.max(valueConvertedToPrecision, min);
      }
      if (max) {
        valueConvertedToPrecision = Math.min(valueConvertedToPrecision, max);
      }

      onChange?.(valueConvertedToPrecision);
    };

    const visibleValue = formatNumberWithPrecision(value ?? 0, precision!);

    return (
      <TextInput
        icon={
          <Text color={disabled ? 'text-xweak' : 'text-weak'}>
            {currencyLabel}
          </Text>
        }
        value={visibleValue}
        type='number'
        step={step}
        onChange={handleChange}
        min={min}
        max={max}
        disabled={disabled}
        {...props}
        ref={ref}
      />
    );
  }
);

CurrencyInput.defaultProps = {
  currencyLabel: '$',
  precision: 0,
};

export default CurrencyInput;
