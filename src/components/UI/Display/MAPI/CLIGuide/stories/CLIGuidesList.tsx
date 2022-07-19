import { Story } from '@storybook/react';
import React from 'react';

import CLIGuide from '..';
import CLIGuidesList from '../CLIGuidesList';
import CLIGuideStep from '../CLIGuideStep';
import CLIGuideStepList from '../CLIGuideStepList';

export const Simple: Story<
  React.ComponentPropsWithoutRef<typeof CLIGuidesList>
> = (args) => {
  return <CLIGuidesList {...args} />;
};

Simple.args = {
  title: 'Use the API to …',
  children: (
    <CLIGuide title='Get some data from the somewhere'>
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
    </CLIGuide>
  ),
};

Simple.argTypes = {
  title: { control: { type: 'text' } },
};
