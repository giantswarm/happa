import { withTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const LoginWrapper = withTheme(
  styled.div`
    position: relative;
    margin: auto;
    margin-top: -40px;
    width: 33%;
    z-index: 1;
    button {
      z-index: 10;
    }
    form {
      margin-top: 20px;
      margin-bottom: 40px;
    }
    a {
      font-size: 14px;
    }
  `
);

const LoginFormContainer = props => {
  return <LoginWrapper>{props.children}</LoginWrapper>;
};

LoginFormContainer.propTypes = {
  children: PropTypes.any.isRequired,
};

export default LoginFormContainer;
