import { Box, Text } from 'grommet';
import ReleaseDetailsModalSection from 'Modals/ReleaseDetailsModal/ReleaseDetailsModalSection';
import React from 'react';
import styled from 'styled-components';
import ReleaseComponentLabel from 'UI/Display/Cluster/ReleaseComponentLabel';

import {
  IReleaseComponentsDiff,
  ReleaseComponentsDiffChangeType,
} from './types';

function formatReleaseComponentLabel(
  change: IReleaseComponentsDiff['changes'][0]
) {
  switch (change.changeType) {
    case ReleaseComponentsDiffChangeType.Add:
      return (
        <ReleaseComponentLabel
          name={change.component}
          key={change.component}
          version={change.newVersion}
          isAdded={true}
        />
      );

    case ReleaseComponentsDiffChangeType.Delete:
      return (
        <ReleaseComponentLabel
          name={change.component}
          key={change.component}
          version={change.oldVersion}
          isRemoved={true}
        />
      );

    case ReleaseComponentsDiffChangeType.Update:
      return (
        <ReleaseComponentLabel
          name={change.component}
          key={change.component}
          oldVersion={change.oldVersion}
          version={change.newVersion}
        />
      );

    default:
      return null;
  }
}

const StyledReleaseDetailsModalSection = styled(ReleaseDetailsModalSection)`
  margin-top: 0;
`;

interface IClusterDetailUpgradeModalChangelogProps {
  releaseNotesURL?: string;
  componentsDiff?: IReleaseComponentsDiff;
}

const ClusterDetailUpgradeModalChangelog: React.FC<IClusterDetailUpgradeModalChangelogProps> =
  ({ releaseNotesURL, componentsDiff }) => {
    return (
      <Box direction='column' gap='medium'>
        {componentsDiff && (
          <StyledReleaseDetailsModalSection title='Component changes'>
            <Box
              wrap={true}
              direction='row'
              gap='xxsmall'
              margin={{ top: 'medium' }}
            >
              {componentsDiff.changes.map(formatReleaseComponentLabel)}
            </Box>
          </StyledReleaseDetailsModalSection>
        )}

        {releaseNotesURL && (
          <StyledReleaseDetailsModalSection title='Release notes'>
            <Text>
              <a
                href={releaseNotesURL}
                rel='noopener noreferrer'
                target='_blank'
              >
                {releaseNotesURL}
              </a>
            </Text>
          </StyledReleaseDetailsModalSection>
        )}
      </Box>
    );
  };

export default ClusterDetailUpgradeModalChangelog;
