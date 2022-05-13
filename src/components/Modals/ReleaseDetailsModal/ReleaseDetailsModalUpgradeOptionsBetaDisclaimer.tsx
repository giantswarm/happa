import React from 'react';
import styled from 'styled-components';

import ReleaseDetailsModalUpgradeOptionsBetaLabel from './ReleaseDetailsModalUpgradeOptionsBetaLabel';

const Wrapper = styled.span`
  display: flex;
  gap: ${({ theme }) => theme.spacingPx * 3}px;
  color: ${({ theme }) => theme.colors.white3};
`;

const Text = styled.div`
  line-height: 1.4;
`;

interface IReleaseDetailsModalUpgradeOptionsBetaDisclaimerProps
  extends React.ComponentPropsWithoutRef<'div'> {}

const ReleaseDetailsModalUpgradeOptionsBetaDisclaimer: React.FC<
  React.PropsWithChildren<IReleaseDetailsModalUpgradeOptionsBetaDisclaimerProps>
> = (props) => {
  return (
    <Wrapper {...props}>
      <div>
        <ReleaseDetailsModalUpgradeOptionsBetaLabel />
      </div>
      <Text>
        Beta releases are not recommended for production use. Upgrading to newer
        beta and non-beta releases is possible.
      </Text>
    </Wrapper>
  );
};

export default ReleaseDetailsModalUpgradeOptionsBetaDisclaimer;
