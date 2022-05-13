import { getUpdateButtonMessage } from 'Footer/FooterUtils';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IFooterUpdateButtonProps {
  hasUpdateReady: boolean;
  isUpdating: boolean;
  releaseURL: string;
  onClick?: () => void;
}

const FooterUpdateButton: React.FC<
  React.PropsWithChildren<IFooterUpdateButtonProps>
> = ({ hasUpdateReady, isUpdating, releaseURL, onClick, ...rest }) => {
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

export default FooterUpdateButton;
