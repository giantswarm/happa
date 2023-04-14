import { Meta, StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import ComponentChangelog from '..';

const Template: StoryFn<ComponentPropsWithoutRef<typeof ComponentChangelog>> = (
  args
) => <ComponentChangelog name={args.name} changes={args.changes} />;

export const Simple = Template.bind({});
Simple.args = {
  name: 'mycomponent',
  changes: ['Fix update process node termination in http://example.com/.'],
};

export const MultiParagraph = Template.bind({});
MultiParagraph.args = {
  name: 'kubernetes',
  changes: [
    `Here is a long component change description that shows us how a changelog item consisting of several paragraphs would be rendered.

  Here is the second and last line of the markdown text.`,
    'This is a second change item.',
  ],
};

export const Complex = Template.bind({});
Complex.args = {
  name: 'kubernetes',
  changes: [
    'Mount `/var/log` directory in an EBS volume.',
    'Use proper hostname annotation for nodes.',
    'Update to 1.13.4 ([CVE-2019-1002100](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-1002100)).',
  ],
};

export default {
  title: 'Display/Releases/ComponentChangelog',
  component: ComponentChangelog,
} as Meta;
