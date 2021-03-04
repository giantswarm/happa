import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IMapiLoginButtonProps extends React.ComponentPropsWithRef<'button'> {
  isLoggedIn?: boolean;
  wrapperProps?: React.ComponentPropsWithoutRef<'div'>;
}

const MapiLoginButton: React.FC<IMapiLoginButtonProps> = ({
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

MapiLoginButton.propTypes = {
  isLoggedIn: PropTypes.bool,
  wrapperProps: PropTypes.object,
};

MapiLoginButton.defaultProps = {
  isLoggedIn: false,
};

export default MapiLoginButton;
