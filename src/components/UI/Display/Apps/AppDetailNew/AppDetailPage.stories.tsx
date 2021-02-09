import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import AppDetailPage, { IAppDetailPageProps } from './AppDetailPage';
import markdownSample from './markdown_sample.md';

export default {
  title: 'Display/Apps/AppDetailPage',
  component: AppDetailPage,
} as Meta;

const Template: Story<IAppDetailPageProps> = (args) => (
  <AppDetailPage {...args} />
);

export const WithReadme = Template.bind({});
WithReadme.args = {
  appTitle: 'efk-stack-app',
  appIconURL: 'https://dummyimage.com/125/125/fff',
  catalogName: 'Giant Swarm Managed',
  chartVersion: 'v0.3.2',
  createDate: '2021-2-9',
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
  createDate: '2021-2-9',
  includesVersion: 'v1.9.0',
  description: 'Open Distro for ElasticSearch',
  website: 'github.com/giantswarm/efk-stack-app',
  keywords: ['elk', 'database', 'fluentd', 'logging', 'search'],
};
