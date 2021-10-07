import { Story } from '@storybook/react';
import { Box } from 'grommet';
import React, { useRef } from 'react';

import Tooltip from '../Tooltip';

export const Simple: Story<React.ComponentPropsWithoutRef<typeof Tooltip>> = (
  args
) => {
  const targetRef = useRef(null);

  return (
    <>
      <Box
        ref={targetRef}
        width='medium'
        border={{ color: '#ffffff', size: 'xsmall' }}
        pad='small'
        margin='auto'
        round='xsmall'
        align='center'
      >
        Set the tooltip placement
      </Box>
      <Tooltip target={targetRef.current ?? undefined} {...args} />
    </>
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
