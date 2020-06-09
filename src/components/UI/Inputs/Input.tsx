import { css } from '@emotion/core';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ChangeEvent, ElementRef, FC, ReactNode } from 'react';

const Wrapper = styled.div`
  margin-bottom: 15px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const Text = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.colors.white2};
`;

const InputWrapper = styled.div<{ flexCenter: boolean }>`
  ${({ flexCenter }) =>
    flexCenter &&
    css`
      align-items: center;
      display: flex;
    `}
`;

export const InputElement = styled.input`
  background-color: ${(props) => props.theme.colors.shade5};
  border: 1px solid ${(props) => props.theme.colors.shade6};
  border-radius: ${(props) => props.theme.border_radius};
  color: ${(props) => props.theme.colors.whiteInput};
  font-size: 14px;
  line-height: normal;
  padding: 8px 10px;
  width: 100%;
  font-weight: 400;

  &:read-only {
    cursor: not-allowed;
  }

  &:read-only:focus {
    outline: none;
  }
`;

const Icon = styled.i`
  color: ${(props) => props.theme.colors.white3};
  font-size: 24px;
  margin-right: 5px;
`;

const ValidationError = styled.span`
  font-size: 12px;
  color: ${(props) => props.theme.colors.yellow1};
`;

const Hint = styled.span`
  font-size: 12px;
`;

export interface IInput<T> {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  hint?: ReactNode;
  icon?: string;
  inputId?: string;
  label?: string;
  onChange?(changed: T | null): void;
  placeholder?: string;
  readOnly?: boolean;
  validationError?: ReactNode;
  value?: T;
}

const Input: FC<IInput<string | FileList>> = (props) => {
  const onChange = (e: ChangeEvent<ElementRef<'input'>>) => {
    // eslint-disable-next-line no-unused-expressions
    props.onChange?.(e.target.value);
  };

  return (
    <Wrapper className={props.className}>
      <Text>
        {props.label && (
          <label
            className='input-field-label'
            htmlFor={props.inputId ?? props.label}
          >
            {props.label}
          </label>
        )}
        {props.description && <p>{props.description}</p>}
      </Text>
      <InputWrapper flexCenter={Boolean(props.icon)}>
        {props.icon && <Icon className={`fa fa-${props.icon}`} />}
        {props.children ?? (
          <InputElement
            id={props.inputId ?? props.label}
            onChange={onChange}
            type='text'
            value={props.value as string}
            readOnly={props.readOnly}
            placeholder={props.placeholder}
          />
        )}
      </InputWrapper>
      {props.validationError ? (
        <ValidationError>
          <i className='fa fa-warning' /> {props.validationError}
        </ValidationError>
      ) : (
        <Hint>{props.hint ?? <>&nbsp;</>}</Hint>
      )}
    </Wrapper>
  );
};

Input.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  description: PropTypes.string,
  hint: PropTypes.node,
  icon: PropTypes.string,
  inputId: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  readOnly: PropTypes.bool,
  validationError: PropTypes.string,
  value: PropTypes.any,
};

export default Input;
