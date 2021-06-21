import { Box, Text } from 'grommet';
import { relativeDate } from 'lib/helpers';
import GenericModal from 'Modals/GenericModal';
import ReleaseDetailsModalSection from 'Modals/ReleaseDetailsModal/ReleaseDetailsModalSection';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ReleaseComponentLabel from 'UI/Display/Cluster/ReleaseComponentLabel';

const StyledReleaseDetailsModalSection = styled(ReleaseDetailsModalSection)`
  margin-top: 0;
`;

export interface IClusterDetailReleaseDetailsModalComponent {
  name: string;
  version: string;
}

interface IClusterDetailReleaseDetailsModalProps {
  version: string;
  onClose: () => void;
  visible?: boolean;
  creationDate?: string;
  components?: IClusterDetailReleaseDetailsModalComponent[];
  releaseNotesURL?: string;
}

const ClusterDetailReleaseDetailsModal: React.FC<IClusterDetailReleaseDetailsModalProps> = ({
  version,
  onClose,
  visible,
  creationDate,
  components,
  releaseNotesURL,
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
      </Box>
    </GenericModal>
  );
};

ClusterDetailReleaseDetailsModal.propTypes = {
  version: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  visible: PropTypes.bool,
  components: PropTypes.array,
  creationDate: PropTypes.string,
  releaseNotesURL: PropTypes.string,
};

export default ClusterDetailReleaseDetailsModal;
