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
  showUpgradeModal: () => void;
  setUpgradeVersion: (newVersion: string) => void;
  closeModal: () => void;
}

const ReleaseDetailsModalUpgradeOptions: React.FC<IReleaseDetailsModalUpgradeOptionsProps> = ({
  isAdmin,
  releases,
  provider,
  currentVersion,
  showUpgradeModal,
  setUpgradeVersion,
  closeModal,
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
        const preReleaseInfo = release.getPreRelease();

        return {
          version: release.toString(),
          isBeta:
            preReleaseInfo.length > 0 &&
            ReleaseHelper.isPreReleaseUpgradableTo(preReleaseInfo),
        };
      }
    );

    return supportedUpgradeReleases;
  }, [releases, currentVersion, provider, isAdmin]);

  const containsBetaReleases = useMemo(() => {
    return availableReleases.some((r) => r.isBeta);
  }, [availableReleases]);

  const onVersionClick = (version: string) => (
    e: React.MouseEvent<HTMLElement>
  ) => {
    e.preventDefault();

    setUpgradeVersion(version);
    closeModal();
    showUpgradeModal();
  };

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
                onClick={onVersionClick(release.version)}
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
            onClick={onVersionClick(availableReleases[0].version)}
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
  showUpgradeModal: PropTypes.func.isRequired,
  setUpgradeVersion: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default ReleaseDetailsModalUpgradeOptions;
