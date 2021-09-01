import React from 'react';
import styled from 'styled-components';

const LoginWrapper = styled.div`
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
`;

const LoginFormContainer = (props) => {
  return <LoginWrapper>{props.children}</LoginWrapper>;
};

export default LoginFormContainer;
