import { Box } from 'grommet';
import { useGettingStartedContext } from 'MAPI/clusters/GettingStarted/GettingStartedProvider';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Tab, Tabs } from 'UI/Display/Tabs';

const StyledTab = styled(Tab)`
  &[aria-expanded='true'] > div {
    background-color: ${({ theme }) =>
      theme.global.colors['background-front'].dark};
  }
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
    <Box background='background-front' pad='medium' round='xsmall' {...props}>
      <Tabs activeIndex={selectedPlatform} onActive={setSelectedPlatform}>
        {linuxContent && <StyledTab title='Linux'>{linuxContent}</StyledTab>}

        {macOSContent && <StyledTab title='macOS'>{macOSContent}</StyledTab>}

        {windowsContent && (
          <StyledTab title='Windows'>{windowsContent}</StyledTab>
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
