import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

import ReleaseDetailsModalUpgradeOptionsBetaLabel from './ReleaseDetailsModalUpgradeOptionsBetaLabel';

const Version = styled.span`
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => theme.colors.white2};
  }

  &:active {
    color: ${({ theme }) => theme.colors.white3};
  }
`;

interface IReleaseDetailsModalUpgradeOptionsVersionProps
  extends React.ComponentPropsWithoutRef<'span'> {
  version: string;
  isBeta: boolean;
}

const ReleaseDetailsModalUpgradeOptionsVersion: React.FC<IReleaseDetailsModalUpgradeOptionsVersionProps> = ({
  version,
  isBeta,
  ...rest
}) => {
  return (
    <span role='button' aria-label={version} {...rest}>
      <Version>{version}</Version>{' '}
      {isBeta && <ReleaseDetailsModalUpgradeOptionsBetaLabel />}
    </span>
  );
};

ReleaseDetailsModalUpgradeOptionsVersion.propTypes = {
  version: PropTypes.string.isRequired,
  isBeta: PropTypes.bool.isRequired,
};

export default ReleaseDetailsModalUpgradeOptionsVersion;
