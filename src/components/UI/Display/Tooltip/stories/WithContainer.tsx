import { Story } from '@storybook/react';
import { Box } from 'grommet';
import React from 'react';

import Tooltip from '../Tooltip';
import TooltipContainer from '../TooltipContainer';

export const WithContainer: Story<
  React.ComponentPropsWithoutRef<typeof TooltipContainer>
> = (args) => {
  return <TooltipContainer {...args} />;
};

WithContainer.args = {
  content: <Tooltip>Additional information</Tooltip>,
  children: (
    <Box
      width='medium'
      border={{ color: '#ffffff', size: 'xsmall' }}
      pad='small'
      margin='auto'
      round='xsmall'
      align='center'
    >
      Hover over me for additional information
    </Box>
  ),
};

WithContainer.argTypes = {
  children: { table: { disable: true } },
  content: { table: { disable: true } },
};
