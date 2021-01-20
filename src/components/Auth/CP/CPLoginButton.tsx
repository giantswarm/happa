import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Controls/Button';

interface ICPLoginButtonProps extends React.ComponentPropsWithRef<'button'> {
  isLoggedIn?: boolean;
  wrapperProps?: React.ComponentPropsWithoutRef<'div'>;
}

const CPLoginButton: React.FC<ICPLoginButtonProps> = ({
  isLoggedIn,
  wrapperProps,
  ...rest
}) => {
  const buttonStyle = isLoggedIn ? 'danger' : 'info';
  let buttonText = 'Log out';
  if (!isLoggedIn) {
    buttonText = 'Log in to Control Plane via OIDC';
  }

  return (
    <div {...wrapperProps}>
      <Button bsStyle={buttonStyle} {...rest}>
        {buttonText}
      </Button>
    </div>
  );
};

CPLoginButton.propTypes = {
  isLoggedIn: PropTypes.bool,
  wrapperProps: PropTypes.object,
};

CPLoginButton.defaultProps = {
  isLoggedIn: false,
};

export default CPLoginButton;
