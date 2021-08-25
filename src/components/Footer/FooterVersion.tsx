import { formatVersion } from 'Footer/FooterUtils';
import React from 'react';
import styled from 'styled-components';

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

export default FooterVersion;
