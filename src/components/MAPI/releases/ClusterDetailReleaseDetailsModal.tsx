import { Box, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import GenericModal from 'Modals/GenericModal';
import ReleaseDetailsModalSection from 'Modals/ReleaseDetailsModal/ReleaseDetailsModalSection';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ReleaseComponentLabel from 'UI/Display/Cluster/ReleaseComponentLabel';
import ClusterDetailReleaseDetailsUpgradeOptions from 'UI/Display/MAPI/releases/ClusterDetailReleaseDetailsUpgradeOptions';
import * as ui from 'UI/Display/MAPI/releases/types';

const StyledReleaseDetailsModalSection = styled(ReleaseDetailsModalSection)`
  margin-top: 0;
`;

interface IClusterDetailReleaseDetailsModalComponent {
  name: string;
  version: string;
}

interface IClusterDetailReleaseDetailsModalProps {
  version: string;
  onClose: () => void;
  onUpgradeVersionSelect: (version: string) => void;
  visible?: boolean;
  creationDate?: string;
  components?: IClusterDetailReleaseDetailsModalComponent[];
  releaseNotesURL?: string;
  supportedUpgradeVersions?: ui.IReleaseVersion[];
}

const ClusterDetailReleaseDetailsModal: React.FC<IClusterDetailReleaseDetailsModalProps> = ({
  version,
  onClose,
  onUpgradeVersionSelect,
  visible,
  creationDate,
  components,
  releaseNotesURL,
  supportedUpgradeVersions,
}) => {
  const title = `Details for release v${version}`;

  const sortedComponents = useMemo(() => {
    if (!components) return [];

    return components.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }, [components]);

  return (
    <GenericModal
      footer={<Button onClick={onClose}>Close</Button>}
      onClose={onClose}
      title={title}
      aria-label={title}
      visible={visible}
    >
      <Box direction='column' gap='medium'>
        <Box>
          <Text>Released {relativeDate(creationDate)}</Text>
        </Box>

        {components && (
          <Box wrap={true} direction='row' gap='xxsmall'>
            {sortedComponents.map((component) => (
              <ReleaseComponentLabel
                key={component.name}
                name={component.name}
                version={component.version}
              />
            ))}
          </Box>
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

        {supportedUpgradeVersions && supportedUpgradeVersions.length > 0 && (
          <StyledReleaseDetailsModalSection title='Upgrade options'>
            <ClusterDetailReleaseDetailsUpgradeOptions
              supportedVersions={supportedUpgradeVersions}
              onVersionClick={onUpgradeVersionSelect}
            />
          </StyledReleaseDetailsModalSection>
        )}
      </Box>
    </GenericModal>
  );
};

ClusterDetailReleaseDetailsModal.propTypes = {
  version: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpgradeVersionSelect: PropTypes.func.isRequired,
  visible: PropTypes.bool,
  components: PropTypes.array,
  creationDate: PropTypes.string,
  releaseNotesURL: PropTypes.string,
  supportedUpgradeVersions: PropTypes.array,
};

export default ClusterDetailReleaseDetailsModal;
