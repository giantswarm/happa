import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import TextInput from '..';

export const Suggestions: Story<ComponentPropsWithoutRef<typeof TextInput>> = (
  args
) => {
  const [value, setValue] = useState(args.value);
  const [suggestions, setSuggestions] = useState(args.suggestions as string[]);

  const handleSuggestionSelect = (e: { suggestion: string }) => {
    setValue(e.suggestion);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);

    setSuggestions(suggestions.filter((s) => s.includes(e.target.value)));
  };

  return (
    <TextInput
      {...args}
      value={value}
      onChange={handleChange}
      onSuggestionSelect={handleSuggestionSelect}
    />
  );
};

Suggestions.args = {
  value: 'Hi people',
  label: 'Some input',
  suggestions: ['value1', 'value2', 'value3'],
};

Suggestions.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
