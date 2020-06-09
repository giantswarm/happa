import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';

interface ICPLoginButtonProps extends React.ComponentPropsWithRef<'button'> {
  wrapperProps?: React.ComponentPropsWithoutRef<'div'>;
}

const CPLoginButton: React.FC<ICPLoginButtonProps> = ({
  wrapperProps,
  ...rest
}) => {
  return (
    <div {...wrapperProps}>
      <Button bsStyle='info' {...rest}>
        Log in to Control Plane via OIDC
      </Button>
    </div>
  );
};

CPLoginButton.propTypes = {
  wrapperProps: PropTypes.object,
};

export default CPLoginButton;
