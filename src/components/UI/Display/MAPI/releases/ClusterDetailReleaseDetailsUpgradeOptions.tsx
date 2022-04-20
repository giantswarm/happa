import { Box, Keyboard, Paragraph } from 'grommet';
import ReleaseDetailsModalUpgradeOptionsBetaDisclaimer from 'Modals/ReleaseDetailsModal/ReleaseDetailsModalUpgradeOptionsBetaDisclaimer';
import ReleaseDetailsModalUpgradeOptionsVersion from 'Modals/ReleaseDetailsModal/ReleaseDetailsModalUpgradeOptionsVersion';
import React, { useMemo } from 'react';

import { IReleaseVersion, ReleaseVersionStatus } from './types';

function isReleaseBeta(release: IReleaseVersion) {
  return release.status === ReleaseVersionStatus.PreRelease;
}

interface IClusterDetailReleaseDetailsUpgradeOptionsProps {
  supportedVersions: IReleaseVersion[];
  onVersionClick: (version: string) => void;
  canUpdateCluster?: boolean;
}

const ClusterDetailReleaseDetailsUpgradeOptions: React.FC<
  React.PropsWithChildren<IClusterDetailReleaseDetailsUpgradeOptionsProps>
> = ({ supportedVersions, onVersionClick, canUpdateCluster }) => {
  const handleVersionClick = (version: string) => () => {
    if (canUpdateCluster) onVersionClick(version);
  };

  const handleKeyDown =
    (version: string) => (e: React.KeyboardEvent<HTMLElement>) => {
      e.preventDefault();

      handleVersionClick(version)();
    };

  const containsBetaReleases = useMemo(() => {
    return supportedVersions.some(isReleaseBeta);
  }, [supportedVersions]);

  if (supportedVersions.length === 1) {
    const release = supportedVersions[0];

    return (
      <>
        <Paragraph fill={true}>
          This cluster can be upgraded to{' '}
          <Keyboard
            onSpace={handleKeyDown(release.version)}
            onEnter={handleKeyDown(release.version)}
          >
            <ReleaseDetailsModalUpgradeOptionsVersion
              version={release.version}
              isBeta={isReleaseBeta(release)}
              onClick={handleVersionClick(release.version)}
              tabIndex={canUpdateCluster ? 0 : -1}
              unauthorized={canUpdateCluster}
            />
          </Keyboard>
          .
        </Paragraph>
        {containsBetaReleases && (
          <Box margin={{ top: 'medium' }}>
            <ReleaseDetailsModalUpgradeOptionsBetaDisclaimer />
          </Box>
        )}
      </>
    );
  }

  return (
    <>
      <Paragraph fill={true}>
        This cluster can be upgraded to these releases:
      </Paragraph>
      {supportedVersions.map((release) => (
        <Box key={release.version}>
          <Keyboard
            onSpace={handleKeyDown(release.version)}
            onEnter={handleKeyDown(release.version)}
          >
            <ReleaseDetailsModalUpgradeOptionsVersion
              version={release.version}
              isBeta={isReleaseBeta(release)}
              onClick={handleVersionClick(release.version)}
              tabIndex={canUpdateCluster ? 0 : -1}
              unauthorized={!canUpdateCluster}
            />
          </Keyboard>
        </Box>
      ))}
      {containsBetaReleases && (
        <Box margin={{ top: 'medium' }}>
          <ReleaseDetailsModalUpgradeOptionsBetaDisclaimer />
        </Box>
      )}
    </>
  );
};

export default ClusterDetailReleaseDetailsUpgradeOptions;
