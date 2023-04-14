import { Meta, StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';
import { FlashMessageType } from 'styles';

import FlashMessage from '..';

const Template: StoryFn<ComponentPropsWithoutRef<typeof FlashMessage>> = (
  args
) => <FlashMessage {...args}>Here is some text</FlashMessage>;

export const Success = Template.bind({});
Success.args = {
  type: FlashMessageType.Success,
  className: '',
};

export const Info = Template.bind({});
Info.args = {
  type: FlashMessageType.Info,
  className: '',
};

export const Warning = Template.bind({});
Warning.args = {
  type: FlashMessageType.Warning,
  className: '',
};

export const Danger = Template.bind({});
Danger.args = {
  type: FlashMessageType.Danger,
  className: '',
};

export default {
  title: 'Display/FlashMessage',
  component: FlashMessage,
} as Meta;
