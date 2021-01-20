// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { CodeBlock } from './CodeBlock';

export default {
  title: 'Display/CodeBlock',
  component: CodeBlock,
  argTypes: {},
} as Meta;

const Template: Story = (args) => <CodeBlock {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
