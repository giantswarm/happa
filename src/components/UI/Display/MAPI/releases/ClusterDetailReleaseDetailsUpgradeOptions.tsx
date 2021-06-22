import { Box, Paragraph } from 'grommet';
import ReleaseDetailsModalUpgradeOptionsBetaDisclaimer from 'Modals/ReleaseDetailsModal/ReleaseDetailsModalUpgradeOptionsBetaDisclaimer';
import ReleaseDetailsModalUpgradeOptionsVersion from 'Modals/ReleaseDetailsModal/ReleaseDetailsModalUpgradeOptionsVersion';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { IReleaseVersion, ReleaseVersionStatus } from './types';

function isReleaseBeta(release: IReleaseVersion) {
  return release.status === ReleaseVersionStatus.PreRelease;
}

interface IClusterDetailReleaseDetailsUpgradeOptionsProps {
  supportedVersions: IReleaseVersion[];
  onVersionClick: (version: string) => void;
}

const ClusterDetailReleaseDetailsUpgradeOptions: React.FC<IClusterDetailReleaseDetailsUpgradeOptionsProps> = ({
  supportedVersions,
  onVersionClick,
}) => {
  const handleVersionClick = (version: string) => () => {
    onVersionClick(version);
  };

  const containsBetaReleases = useMemo(() => {
    return supportedVersions.some(isReleaseBeta);
  }, [supportedVersions]);

  if (supportedVersions.length === 1) {
    return (
      <>
        <Paragraph fill={true}>
          This cluster can be upgraded to{' '}
          <ReleaseDetailsModalUpgradeOptionsVersion
            version={supportedVersions[0].version}
            isBeta={isReleaseBeta(supportedVersions[0])}
            onClick={handleVersionClick(supportedVersions[0].version)}
            tabIndex={0}
          />
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
          <ReleaseDetailsModalUpgradeOptionsVersion
            version={release.version}
            isBeta={isReleaseBeta(release)}
            onClick={handleVersionClick(release.version)}
            tabIndex={0}
          />
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

ClusterDetailReleaseDetailsUpgradeOptions.propTypes = {
  supportedVersions: PropTypes.array.isRequired,
  onVersionClick: PropTypes.func.isRequired,
};

export default ClusterDetailReleaseDetailsUpgradeOptions;
