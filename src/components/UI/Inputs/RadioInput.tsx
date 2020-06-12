import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ComponentPropsWithRef } from 'react';

const Label = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  visibility: hidden;
  opacity: 0;
  position: absolute;
`;

const Bullet = styled.span<{ disabled?: boolean }>`
  display: block;
  position: relative;
  border: ${({ theme }) => theme.border};
  background: ${({ theme, disabled }) =>
    disabled ? theme.colors.gray : theme.colors.white1};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  z-index: 0;
  margin-right: 12px;

  &:after {
    content: '';
    position: absolute;
    background: ${({ theme, disabled }) =>
      disabled ? theme.colors.darkBlueLighter1 : theme.colors.shade2};
    border-radius: 50%;
    width: 10px;
    height: 10px;
    left: 2px;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 1;

    transition: 0.4s cubic-bezier(0.81, 0, 0.34, 1.75);
    transform: scale(0.01);
    opacity: 0;
  }

  ${StyledInput}:checked + &:after {
    opacity: 1;
    transform: scale(1);
  }
`;

const LabelText = styled.span<{ disabled?: boolean }>`
  font-weight: 300;
  font-size: 0.9rem;
  color: ${({ theme, disabled }) => disabled && theme.colors.gray};
`;

interface IRadioInputProps
  extends Omit<ComponentPropsWithRef<'input'>, 'type'> {
  /* The ID of the input. */
  id: string;

  /* Customization props for the element that displays the 'bullet' symbol. */
  bulletProps?: ComponentPropsWithRef<'span'>;

  /* A helpful label that describes what this input means. */
  label?: string;

  /* Customization props for the label element. */
  labelTextProps?: ComponentPropsWithRef<'span'>;

  /* Customization props for the root label element. */
  rootProps?: Omit<ComponentPropsWithRef<'label'>, 'htmlFor'>;

  /* className for applying a class to the root. */
  className?: string;
}

/**
 * A component used for displaying a radio input. It is meant to be used similar
 * to the native `input` element, only with a label built in, and a mandatory
 * `id` attribute.
 *
 * How to use this:
 * @link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/radio
 */
const RadioInput: React.FC<IRadioInputProps> = ({
  id,
  bulletProps,
  label,
  labelTextProps,
  rootProps,
  disabled,
  className,
  ...rest
}) => {
  return (
    <Label {...rootProps} htmlFor={id} className={className}>
      <StyledInput {...rest} type='radio' id={id} disabled={disabled} />
      <Bullet {...bulletProps} disabled={disabled} />

      {label && (
        <LabelText {...labelTextProps} disabled={disabled}>
          {label}
        </LabelText>
      )}
    </Label>
  );
};

RadioInput.propTypes = {
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  bulletProps: PropTypes.object,
  labelTextProps: PropTypes.object,
  rootProps: PropTypes.object,
  className: PropTypes.string,
};

export default RadioInput;
