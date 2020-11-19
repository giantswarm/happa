import styled from '@emotion/styled';
import React from 'react';

import ReleaseDetailsModalUpgradeOptionsBetaLabel from './ReleaseDetailsModalUpgradeOptionsBetaLabel';

const Wrapper = styled.span`
  display: flex;
  gap: ${({ theme }) => theme.spacingPx * 3}px;
  color: ${({ theme }) => theme.colors.white3};
`;

interface IReleaseDetailsModalUpgradeOptionsBetaDisclaimerProps
  extends React.ComponentPropsWithoutRef<'div'> {}

const ReleaseDetailsModalUpgradeOptionsBetaDisclaimer: React.FC<IReleaseDetailsModalUpgradeOptionsBetaDisclaimerProps> = (
  props
) => {
  return (
    <Wrapper {...props}>
      <div>
        <ReleaseDetailsModalUpgradeOptionsBetaLabel />
      </div>
      <div>
        Beta releases are not recommended for production use. Upgrading to newer
        beta and non-beta releases is possible.
      </div>
    </Wrapper>
  );
};

ReleaseDetailsModalUpgradeOptionsBetaDisclaimer.propTypes = {};

export default ReleaseDetailsModalUpgradeOptionsBetaDisclaimer;
