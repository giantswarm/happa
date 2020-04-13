import styled from '@emotion/styled';
import { getUpdateButtonMessage } from 'Footer/FooterUtils';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const Link = styled.a<{ hasUpdate: boolean; isUpdating: boolean }>`
  color: ${({ hasUpdate, theme }) => hasUpdate && theme.colors.yellow1};
  cursor: ${({ isUpdating }) => isUpdating && 'not-allowed'};
`;

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
  const href: string = hasUpdateReady ? '#' : releaseURL;
  const label: string = getUpdateButtonMessage(hasUpdateReady, isUpdating);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!hasUpdateReady) return;

      e.preventDefault();

      if (isUpdating) return;

      // eslint-disable-next-line no-unused-expressions
      onClick?.();
    },
    [hasUpdateReady, isUpdating, onClick]
  );

  return (
    <Link
      rel='noopener noreferrer'
      href={href}
      target='_blank'
      onClick={handleClick}
      hasUpdate={hasUpdateReady}
      isUpdating={isUpdating}
      {...rest}
    >
      {label}
    </Link>
  );
};

FooterUpdateButton.propTypes = {
  hasUpdateReady: PropTypes.bool.isRequired,
  isUpdating: PropTypes.bool.isRequired,
  releaseURL: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

export default FooterUpdateButton;
