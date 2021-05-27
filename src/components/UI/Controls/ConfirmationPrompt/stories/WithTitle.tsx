import { Story } from '@storybook/react/types-6-0';
import { Box, Text } from 'grommet';
import React, { ComponentPropsWithoutRef, useState } from 'react';
import Button from 'UI/Controls/Button';

import ConfirmationPrompt from '..';

export const WithTitle: Story<
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

WithTitle.argTypes = {
  title: {
    description: 'The text displayed in the title',
    control: { type: 'text' },
  },
};

WithTitle.args = {
  title: 'Hello friends',
};
