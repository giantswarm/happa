import { ThemeContext, ThemeType } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled, { css } from 'styled-components';

import TextInput from '../TextInput';

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
  background-color: ${({ theme }) => normalizeColor('border', theme)};
  user-select: none;

  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;

  &:hover {
    background-color: ${({ theme }) =>
      normalizeColor('background-front', theme)};
  }

  &:active {
    opacity: 0.4;
  }

  &.disabled,
  &.disabled:hover,
  &.disabled:active {
    color: ${({ theme }) => normalizeColor('text', theme)};
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
        normalizeColor('status-disabled', theme)};
      opacity: 0.3;
    }
  }
`;

interface ISimpleNumberPickerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof TextInput>, 'onChange'> {
  value?: number;
  min?: number;
  max?: number;
  step?: number | 'any';
  onChange?: (value: number) => void;
}

/**
 * A component that allows a user to pick a number by
 * incrementing / decrementing a value or typing it
 * straight into the input field.
 *
 * Unlike NumberPicker component, it doesn't perform
 * value validation and doesn't manage it's own state.
 */
export const SimpleNumberPicker = React.forwardRef<
  HTMLInputElement,
  ISimpleNumberPickerProps
>(
  (
    {
      value = NaN,
      min,
      max,
      step,
      readOnly,
      disabled,
      onChange,
      children,
      ...props
    },
    ref
  ) => {
    const inputValue = Number.isNaN(value) ? '' : value;

    const editable = !readOnly && !disabled;

    const updateValue = (newValue: number) => {
      onChange?.(newValue);
    };

    const updateInput = (desiredValue: number, allowInvalidValues = false) => {
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

      updateValue(newValue);
    };

    const increment = () => {
      const currStep = typeof step === 'number' ? step : 1;

      if (Number.isNaN(value)) {
        updateInput(min || currStep);
      } else {
        updateInput(value + currStep);
      }
    };

    const decrement = () => {
      const currStep = typeof step === 'number' ? step : 1;

      if (Number.isNaN(value)) {
        updateInput(min || -currStep);
      } else {
        updateInput(value - currStep);
      }
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      event.target.select();
    };

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
          {...props}
          ref={ref}
        >
          {editable && (
            <Controls>
              <IncrementDecrementButton
                className={value === min ? 'disabled' : undefined}
                onClick={decrement}
                aria-label='Decrement'
                role='button'
              >
                &ndash;
              </IncrementDecrementButton>
              <IncrementDecrementButton
                className={value === max ? 'disabled' : undefined}
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

SimpleNumberPicker.defaultProps = {
  step: 1,
};

export default SimpleNumberPicker;
