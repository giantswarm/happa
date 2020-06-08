import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';

const ButtonWrapper = styled.div`
  .progress_button--container {
    width: 100%;
  }
`;

const CPButton = styled(Button)`
  width: 100%;
`;

interface ICPLoginProps extends React.ComponentPropsWithRef<'button'> {
  wrapperProps?: React.ComponentPropsWithoutRef<'div'>;
}

const CPLogin: React.FC<ICPLoginProps> = ({ wrapperProps, ...rest }) => {
  return (
    <ButtonWrapper {...wrapperProps}>
      <CPButton bsStyle='info' {...rest}>
        Log in to Control Plane via OIDC
      </CPButton>
    </ButtonWrapper>
  );
};

CPLogin.propTypes = {
  wrapperProps: PropTypes.object,
};

export default CPLogin;
