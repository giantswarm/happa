import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import FileInput from '..';

export const Error: StoryFn<ComponentPropsWithoutRef<typeof FileInput>> = (
  args
) => {
  const [value, setValue] = useState<FileList | null>(null);

  return (
    <FileInput
      {...args}
      value={value}
      onChange={(e) => setValue(e.target.files)}
    />
  );
};

Error.args = {
  error: 'Oh no',
};

Error.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
