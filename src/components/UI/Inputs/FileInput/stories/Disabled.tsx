import { Story } from '@storybook/react/types-6-0';
import React, { ComponentPropsWithoutRef, useState } from 'react';

import FileInput from '..';

export const Disabled: Story<ComponentPropsWithoutRef<typeof FileInput>> = (
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

Disabled.args = {
  disabled: true,
};

Disabled.argTypes = {
  label: { control: { type: 'text' } },
  error: { control: { type: 'text' } },
  info: { control: { type: 'text' } },
  help: { control: { type: 'text' } },
};
