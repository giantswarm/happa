import { Story } from '@storybook/react';
import React from 'react';

import CLIGuide from '..';
import CLIGuideStep from '../CLIGuideStep';
import CLIGuideStepList from '../CLIGuideStepList';

export const Simple: Story<React.ComponentPropsWithoutRef<typeof CLIGuide>> = (
  args
) => {
  return <CLIGuide {...args} />;
};

Simple.args = {
  title: 'Get some data from the somewhere',
  children: (
    <CLIGuideStepList>
      <CLIGuideStep
        title='1. Make sure you are a boss'
        command='some command --some-flag'
      />
      <CLIGuideStep
        title='2. Maybe check again if you are still a boss'
        command='some-other-cli checkboss'
      />
    </CLIGuideStepList>
  ),
};

Simple.argTypes = {
  title: { control: { type: 'text' } },
};
