import { Story } from '@storybook/react';
import { Text } from 'grommet';
import React, { ComponentPropsWithoutRef } from 'react';

import Modal from '..';

export const Simple: Story<ComponentPropsWithoutRef<typeof Modal>> = (args) => {
  return (
    <Modal {...args}>
      <Text>Welcome to my new modal!</Text>
    </Modal>
  );
};

Simple.args = {
  title: 'Hello friend',
  visible: true,
};

Simple.argTypes = {
  title: {
    description: 'The text to display at the top of the modal.',
    control: {
      type: 'text',
    },
  },
  visible: {
    description: 'Whether the modal should be visible or not.',
    control: {
      type: 'boolean',
    },
  },
};
