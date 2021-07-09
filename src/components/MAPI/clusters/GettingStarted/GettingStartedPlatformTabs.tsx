import { Box } from 'grommet';
import {
  GettingStartedPlatform,
  useGettingStartedContext,
} from 'MAPI/clusters/GettingStarted/GettingStartedProvider';
import PropTypes from 'prop-types';
import React from 'react';
import { Tab } from 'react-bootstrap';
import Tabs from 'shared/Tabs';
import styled from 'styled-components';

const StyledTab = styled(Tab)`
  padding: ${({ theme }) => theme.global.edgeSize.medium};
  background: ${({ theme }) => theme.global.colors['background-front'].dark};
  border-radius: ${({ theme }) => theme.rounding}px;
`;

interface IGettingStartedPlatformTabsProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  linuxContent?: React.ReactNode;
  macOSContent?: React.ReactNode;
  windowsContent?: React.ReactNode;
}

const GettingStartedPlatformTabs: React.FC<IGettingStartedPlatformTabsProps> = ({
  linuxContent,
  macOSContent,
  windowsContent,
  ...props
}) => {
  const { selectedPlatform, setSelectedPlatform } = useGettingStartedContext();

  return (
    <Box {...props}>
      <Tabs
        defaultActiveKey={selectedPlatform as never}
        activeKey={selectedPlatform}
        onSelect={setSelectedPlatform as never}
      >
        {linuxContent && (
          <StyledTab eventKey={GettingStartedPlatform.Linux} title='Linux'>
            {linuxContent}
          </StyledTab>
        )}

        {macOSContent && (
          <StyledTab eventKey={GettingStartedPlatform.MacOS} title='macOS'>
            {macOSContent}
          </StyledTab>
        )}

        {windowsContent && (
          <StyledTab eventKey={GettingStartedPlatform.Windows} title='Windows'>
            {windowsContent}
          </StyledTab>
        )}
      </Tabs>
    </Box>
  );
};

GettingStartedPlatformTabs.propTypes = {
  linuxContent: PropTypes.node,
  macOSContent: PropTypes.node,
  windowsContent: PropTypes.node,
};

export default GettingStartedPlatformTabs;
