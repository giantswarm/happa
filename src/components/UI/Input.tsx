import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { ChangeEvent, ElementRef, ReactNode } from 'react';

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

const InputWrapper = styled.div`
  align-items: center;
  display: flex;
`;

export const InputElement = styled.input`
  background-color: ${(props) => props.theme.colors.shade5};
  border: 1px solid ${(props) => props.theme.colors.shade6};
  border-radius: ${(props) => props.theme.border_radius};
  font-size: 14px;
  line-height: normal;
  padding: 8px 10px;
  width: 100%;

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

interface IInput {
  onChange?(changed: string | FileList | null): void;
  label?: string;
  description?: ReactNode;
  children?: ReactNode;
  value?: string;
  readOnly?: boolean;
  icon?: string;
  validationError?: ReactNode;
  type?: string;
  hint?: ReactNode;
}

const Input: React.FC<IInput> = (props) => {
  const onChange = (e: ChangeEvent<ElementRef<'input'>>) => {
    if (props.onChange) {
      if (props.type === 'file') {
        props.onChange(e.target.files);
      } else {
        props.onChange(e.target.value);
      }
    }
  };

  return (
    <Wrapper>
      <Text>
        {props.label ? (
          <label htmlFor={props.label}>{props.label}</label>
        ) : undefined}
        {props.description ? <p>{props.description}</p> : undefined}
      </Text>
      <InputWrapper>
        {props.icon ? <Icon className={`fa fa-${props.icon}`} /> : undefined}
        {props.children ? (
          props.children
        ) : props.type === 'text' ? (
          <InputElement
            id={props.label}
            onChange={onChange}
            type='text'
            value={props.value}
            readOnly={props.readOnly}
          />
        ) : (
          <InputElement id={props.label} onChange={onChange} type='file' />
        )}
      </InputWrapper>
      {props.validationError ? (
        <ValidationError>
          <i className='fa fa-warning' /> {props.validationError}
        </ValidationError>
      ) : (
        <Hint>{props.hint}</Hint>
      )}
    </Wrapper>
  );
};

Input.propTypes = {
  description: PropTypes.string,
  hint: PropTypes.object,
  icon: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  validationError: PropTypes.string,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
  children: PropTypes.node,
  type: PropTypes.oneOf(['text', 'file']),
};

Input.defaultProps = {
  type: 'text',
  hint: '',
  onChange: () => {},
};

export default Input;
