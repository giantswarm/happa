import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ComponentProps } from 'react';

const Label = styled.label`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const StyledInput = styled.input`
  visibility: hidden;
  opacity: 0;
`;

const Bullet = styled.span<{}>`
  display: block;
  position: relative;
  border: ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.colors.white1};
  border-radius: 50%;
  width: 16px;
  height: 16px;
  z-index: 0;
  margin-right: 8px;

  &:after {
    content: '';
    position: absolute;
    background: ${({ theme }) => theme.colors.shade2};
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

const LabelText = styled.span`
  font-weight: 300;
`;

interface IRadioInputProps extends ComponentProps<'input'> {
  bulletProps?: ComponentProps<'span'>;
  id: string;
  label?: string;
  labelTextProps?: ComponentProps<'span'>;
  rootProps?: ComponentProps<'label'>;
}

const RadioInput: React.FC<IRadioInputProps> = ({
  id,
  bulletProps,
  label,
  labelTextProps,
  rootProps,
  ...rest
}) => {
  return (
    <Label {...rootProps} htmlFor={id}>
      <StyledInput {...rest} type='radio' id={id} />
      <Bullet {...bulletProps} />

      {label && <LabelText {...labelTextProps}>{label}</LabelText>}
    </Label>
  );
};

RadioInput.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  bulletProps: PropTypes.object,
  labelTextProps: PropTypes.object,
  rootProps: PropTypes.object,
};

export default RadioInput;
