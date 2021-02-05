import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';

import { InputElement } from '../Input';

const InputWrapper = styled.div<{ disabled?: boolean }>`
  border: 1px solid
    ${({ theme, disabled }) =>
      disabled ? theme.colors.darkBlueLighter2 : theme.colors.darkBlueLighter1};
  border-radius: ${({ theme }) => theme.border_radius};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.gray : theme.colors.whiteInput};
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

const StyledInput = styled(InputElement)`
  border-radius: ${({ theme }) => theme.border_radius};
  border: 0;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  flex: 1 1 0;
  width: calc(100% - 36px);
  height: 32px;
`;

const CurrencyLabel = styled.div<{ disabled?: boolean }>`
  color: ${(props) => props.theme.colors.whiteInput};
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.darkBlueLighter2 : theme.colors.darkBlueLighter1};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.white3 : theme.colors.white5};
  padding: 8px 10px;
  line-height: 1rem;
  font-size: 14px;
  height: 32px;
  width: 36px;
  flex: 0 0 0;
`;

const LabelText = styled.label`
  font-size: 14px;
  color: ${(props) => props.theme.colors.white2};
`;

const ValidationError = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.colors.yellow1};
`;

interface ICurrencyInputProps
  extends Omit<
    React.ComponentPropsWithRef<'input'>,
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
   * The label displayed above the input.
   */
  label?: string;
  /**
   * The minimum allowed value.
   */
  min?: number;
  /**
   * The maximum allowed value
   */
  max?: number;
  /**
   * Props to be passed to the label element.
   */
  labelTextProps?: React.ComponentPropsWithRef<'label'>;
  /**
   * Props to be passed to the input element's parent element.
   */
  inputWrapperProps?: React.ComponentPropsWithRef<'div'>;
  /**
   * Props to be passed to the root element.
   */
  rootProps?: Omit<React.ComponentPropsWithRef<'div'>, 'htmlFor'>;
  /**
   * The value change event handler.
   */
  onChange?: (newValue: number) => void;
  /**
   * An error message to be displayed near the input.
   */
  validationError?: string;
}

const CurrencyInput: React.FC<ICurrencyInputProps> = ({
  currencyLabel,
  precision,
  label,
  labelTextProps,
  inputWrapperProps,
  rootProps,
  value,
  id,
  min,
  max,
  onChange,
  validationError,
  disabled,
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
      <InputWrapper {...inputWrapperProps} disabled={disabled}>
        <CurrencyLabel disabled={disabled}>{currencyLabel}</CurrencyLabel>
        <StyledInput
          {...rest}
          id={id}
          value={visibleValue}
          type='number'
          step={step}
          onChange={handleChange}
          min={min}
          max={max}
          disabled={disabled}
        />
      </InputWrapper>
      {validationError && (
        <ValidationError>
          <i className='fa fa-warning' /> {validationError}
        </ValidationError>
      )}
    </div>
  );
};

CurrencyInput.propTypes = {
  currencyLabel: PropTypes.string,
  precision: PropTypes.number,
  value: PropTypes.number,
  id: PropTypes.string,
  label: PropTypes.string,
  min: PropTypes.number,
  max: PropTypes.number,
  labelTextProps: PropTypes.object,
  inputWrapperProps: PropTypes.object,
  rootProps: PropTypes.object,
  onChange: PropTypes.func,
  validationError: PropTypes.string,
  disabled: PropTypes.bool,
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

  return Math.round(num * precisionFactor) / precisionFactor;
}
