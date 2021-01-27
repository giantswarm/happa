import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import AppDetail, { IAppDetailProps } from './AppDetails';
import markdownSample from './markdown_sample.md';

export default {
  title: 'Display/Apps/AppDetail',
  component: AppDetail,
} as Meta;

const Template: Story<IAppDetailProps> = (args) => <AppDetail {...args} />;

export const WithReadme = Template.bind({});
WithReadme.args = {
  appTitle: 'efk-stack-app',
  appIconURL: 'https://dummyimage.com/125/125/fff',
  catalogName: 'Giant Swarm Managed',
  chartVersion: 'v0.3.2',
  createDate: new Date(2021, 0, 1),
  includesVersion: 'v1.9.0',
  description: 'Open Distro for ElasticSearch',
  website: 'github.com/giantswarm/efk-stack-app',
  keywords: ['elk', 'database', 'fluentd', 'logging', 'search'],
  readme: markdownSample,
};

export const WithoutReadme = Template.bind({});
WithoutReadme.args = {
  appTitle: 'efk-stack-app',
  appIconURL: 'https://dummyimage.com/125/125/fff',
  catalogName: 'Giant Swarm Managed',
  chartVersion: 'v0.3.2',
  createDate: new Date(2021, 0, 1),
  includesVersion: 'v1.9.0',
  description: 'Open Distro for ElasticSearch',
  website: 'github.com/giantswarm/efk-stack-app',
  keywords: ['elk', 'database', 'fluentd', 'logging', 'search'],
};
