import React from 'react';
import styled from 'styled-components';

const BetaLabel = styled.span`
  background: ${({ theme }) => theme.colors.goldBackground};
  color: ${({ theme }) => theme.colors.white1};
  padding: 1px ${({ theme }) => theme.spacingPx}px;
  border-radius: 3px;
  font-weight: 400;
  font-size: 0.8rem;
`;

interface IReleaseDetailsModalUpgradeOptionsBetaLabelProps
  extends React.ComponentPropsWithoutRef<'span'> {}

const ReleaseDetailsModalUpgradeOptionsBetaLabel: React.FC<IReleaseDetailsModalUpgradeOptionsBetaLabelProps> = (
  props
) => {
  return (
    <BetaLabel role='presentation' {...props}>
      BETA
    </BetaLabel>
  );
};

export default ReleaseDetailsModalUpgradeOptionsBetaLabel;
