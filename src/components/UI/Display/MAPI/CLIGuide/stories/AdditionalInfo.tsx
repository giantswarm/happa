import { Story } from '@storybook/react';
import { Box, Text } from 'grommet';
import React from 'react';
import { CodeBlock, Prompt } from 'UI/Display/Documentation/CodeBlock';

import CLIGuide from '..';
import CLIGuideAdditionalInfo from '../CLIGuideAdditionalInfo';

export const AdditionalInfo: Story<
  React.ComponentPropsWithoutRef<typeof CLIGuide>
> = (args) => {
  return <CLIGuide {...args} />;
};

AdditionalInfo.args = {
  title: 'Get some data from the somewhere',
  children: (
    <Box direction='column' gap='small'>
      <Box direction='column' gap='small'>
        <Text>1. Make sure you are a boss</Text>
        <CodeBlock>
          <Prompt>some command --some-flag</Prompt>
        </CodeBlock>
      </Box>
      <Box direction='column' gap='small'>
        <Text>2. Maybe check again if you are still a boss</Text>
        <CodeBlock>
          <Prompt>some-other-cli checkboss</Prompt>
        </CodeBlock>
      </Box>
    </Box>
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
