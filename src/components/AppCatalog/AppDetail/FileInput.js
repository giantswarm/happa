import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const Wrapper = styled.div`
  margin-bottom: 15px;
  :last-child: {
    margin-bottom: 0;
  }
`;

const Text = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.white2};
`;

const InputWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const Input = styled.input`
  background-color: ${props => props.theme.colors.shade5};
  border: 1px solid ${props => props.theme.colors.shade6};
  border-radius: ${props => props.theme.border_radius};
  font-size: 14px;
  line-height: normal;
  padding: 8px 10px;
  width: 100%;
`;

const Icon = styled.i`
  color: ${props => props.theme.colors.white3};
  font-size: 24px;
  margin-right: 5px;
`;

const ValidationError = styled.span`
  font-size: 12px;
  color: ${props => props.theme.colors.yellow1};
`;

const Hint = styled.span`
  font-size: 12px;
`;

const TextInput = props => {
  const onChange = e => {
    if (props.onChange) {
      props.onChange(e.target.files);
    }
  };

  return (
    <Wrapper>
      <Text>
        {props.label ? (
          <label htmlFor={props.label}>{props.label}</label>
        ) : (
          undefined
        )}
        {props.description ? <p>{props.description}</p> : undefined}
      </Text>
      <InputWrapper>
        {props.icon ? <Icon className={`fa fa-${props.icon}`} /> : undefined}
        <Input id={props.label} onChange={onChange} type='file' />
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

TextInput.propTypes = {
  description: PropTypes.string,
  hint: PropTypes.string,
  icon: PropTypes.string,
  label: PropTypes.string,
  onChange: PropTypes.func,
  validationError: PropTypes.string,
  value: PropTypes.string,
};

export default TextInput;
