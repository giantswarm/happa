import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import TextInput from 'UI/Inputs/TextInput';

import InputGroup from '..';

export const Simple: StoryFn<ComponentPropsWithoutRef<typeof InputGroup>> = (
  args
) => {
  const [someText, setSomeText] = useState('');
  const [someCheckBox, setSomeCheckBox] = useState(false);

  return (
    <InputGroup {...args}>
      <TextInput
        id='some-text'
        label='Some text input'
        value={someText}
        onChange={(e) => setSomeText(e.target.value)}
      />
      <CheckBoxInput
        id='some-checkbox'
        label='Ready to go'
        checked={someCheckBox}
        onChange={(e) => setSomeCheckBox(e.target.checked)}
        fieldLabel='Some checkbox input'
      />
    </InputGroup>
  );
};

Simple.args = {
  label: 'A nice group of inputs',
};

Simple.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
