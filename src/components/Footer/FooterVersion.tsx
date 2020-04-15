import styled from '@emotion/styled';
import { formatVersion } from 'Footer/FooterUtils';
import PropTypes from 'prop-types';
import React from 'react';

interface IFooterVersionProps {
  currentVersion: string;
  hasUpdateReady: boolean;
}

const VersionWarning = styled.span`
  color: ${({ theme }) => theme.colors.yellow1};

  i {
    margin-left: 0.25rem;
  }
`;

const FooterVersion: React.FC<IFooterVersionProps> = ({
  currentVersion,
  hasUpdateReady,
}) => {
  const formattedVersion: string = formatVersion(currentVersion);

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
  hasUpdateReady: PropTypes.bool.isRequired,
  currentVersion: PropTypes.string.isRequired,
};

export default FooterVersion;
