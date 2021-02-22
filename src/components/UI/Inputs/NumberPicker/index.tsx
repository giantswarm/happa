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
    case max && desiredValue > max:
      return `Value must not be larger than ${max}`;
    case min && desiredValue < min:
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
  border-radius: 4px;
  position: relative;
`;

const IncrementDecrementButtonCSS = css`
  position: absolute;
  top: 1px;
  width: 35px;
  height: calc(100% - 2px);
  background-color: #3b5f7b;
  user-select: none;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #486d8a;
  }

  &:active {
    background-color: #3b5f7b;
    color: #aaa;
  }

  &.disabled,
  &.disabled:hover,
  &.disabled:active {
    background-color: #567;
    color: #eee;
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
  theme?: string;
  readOnly?: boolean;
  onChange?: (patch: { value: number; valid: boolean }) => void;
  stepSize?: number;
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
  theme,
  readOnly,
  onChange,
  value,
  stepSize,
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
      case !allowInvalidValues && min && newValue < min:
        newValue = min!;
        break;
      case !allowInvalidValues && max && newValue > max:
        newValue = max!;
        break;
    }

    updateValue(newValue, error);
  };

  const increment = () => {
    const desiredValue = currValue + stepSize!;

    updateInput(desiredValue);
  };

  const decrement = () => {
    const desiredValue = currValue - stepSize!;

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
    <Wrapper className={`${className ?? ''} ${theme ?? ''}`}>
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
          disabled={readOnly}
          onChange={(e) => updateInput(e.target.valueAsNumber, true)}
          onFocus={handleFocus}
          step={stepSize}
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
  stepSize: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  theme: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
};

NumberPicker.defaultProps = {
  value: 0,
  stepSize: 1,
  min: 0,
  max: 999,
};

export default NumberPicker;
