import * as theme from '../../../lib/theme';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div({
  marginBottom: 15,
  ':last-child': {
    marginBottom: 0,
  },
});

const Text = styled.div({
  fontSize: 14,
  color: theme.COLORS.white2,
});

const InputWrapper = styled.div({
  alignItems: 'center',
  display: 'flex',
});

const Input = styled.input({
  backgroundColor: theme.COLORS.shade5,
  border: '1px solid ' + theme.COLORS.shade6,
  borderRadius: theme.BORDER_RADIUS,
  fontSize: 14,
  lineHeight: 'normal',
  padding: '8px 10px',
  width: '100%',
});

const Icon = styled.i({
  color: theme.COLORS.white3,
  fontSize: 24,
  marginRight: 5,
});

const ValidationError = styled.span({
  fontSize: 12,
  color: theme.COLORS.yellow1,
});

const Hint = styled.span({
  fontSize: 12,
});

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
