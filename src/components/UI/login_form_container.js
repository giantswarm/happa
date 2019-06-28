import { withTheme } from 'emotion-theming';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const LoginWrapper = withTheme(
  styled.div({
    position: 'relative',
    margin: 'auto',
    marginTop: -40,
    width: '33%',
    zIndex: 1,
    button: {
      zIndex: 10,
    },
    form: {
      marginTop: 20,
      marginBottom: 40,
    },
    a: {
      fontSize: 14,
    },
  })
);

const LoginFormContainer = props => {
  return <LoginWrapper>{props.children}</LoginWrapper>;
};

LoginFormContainer.propTypes = {
  children: PropTypes.any.isRequired,
};

export default LoginFormContainer;
