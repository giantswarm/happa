import * as theme from '../../../lib/theme';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  margin-bottom: 15px;
  :last-child: {
    margin-bottom: 0;
  },
`;

const Text = styled.div`
  font-size: 14px;
  color: ${theme.COLORS.white2};
`;

const InputWrapper = styled.div`
  align-items: center;
  display: flex;
`;

const Input = styled.input`
  background-color: ${theme.COLORS.shade5};
  border: 1px solid ${theme.COLORS.shade6};
  border-radius: ${theme.BORDER_RADIUS};
  font-size: 14px;
  line-height: normal;
  padding: 8px 10px;
  width: 100%;
`;

const Icon = styled.i`
  color: ${theme.COLORS.white3};
  font-size: 24px;
  margin-right: 5px;
`;

const ValidationError = styled.span`
  font-size: 12px;
  color: ${theme.COLORS.yellow1};
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
        {props.icon ? <Icon className={'fa fa-' + props.icon} /> : undefined}
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
