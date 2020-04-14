import styled from '@emotion/styled';
import { formatVersion } from 'Footer/FooterUtils';
import PropTypes from 'prop-types';
import React from 'react';
import LoadingIndicator from 'UI/LoadingIndicator';

interface IFooterVersionProps {
  currentVersion: string;
  hasUpdateReady: boolean;
  isUpdating: boolean;
}

const StyledLoadingIndicator = styled(LoadingIndicator)`
  display: inline-block;
  position: relative;
  top: -2px;

  img {
    width: 1rem;
    height: 1rem;
  }
`;

const VersionWarning = styled.span`
  color: ${({ theme }) => theme.colors.yellow1};
  \ i {
    margin-left: 0.25rem;
  }
`;

const FooterVersion: React.FC<IFooterVersionProps> = ({
  isUpdating,
  currentVersion,
  hasUpdateReady,
}) => {
  const formattedVersion: string = formatVersion(currentVersion);

  if (isUpdating) {
    return <StyledLoadingIndicator loading={true} loadingPosition='up' />;
  }

  if (hasUpdateReady) {
    return (
      <VersionWarning>
        <span key='current-version'>{formattedVersion}</span>
        <i className='fa fa-warning' />
      </VersionWarning>
    );
  }

  return <span key='current-version'>{formattedVersion}</span>;
};

FooterVersion.propTypes = {
  isUpdating: PropTypes.bool.isRequired,
  hasUpdateReady: PropTypes.bool.isRequired,
  currentVersion: PropTypes.string.isRequired,
};

export default FooterVersion;
