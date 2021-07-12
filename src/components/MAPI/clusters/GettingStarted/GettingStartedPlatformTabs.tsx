import { Box } from 'grommet';
import { useGettingStartedContext } from 'MAPI/clusters/GettingStarted/GettingStartedProvider';
import PropTypes from 'prop-types';
import React from 'react';
import { Tab, Tabs } from 'shared/Tabs';
import styled from 'styled-components';
import theme from 'styles/theme';

const StyledTabs = styled(Tabs)`
  border: 1px #fff dashed;
  border-color: ${({ theme: t }) => t.global.colors['background-front'].dark};
  background-color: ${({ theme: t }) =>
    t.global.colors['background-front'].dark};

  padding: 15px 18px;
  border-radius: 8px;
`;

const StyledTab = styled(Tab)`
  border-bottom: 0px;
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
  console.log(selectedPlatform);

  return (
    <Box {...props}>
      <StyledTabs
        defaultActiveIndex={selectedPlatform as never}
        controlledActiveIndex={selectedPlatform}
        onActive={setSelectedPlatform as never}
        backgroundColor={theme.global.colors['background-front'].dark}
      >
        {linuxContent && <StyledTab title='Linux'>{linuxContent}</StyledTab>}

        {macOSContent && <StyledTab title='macOS'>{macOSContent}</StyledTab>}

        {windowsContent && (
          <StyledTab title='Windows'>{windowsContent}</StyledTab>
        )}
      </StyledTabs>
    </Box>
  );
};

GettingStartedPlatformTabs.propTypes = {
  linuxContent: PropTypes.node,
  macOSContent: PropTypes.node,
  windowsContent: PropTypes.node,
};

export default GettingStartedPlatformTabs;
