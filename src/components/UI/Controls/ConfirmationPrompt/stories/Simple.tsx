import { StoryFn } from '@storybook/react';
import { Box, Text } from 'grommet';
import React, { ComponentPropsWithoutRef, useState } from 'react';
import Button from 'UI/Controls/Button';

import ConfirmationPrompt from '..';

export const Simple: StoryFn<
  ComponentPropsWithoutRef<typeof ConfirmationPrompt>
> = (args) => {
  const [open, setIsOpen] = useState(false);

  return (
    <Box>
      <Box margin={{ bottom: 'small' }}>
        <Button onClick={() => setIsOpen(!open)}>Open prompt</Button>
      </Box>
      <ConfirmationPrompt {...args} open={open}>
        <Text>Check out this awesome component!</Text>
      </ConfirmationPrompt>
    </Box>
  );
};
