import { Meta, Story } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';
import Button from 'UI/Controls/Button';

import { DotSeparatedList, DotSeparatedListItem } from '../DotSeparatedList';

export const Default: Story<
  ComponentPropsWithoutRef<typeof DotSeparatedList>
> = (args) => {
  return (
    <DotSeparatedList {...args}>
      <DotSeparatedListItem>1</DotSeparatedListItem>
      <DotSeparatedListItem>2</DotSeparatedListItem>
      <DotSeparatedListItem>3</DotSeparatedListItem>
    </DotSeparatedList>
  );
};

export const WithOtherComponents: Story<
  ComponentPropsWithoutRef<typeof DotSeparatedList>
> = (args) => {
  return (
    <DotSeparatedList align='center' {...args}>
      <DotSeparatedListItem>
        <Button primary={true}>Primary</Button>
      </DotSeparatedListItem>
      <DotSeparatedListItem>
        <Button>Secondary</Button>
      </DotSeparatedListItem>
      <DotSeparatedListItem>
        <Button primary={true} size='small'>
          Small Primary
        </Button>
      </DotSeparatedListItem>
    </DotSeparatedList>
  );
};

export default {
  title: 'Display/DotSeparatedList',
  component: DotSeparatedList,
} as Meta;
