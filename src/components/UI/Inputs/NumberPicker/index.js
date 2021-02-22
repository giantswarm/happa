import usePrevious from 'lib/hooks/usePrevious';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { css } from 'styled-components';
import styled from 'styled-components';
import ValidationErrorMessage from 'UI/Inputs/ValidationErrorMessage';
import { mergeActionNames } from 'utils/realUserMonitoringUtils';

import TextInput from '../TextInput';

function validateInput(desiredValue, min, max) {
  if (desiredValue === '') {
    return {
      value: null,
      validationError: 'Field must not be empty',
    };
  } else if (max && desiredValue > max) {
    return {
      value: parseInt(desiredValue),
      validationError: `Value must not be larger than ${max}`,
    };
  } else if (min && desiredValue < min) {
    return {
      value: parseInt(desiredValue),
      validationError: `Value must not be smaller than ${min}`,
    };
  } else if (!isWholeNumber(parseFloat(desiredValue))) {
    return {
      value: parseInt(desiredValue),
      validationError: 'Value must be a whole number',
    };
  }

  return {
    value: parseInt(desiredValue),
    validationError: '',
  };
}

function isWholeNumber(value) {
  if (typeof value === 'number' && value % 1 === 0) {
    return true;
  }

  return false;
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

/**
 * A component that allows a user to pick a number by
 * incrementing / decrementing a value or typing it
 * straight into the input field.
 */
const NumberPicker = ({
  min,
  max,
  label,
  className,
  theme,
  readOnly,
  eventNameSuffix,
  onChange,
  value: startValue,
  stepSize,
  title,
}) => {
  const [inputValue, setInputValue] = useState(startValue);
  const [value, setValue] = useState(startValue);
  const [validationError, setValidationError] = useState('');

  const prevMin = usePrevious(min);
  const prevMax = usePrevious(max);

  const updateValue = useCallback(
    (newValue, valid = false, error = '') => {
      setInputValue(newValue);
      setValue(newValue);
      setValidationError(error);

      onChange?.({
        value: newValue,
        valid: valid,
      });
    },
    [onChange]
  );

  const updateInput = (desiredValue, allowInvalidValues = false) => {
    const result = validateInput(desiredValue, min, max);

    // Ensure values are never above max or below min. They can be null.
    switch (true) {
      case result.value === null:
        result.value = '';
        break;
      case !allowInvalidValues && result.value < min:
        result.value = min;
        break;
      case !allowInvalidValues && result.value > max:
        result.value = max;
        break;
    }

    const valid =
      result.validationError.length < 1 || (min <= 0 && result.value === 0);

    updateValue(result.value, valid, result.validationError);
  };

  const increment = () => {
    const desiredValue = value + stepSize;

    updateInput(desiredValue);
  };

  const decrement = () => {
    const desiredValue = value - stepSize;

    updateInput(desiredValue);
  };

  const handleFocus = (event) => {
    event.target.select();
  };

  useEffect(() => {
    if (prevMax !== max || prevMin !== min) {
      const result = validateInput(value, min, max);
      const valid = result.validationError.length < 1;
      updateValue(result.value, valid, result.validationError);
    }
  }, [min, max, prevMin, prevMax, value, updateValue]);

  return (
    <Wrapper className={`${className ?? ''} ${theme ?? ''}`}>
      {label && <Label>{label}</Label>}

      <Control>
        {!readOnly && (
          <RUMActionTarget
            name={mergeActionNames(RUMActions.DecrementNumber, eventNameSuffix)}
          >
            <DecrementButton
              className={inputValue === min && 'disabled'}
              onClick={decrement}
              aria-label='Decrement'
              role='button'
            >
              &ndash;
            </DecrementButton>
          </RUMActionTarget>
        )}

        <StyledTextInput
          disabled={readOnly}
          onChange={(e) => updateInput(e.target.value, true)}
          onFocus={handleFocus}
          step={stepSize}
          type='number'
          value={readOnly ? value : inputValue}
          title={title}
        />

        {!readOnly && (
          <RUMActionTarget
            name={mergeActionNames(RUMActions.IncrementNumber, eventNameSuffix)}
          >
            <IncrementButton
              className={value === max && 'disabled'}
              onClick={increment}
              aria-label='Increment'
              role='button'
            >
              +
            </IncrementButton>
          </RUMActionTarget>
        )}
      </Control>
      <ValidationErrorMessage message={validationError} />
    </Wrapper>
  );
};

NumberPicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stepSize: PropTypes.number,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  theme: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  /** This string is appended to the user action event names recorded in Real User Monitoring. Should be UPPERCASE. */
  eventNameSuffix: PropTypes.string,
};

export default NumberPicker;
