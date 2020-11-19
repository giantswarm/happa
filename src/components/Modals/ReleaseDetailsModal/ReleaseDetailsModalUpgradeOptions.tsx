import styled from '@emotion/styled';
import { ReleaseHelper } from 'lib/ReleaseHelper';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

import ReleaseDetailsModalSection from './ReleaseDetailsModalSection';
import ReleaseDetailsModalUpgradeOptionsBetaDisclaimer from './ReleaseDetailsModalUpgradeOptionsBetaDisclaimer';
import ReleaseDetailsModalUpgradeOptionsVersion from './ReleaseDetailsModalUpgradeOptionsVersion';

const VersionWrapper = styled.div`
  & + & {
    margin-top: ${({ theme }) => theme.spacingPx * 2}px;
  }
`;

const StyledBetaDisclaimer = styled(
  ReleaseDetailsModalUpgradeOptionsBetaDisclaimer
)`
  margin-top: ${({ theme }) => theme.spacingPx * 4}px;
`;

interface ISupportedUpgradeRelease {
  version: string;
  isBeta: boolean;
}

interface IReleaseDetailsModalUpgradeOptionsProps
  extends React.ComponentPropsWithoutRef<'div'> {
  isAdmin: boolean;
  releases: IReleases;
  provider: PropertiesOf<typeof Providers>;
  currentVersion: string;
}

const ReleaseDetailsModalUpgradeOptions: React.FC<IReleaseDetailsModalUpgradeOptionsProps> = ({
  isAdmin,
  releases,
  provider,
  currentVersion,
  ...rest
}) => {
  const availableReleases = useMemo(() => {
    const releaseHelper = new ReleaseHelper({
      availableReleases: releases,
      provider,
      currentReleaseVersion: currentVersion,
      isAdmin,
      ignorePreReleases: false,
    });

    const releasesForUpgrade = releaseHelper.getSupportedUpgradeVersions();
    const supportedUpgradeReleases: ISupportedUpgradeRelease[] = releasesForUpgrade.map(
      (release) => {
        return {
          version: release.toString(),
          isBeta: ReleaseHelper.isPreReleaseUpgradableTo(
            release.getPreRelease()
          ),
        };
      }
    );

    return supportedUpgradeReleases;
  }, [releases, currentVersion, provider, isAdmin]);

  const containsBetaReleases = useMemo(() => {
    return availableReleases.some((r) => r.isBeta);
  }, [availableReleases]);

  if (availableReleases.length < 1) return null;

  return (
    <ReleaseDetailsModalSection title='Upgrade options' {...rest}>
      {availableReleases.length > 1 ? (
        <>
          <p>This cluster can be upgraded to these releases:</p>
          {availableReleases.map((release) => (
            <VersionWrapper key={release.version}>
              <ReleaseDetailsModalUpgradeOptionsVersion
                version={release.version}
                isBeta={release.isBeta}
              />
            </VersionWrapper>
          ))}
        </>
      ) : (
        <p>
          This cluster can be upgraded to{' '}
          <ReleaseDetailsModalUpgradeOptionsVersion
            version={availableReleases[0].version}
            isBeta={availableReleases[0].isBeta}
          />{' '}
          .
        </p>
      )}

      {containsBetaReleases && <StyledBetaDisclaimer />}
    </ReleaseDetailsModalSection>
  );
};

ReleaseDetailsModalUpgradeOptions.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  // @ts-expect-error
  releases: PropTypes.object.isRequired,
  provider: PropTypes.oneOf(Object.values(Providers)).isRequired,
  currentVersion: PropTypes.string.isRequired,
};

export default ReleaseDetailsModalUpgradeOptions;
