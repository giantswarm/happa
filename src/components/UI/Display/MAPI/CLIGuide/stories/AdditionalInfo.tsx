import { Story } from '@storybook/react';
import React from 'react';

import CLIGuide from '..';
import CLIGuideAdditionalInfo from '../CLIGuideAdditionalInfo';
import CLIGuideStep from '../CLIGuideStep';
import CLIGuideStepList from '../CLIGuideStepList';

export const AdditionalInfo: Story<
  React.ComponentPropsWithoutRef<typeof CLIGuide>
> = (args) => {
  return <CLIGuide {...args} />;
};

AdditionalInfo.args = {
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
  footer: (
    <CLIGuideAdditionalInfo
      links={[
        {
          label: 'Giant Swarm Home',
          href: 'https://giantswarm.io',
          external: true,
        },
        {
          label: 'Some page',
          href: '/some-page/',
        },
      ]}
    />
  ),
};

AdditionalInfo.argTypes = {
  title: { control: { type: 'text' } },
};
