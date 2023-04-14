import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import FileInput from '..';

export const Info: StoryFn<ComponentPropsWithoutRef<typeof FileInput>> = (
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

Info.args = {
  info: 'Upload a resume',
};

Info.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
