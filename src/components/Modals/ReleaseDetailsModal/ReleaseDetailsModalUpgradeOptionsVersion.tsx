import React from 'react';
import styled from 'styled-components';

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
  unauthorized?: boolean;
}

const ReleaseDetailsModalUpgradeOptionsVersion: React.FC<
  React.PropsWithChildren<IReleaseDetailsModalUpgradeOptionsVersionProps>
> = ({ version, isBeta, unauthorized, ...rest }) => {
  const formattedVersion = `v${version}`;

  let label = formattedVersion;
  if (isBeta) {
    label += ' (BETA)';
  }

  return (
    <span
      role={unauthorized ? undefined : 'button'}
      aria-label={label}
      {...rest}
    >
      {unauthorized ? (
        <span>{formattedVersion}</span>
      ) : (
        <Version>{formattedVersion}</Version>
      )}{' '}
      {isBeta && <ReleaseDetailsModalUpgradeOptionsBetaLabel />}
    </span>
  );
};

export default ReleaseDetailsModalUpgradeOptionsVersion;
