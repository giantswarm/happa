import { getUpdateButtonMessage } from 'Footer/FooterUtils';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IFooterUpdateButtonProps {
  hasUpdateReady: boolean;
  isUpdating: boolean;
  releaseURL: string;
  onClick?: () => void;
}

const FooterUpdateButton: React.FC<IFooterUpdateButtonProps> = ({
  hasUpdateReady,
  isUpdating,
  releaseURL,
  onClick,
  ...rest
}) => {
  const label: string = getUpdateButtonMessage(hasUpdateReady, isUpdating);

  if (hasUpdateReady) {
    return (
      <Button
        disabled={isUpdating}
        loading={isUpdating}
        warning={true}
        size='small'
        onClick={onClick}
        {...rest}
      >
        {label}
      </Button>
    );
  }

  return (
    <a href={releaseURL} target='_blank' rel='noreferrer noopener'>
      {label}
    </a>
  );
};

FooterUpdateButton.propTypes = {
  hasUpdateReady: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  releaseURL: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default FooterUpdateButton;
