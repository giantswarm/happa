import { Story } from '@storybook/react/types-6-0';
import { Box, Heading, Text } from 'grommet';
import React, { ComponentPropsWithoutRef, useState } from 'react';
import Button from 'UI/Controls/Button';

import ConfirmationPrompt from '..';

export const Simple: Story<
  ComponentPropsWithoutRef<typeof ConfirmationPrompt>
> = (args) => {
  const [open, setIsOpen] = useState(false);

  return (
    <Box>
      <Box margin={{ bottom: 'small' }}>
        <Button onClick={() => setIsOpen(!open)}>Open prompt</Button>
      </Box>
      <ConfirmationPrompt {...args} open={open}>
        <Heading level={4} margin='none'>
          Hi friends 👋
        </Heading>
        <Text>Check out this awesome component!</Text>
      </ConfirmationPrompt>
    </Box>
  );
};
