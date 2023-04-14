import { Meta, StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import { CodeBlock, Output, Prompt } from './CodeBlock';

export default {
  title: 'Display/Documentation/CodeBlock',
  component: CodeBlock,
  subcomponents: { Prompt, Output },
  argTypes: {},
} as Meta;

const Template: StoryFn<ComponentPropsWithoutRef<typeof CodeBlock>> = (
  args
) => <CodeBlock {...args} />;

export const SinglePrompt = Template.bind({});
SinglePrompt.args = {
  children: <Prompt>kubectl get pods</Prompt>,
};

export const PromptWithOutput = Template.bind({});
PromptWithOutput.args = {
  children: [
    <Prompt key={0}>
      {`
      kubectl apply -f helloworld-manifest.yaml
    `}
    </Prompt>,
    <Output key={1}>
      {`
      service/helloworld created
      deployment.apps/helloworld created
      poddisruptionbudget.policy/helloworld-pdb created
      ingress.networking.k8s.io/helloworld created
    `}
    </Output>,
  ],
};
