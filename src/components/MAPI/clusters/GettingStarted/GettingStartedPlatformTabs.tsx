import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { useGettingStartedContext } from 'MAPI/clusters/GettingStarted/GettingStartedProvider';
import React from 'react';
import styled from 'styled-components';
import { Tab, Tabs } from 'UI/Display/Tabs';

const StyledTab = styled(Tab)`
  &[aria-expanded='true'] > div {
    background-color: ${({ theme }) =>
      normalizeColor('background-front', theme)};
  }
`;

interface IGettingStartedPlatformTabsProps
  extends React.ComponentPropsWithoutRef<typeof Box> {
  linuxContent?: React.ReactNode;
  macOSContent?: React.ReactNode;
  windowsContent?: React.ReactNode;
}

const GettingStartedPlatformTabs: React.FC<
  React.PropsWithChildren<IGettingStartedPlatformTabsProps>
> = ({ linuxContent, macOSContent, windowsContent, ...props }) => {
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

export default GettingStartedPlatformTabs;
