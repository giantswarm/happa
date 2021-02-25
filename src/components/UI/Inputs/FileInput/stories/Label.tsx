import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import FileInput from '..';

export const Label: Story<ComponentPropsWithoutRef<typeof FileInput>> = (
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

Label.args = {
  id: 'resume',
  label: 'Resume',
};

Label.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
