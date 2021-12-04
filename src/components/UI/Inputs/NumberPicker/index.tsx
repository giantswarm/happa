import { ThemeContext, ThemeType } from 'grommet';
import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import usePrevious from 'utils/hooks/usePrevious';

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

const customTheme: ThemeType = {
  formField: {
    extend: css`
      & > div {
        position: relative;
      }
    `,
  },
};

const StyledTextInput = styled(TextInput)`
  text-align: center;
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

const Controls = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 1;
  border-radius: 4px;
  overflow: hidden;
`;

const IncrementDecrementButton = styled.div`
  position: relative;
  width: 35px;
  height: 100%;
  background-color: ${({ theme }) => theme.global.colors.border.dark};
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;

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

interface INumberPickerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TextInput>, 'onChange'> {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (patch: { value: number; valid: boolean }) => void;
}

/**
 * A component that allows a user to pick a number by
 * incrementing / decrementing a value or typing it
 * straight into the input field.
 */
const NumberPicker = React.forwardRef<HTMLInputElement, INumberPickerProps>(
  (
    { value, min, max, step, readOnly, disabled, onChange, children, ...props },
    ref
  ) => {
    const [currValue, setCurrValue] = useState<number>(value!);
    const [validationError, setValidationError] = useState('');

    const inputValue = Number.isNaN(currValue) ? '' : currValue;

    const prevMin = usePrevious(min);
    const prevMax = usePrevious(max);

    const editable = !readOnly && !disabled;

    const updateValue = useCallback(
      (newValue: number, error: string = '') => {
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
        case !allowInvalidValues &&
          typeof min !== 'undefined' &&
          newValue < min:
          newValue = min!;
          break;
        case !allowInvalidValues &&
          typeof max !== 'undefined' &&
          newValue > max:
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
      if ((prevMax && prevMax !== max) || (prevMin && prevMin !== min)) {
        const error = validateInput(currValue, min, max);
        updateValue(currValue, error);
      }
    }, [min, max, prevMin, prevMax, currValue, updateValue]);

    return (
      <ThemeContext.Extend value={customTheme}>
        <StyledTextInput
          readOnly={readOnly}
          disabled={disabled}
          onChange={(e) => updateInput(e.target.valueAsNumber, true)}
          onFocus={handleFocus}
          step={step}
          type='number'
          value={inputValue}
          error={validationError}
          {...props}
          ref={ref}
        >
          {editable && (
            <Controls>
              <IncrementDecrementButton
                className={currValue === min ? 'disabled' : undefined}
                onClick={decrement}
                aria-label='Decrement'
                role='button'
              >
                &ndash;
              </IncrementDecrementButton>
              <IncrementDecrementButton
                className={currValue === max ? 'disabled' : undefined}
                onClick={increment}
                aria-label='Increment'
                role='button'
              >
                +
              </IncrementDecrementButton>
            </Controls>
          )}
          {children}
        </StyledTextInput>
      </ThemeContext.Extend>
    );
  }
);

NumberPicker.defaultProps = {
  value: 0,
  step: 1,
};

export default NumberPicker;
