import { Story } from '@storybook/react/types-6-0';
import { Box, Text } from 'grommet';
import React, { ComponentPropsWithoutRef, useState } from 'react';
import Button from 'UI/Controls/Button';

import ConfirmationPrompt from '..';

export const WithButtons: Story<
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

WithButtons.argTypes = {
  confirmButton: {
    description: 'The text displayed in the confirmation button',
    control: { type: 'text' },
  },
  cancelButton: {
    description: 'The text displayed in the cancel button',
    control: { type: 'text' },
  },
  onConfirm: {
    description: 'The action executed when pressing the confirmation button',
    action: 'click',
  },
  onCancel: {
    description: 'The action executed when pressing the cancel button',
    action: 'click',
  },
};
