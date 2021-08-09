import { Meta, Story } from '@storybook/react';
import { Text } from 'grommet';
import React, { ComponentPropsWithoutRef } from 'react';

import OptionalValue from '../OptionalValue';

export const ValueIsLoading: Story<
  ComponentPropsWithoutRef<typeof OptionalValue>
> = (args) => {
  return (
    <OptionalValue {...args}>{(value) => <Text>{value}</Text>}</OptionalValue>
  );
};

ValueIsLoading.args = {
  value: undefined,
};

export const ValueLoaded: Story<
  ComponentPropsWithoutRef<typeof OptionalValue>
> = (args) => {
  return (
    <OptionalValue {...args}>{(value) => <Text>{value}</Text>}</OptionalValue>
  );
};

ValueLoaded.args = {
  value: 'Some value',
};

export const ValueIsFalsy: Story<
  ComponentPropsWithoutRef<typeof OptionalValue>
> = (args) => {
  return (
    <OptionalValue {...args}>{(value) => <Text>{value}</Text>}</OptionalValue>
  );
};

ValueIsFalsy.args = {
  value: '',
};

export default {
  title: 'Display/OptionalValue',
  component: OptionalValue,
} as Meta;
