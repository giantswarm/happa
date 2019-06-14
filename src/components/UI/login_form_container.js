import { withTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const LoginWrapper = withTheme(
  styled.div({
    position: 'relative',
    margin: 'auto',
    marginTop: -'40px',
    width: '33%',
    zIndex: 1,
    button: {
      zIndex: 10,
    },
    form: {
      marginTop: '20px',
      marginBottom: '40px',
    },
    a: {
      fontSize: '14px',
    },
  })
);


const LoginFormContainer = props => {
  return (
    <LoginWrapper>
      {props.children}
    </LoginWrapper>
  );
};

LoginFormContainer.propTypes = {
  children: PropTypes.any.isRequired,
};

export default LoginFormContainer;