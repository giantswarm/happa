import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import AppsListPage, { IAppsListPageProps } from './AppsListPage';
import CatalogLabel from './CatalogLabel';

export default {
  title: 'Display/Apps/AppsListPage',
  component: AppsListPage,
} as Meta;

const Template: Story<IAppsListPageProps> = (args) => (
  <AppsListPage {...args} />
);

export const Standard = Template.bind({});
Standard.args = {
  matchCount: 10,
  onChangeFacets: () => {},
  apps: [
    {
      name: 'g8s-prometheus',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'apm-server',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elastabot',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elastic-stack',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elasticsearch-curator',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'fluentd',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-mongodb-exporter',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-pushgateway',
      catalogTitle: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-postgres-exporter',
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
