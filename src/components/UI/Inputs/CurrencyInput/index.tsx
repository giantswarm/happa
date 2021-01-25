import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';

import { InputElement } from '../Input';

const InputWrapper = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.darkBlueLighter1};
  border-radius: ${({ theme }) => theme.border_radius};
  color: ${(props) => props.theme.colors.whiteInput};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StyledInput = styled(InputElement)`
  border-radius: ${({ theme }) => theme.border_radius};
  border: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
`;

const CurrencyLabel = styled.div`
  color: ${(props) => props.theme.colors.whiteInput};
  background: ${({ theme }) => theme.colors.darkBlueLighter1};
  color: ${({ theme }) => theme.colors.white5};
  padding: 8px 10px;
  line-height: 1;
`;

const LabelText = styled.label`
  font-size: 14px;
  color: ${(props) => props.theme.colors.white2};
`;

interface ICurrencyInputProps
  extends Omit<
    React.ComponentPropsWithRef<'input'>,
    'type' | 'onChange' | 'step'
  > {
  currencyLabel?: string;
  precision?: number;
  value?: number;
  label?: string;
  min?: number;
  max?: number;
  labelTextProps?: React.ComponentPropsWithRef<'label'>;
  rootProps?: Omit<React.ComponentPropsWithRef<'div'>, 'htmlFor'>;
  onChange?: (newValue: number) => void;
}

const CurrencyInput: React.FC<ICurrencyInputProps> = ({
  currencyLabel,
  precision,
  label,
  labelTextProps,
  rootProps,
  value,
  id,
  min,
  max,
  onChange,
  ...rest
}) => {
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
    <div {...rootProps}>
      {label && (
        <LabelText {...labelTextProps} htmlFor={id}>
          {label}
        </LabelText>
      )}
      <InputWrapper>
        <CurrencyLabel>{currencyLabel}</CurrencyLabel>
        <StyledInput
          {...rest}
          id={id}
          value={visibleValue}
          type='number'
          step={step}
          onChange={handleChange}
          min={min}
          max={max}
        />
      </InputWrapper>
    </div>
  );
};

CurrencyInput.propTypes = {
  /**
   * Define a currency to be displayed in the
   * left side of the input.
   */
  currencyLabel: PropTypes.string,
  /**
   * The number of decimal places allowed.
   */
  precision: PropTypes.number,
  /**
   * The controlled value of the input.
   */
  value: PropTypes.number,
  /**
   * The unique identifier of the input.
   */
  id: PropTypes.string,
  /**
   * The label displayed above the input.
   */
  label: PropTypes.string,
  /**
   * The minimum allowed value.
   */
  min: PropTypes.number,
  /**
   * The maximum allowed value
   */
  max: PropTypes.number,
  /**
   * Props to be passed to the label element.
   */
  labelTextProps: PropTypes.object,
  /**
   * Props to be passed to the root element.
   */
  rootProps: PropTypes.object,
  /**
   * The value change event handler.
   */
  onChange: PropTypes.func,
};

CurrencyInput.defaultProps = {
  currencyLabel: '$',
  precision: 0,
};

export default CurrencyInput;

function formatNumberWithPrecision(num: number, precision: number): number {
  if (Number.isNaN(num)) {
    return 0;
  }

  // eslint-disable-next-line no-magic-numbers
  const precisionFactor = 10 ** precision;

  return Math.floor(num * precisionFactor) / precisionFactor;
}
