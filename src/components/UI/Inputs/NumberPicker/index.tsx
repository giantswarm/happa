import usePrevious from 'lib/hooks/usePrevious';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { css } from 'styled-components';
import styled from 'styled-components';
import ValidationErrorMessage from 'UI/Inputs/ValidationErrorMessage';

import TextInput from '../TextInput';

function validateInput(desiredValue: number, min?: number, max?: number) {
  switch (true) {
    case Number.isNaN(desiredValue):
      return 'Field must not be empty';
    case typeof max !== 'undefined' && desiredValue > max:
      return `Value must not be larger than ${max}`;
    case typeof min !== 'undefined' && desiredValue < min:
      return `Value must not be smaller than ${min}`;
    case !isWholeNumber(desiredValue):
      return 'Value must be a whole number';
    default:
      return '';
  }
}

function isWholeNumber(value: number) {
  return value % 1 === 0;
}

const Label = styled.div``;

const StyledTextInput = styled(TextInput)`
  text-align: center;
  width: 100%;
  height: 100%;
  outline: none;
  appearance: textfield;
  --moz-appearance: textfield;

  :focus {
    outline: none;
  }

  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    display: none;
    --webkit-appearance: none;
    margin: 0;
  }
`;

const Wrapper = styled.div`
  display: inline-block;
  margin-top: 4px;
  margin-bottom: 10px;
`;

const Control = styled.div`
  width: 160px;
  text-align: center;
  position: relative;
`;

const IncrementDecrementButtonCSS = css`
  position: absolute;
  top: 1px;
  width: 35px;
  height: calc(100% - 2px);
  background-color: ${({ theme }) => theme.global.colors.border.dark};
  user-select: none;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: ${({ theme }) =>
      theme.global.colors['background-front'].dark};
  }

  &:active {
    opacity: 0.4;
  }

  &.disabled,
  &.disabled:hover,
  &.disabled:active {
    color: ${({ theme }) => theme.global.colors.text.dark};
    cursor: default;
    opacity: 0.8;

    ::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: ${({ theme }) =>
        theme.global.colors['status-disabled']};
      opacity: 0.3;
    }
  }
`;

const IncrementButton = styled.div`
  ${IncrementDecrementButtonCSS};
  right: 1px;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
`;

const DecrementButton = styled.div`
  ${IncrementDecrementButtonCSS};
  left: 1px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
`;

interface INumberPickerProps {
  value?: number;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
  readOnly?: boolean;
  onChange?: (patch: { value: number; valid: boolean }) => void;
  step?: number;
  title?: string;
}

/**
 * A component that allows a user to pick a number by
 * incrementing / decrementing a value or typing it
 * straight into the input field.
 */
const NumberPicker: React.FC<INumberPickerProps> = ({
  min,
  max,
  label,
  className,
  readOnly,
  onChange,
  value,
  step,
  title,
}) => {
  const [currValue, setCurrValue] = useState<number>(value!);
  const [validationError, setValidationError] = useState('');

  const inputValue = Number.isNaN(currValue) ? '' : currValue;

  const prevMin = usePrevious(min);
  const prevMax = usePrevious(max);

  const updateValue = useCallback(
    (newValue: number, error = '') => {
      setCurrValue(newValue);
      setValidationError(error);

      const isValid = error.length < 1;

      onChange?.({
        value: newValue,
        valid: isValid,
      });
    },
    [onChange]
  );

  const updateInput = (desiredValue: number, allowInvalidValues = false) => {
    const error = validateInput(desiredValue, min, max);
    let newValue = desiredValue;

    switch (true) {
      case !allowInvalidValues && typeof min !== 'undefined' && newValue < min:
        newValue = min!;
        break;
      case !allowInvalidValues && typeof max !== 'undefined' && newValue > max:
        newValue = max!;
        break;
    }

    updateValue(newValue, error);
  };

  const increment = () => {
    const desiredValue = currValue + step!;

    updateInput(desiredValue);
  };

  const decrement = () => {
    const desiredValue = currValue - step!;

    updateInput(desiredValue);
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  useEffect(() => {
    if (prevMax !== max || prevMin !== min) {
      const error = validateInput(currValue, min, max);
      updateValue(currValue, error);
    }
  }, [min, max, prevMin, prevMax, currValue, updateValue]);

  return (
    <Wrapper className={className}>
      {label && <Label>{label}</Label>}

      <Control>
        {!readOnly && (
          <DecrementButton
            className={currValue === min ? 'disabled' : undefined}
            onClick={decrement}
            aria-label='Decrement'
            role='button'
          >
            &ndash;
          </DecrementButton>
        )}

        <StyledTextInput
          readOnly={readOnly}
          onChange={(e) => updateInput(e.target.valueAsNumber, true)}
          onFocus={handleFocus}
          step={step}
          type='number'
          value={inputValue}
          title={title}
        />

        {!readOnly && (
          <IncrementButton
            className={currValue === max ? 'disabled' : undefined}
            onClick={increment}
            aria-label='Increment'
            role='button'
          >
            +
          </IncrementButton>
        )}
      </Control>
      <ValidationErrorMessage message={validationError} />
    </Wrapper>
  );
};

NumberPicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number,
  step: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  className: PropTypes.string,
  title: PropTypes.string,
};

NumberPicker.defaultProps = {
  value: 0,
  step: 1,
  min: 0,
  max: 999,
};

export default NumberPicker;
