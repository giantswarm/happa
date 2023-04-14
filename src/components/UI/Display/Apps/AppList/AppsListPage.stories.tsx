import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import AppsListPage, { IAppsListPageProps } from './AppsListPage';
import CatalogLabel from './CatalogLabel';

export default {
  title: 'Display/Apps/AppsListPage',
  component: AppsListPage,
} as Meta;

const Template: StoryFn<IAppsListPageProps> = (args) => (
  <AppsListPage {...args} />
);

export const Standard = Template.bind({});
Standard.args = {
  matchCount: 10,
  onChangeFacets: () => {},
  apps: [
    {
      name: 'g8s-prometheus',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'apm-server',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elastabot',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elastic-stack',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elasticsearch-curator',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'fluentd',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-mongodb-exporter',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-pushgateway',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-postgres-exporter',
      appIconURL: '',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
  ],
  facetOptions: [
    {
      value: 'giantswarm',
      label: (
        <CatalogLabel
          catalogName='Giant Swarm'
          iconUrl='/images/repo_icons/managed.png'
          isManaged
        />
      ),
      checked: true,
    },
    {
      value: 'giantswarm-playground',
      label: (
        <CatalogLabel
          catalogName='Giant Swarm Playground'
          iconUrl='/images/repo_icons/incubator.png'
        />
      ),
      checked: false,
    },
    {
      value: 'helm-stable',
      label: (
        <CatalogLabel
          catalogName='Helm Stable'
          iconUrl='/images/repo_icons/community.png'
        />
      ),

      checked: false,
    },
  ],
};

export const EmptyState = Template.bind({});
EmptyState.args = {
  matchCount: 0,
  onChangeFacets: () => {},
  apps: [],
  facetOptions: [
    {
      value: 'giantswarm',
      label: (
        <CatalogLabel
          catalogName='Giant Swarm'
          iconUrl='/images/repo_icons/managed.png'
          isManaged
        />
      ),
      checked: true,
    },
    {
      value: 'giantswarm-playground',
      label: (
        <CatalogLabel
          catalogName='Giant Swarm Playground'
          iconUrl='/images/repo_icons/incubator.png'
        />
      ),
      checked: false,
    },
    {
      value: 'helm-stable',
      label: (
        <CatalogLabel
          catalogName='Helm Stable'
          iconUrl='/images/repo_icons/community.png'
        />
      ),

      checked: false,
    },
  ],
};
