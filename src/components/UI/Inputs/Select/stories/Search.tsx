import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import Select from '..';

export const Search: Story<ComponentPropsWithoutRef<typeof Select>> = (
  args
) => {
  const [value, setValue] = useState(args.value);

  const initialOptions = args.options as string[];
  const [filteredOptions, setFilteredOptions] = useState(initialOptions);

  const searchFor = (query: string) => {
    const results = initialOptions.filter((option) => {
      return option.toLowerCase().includes(query.toLowerCase());
    });

    setFilteredOptions(results);
  };

  return (
    <Select
      {...args}
      value={value}
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      onChange={(e) => setValue(e.target.option)}
      options={filteredOptions}
      onSearch={searchFor}
    />
  );
};

Search.args = {
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
  searchPlaceholder: 'Search for a pet...',
  emptySearchMessage: 'No pets found.',
  dropHeight: 'medium',
};

Search.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
