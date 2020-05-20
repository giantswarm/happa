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
  vertical-align: middle;
  width: 16px;
  height: 16px;
  z-index: 0;
  margin-right: 8px;

  &:after {
    content: '';
    position: absolute;
    left: calc(4px / 2);
    top: 0;
    bottom: 0;
    margin: auto;
    background: ${({ theme }) => theme.colors.shade2};
    border-radius: 50%;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
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
  label?: string;
}

const RadioInput: React.FC<IRadioInputProps> = ({ id, label, ...rest }) => {
  return (
    <Label htmlFor={id}>
      <StyledInput {...rest} type='radio' id={id} />
      <Bullet />
      <LabelText>{label}</LabelText>
    </Label>
  );
};

RadioInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
};

export default RadioInput;
