import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import MultiSelect from '..';

export const Simple: Story<ComponentPropsWithoutRef<typeof MultiSelect>> = (
  args
) => {
  const [selected, setSelected] = useState(args.selected!);

  const onRemoveValue = (option: string) => {
    setSelected(selected.filter((selectedOption) => selectedOption !== option));
  };

  return (
    <MultiSelect
      {...args}
      selected={selected}
      onRemoveValue={onRemoveValue}
      onChange={(e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        setSelected(e.value);
      }}
    />
  );
};

Simple.args = {
  id: 'pet',
  options: [
    'A dog',
    'A cat',
    'A frog',
    'A shark',
    'A ghost',
    'A snake',
    'A camel',
  ],
  placeholder: 'Just select something...',
  selected: [],
  label: 'Pets I want to get',
};

Simple.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
  options: { control: { type: 'array' } },
  selected: { control: { type: 'array' } },
};
