import { Story } from '@storybook/react';
import { Box } from 'grommet';
import React, { useRef } from 'react';

import { TooltipContainer } from '..';
import Tooltip from '../Tooltip';

export const Simple: Story<React.ComponentPropsWithoutRef<typeof Tooltip>> = (
  args
) => {
  const targetRef = useRef(null);

  return (
    <TooltipContainer
      content={<Tooltip target={targetRef.current ?? undefined} {...args} />}
    >
      <Box
        ref={targetRef}
        width='small'
        border={{ color: '#ffffff', size: 'xsmall' }}
        pad='small'
        margin='auto'
        round='xsmall'
        align='center'
      >
        Hover for more info
      </Box>
    </TooltipContainer>
  );
};

Simple.args = {
  placement: 'top',
  children: 'Extra information that may or may not be of interest.',
};

Simple.argTypes = {
  placement: {
    options: ['top', 'bottom', 'left', 'right'],
    control: {
      type: 'select',
    },
  },
  background: {
    options: ['tooltip-background', 'background-weak'],
    control: {
      type: 'select',
    },
  },
  content: { table: { disable: true } },
};

// import { Story } from '@storybook/react';
// import { Box } from 'grommet';
// import React from 'react';

// import Tooltip from '../Tooltip';
// import TooltipContainer from '../TooltipContainer';

// export const Simple: Story<
//   React.ComponentPropsWithoutRef<typeof TooltipContainer>
// > = (args) => {
//   return (
//     <TooltipContainer
//       {...args}
//       content={<Tooltip>Additional information</Tooltip>}
//     />
//   );
// };

// Simple.args = {
//   content: <Tooltip>Additional information</Tooltip>,
//   children: (
//     <Box
//       width='medium'
//       border={{ color: '#ffffff', size: 'xsmall' }}
//       pad='small'
//       margin='auto'
//       round='xsmall'
//       align='center'
//     >
//       Hover over me for additional information
//     </Box>
//   ),
// };

// Simple.argTypes = {
//   children: { table: { disable: true } },
//   content: { table: { disable: true } },
// };
