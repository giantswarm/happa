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
  onChangeFacets: (value, checked) => {
    console.log(value, checked);
  },
  apps: [
    {
      name: 'g8s-prometheus',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'apm-server',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elastabot',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elastic-stack',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'elasticsearch-curator',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'fluentd',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-mongodb-exporter',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-pushgateway',
      catalogName: 'Some Catalog',
      catalogIconUrl: '',
      to: '',
    },
    {
      name: 'prometheus-postgres-exporter',
      catalogName: 'Some Catalog',
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
  onChangeFacets: (value, checked) => {
    console.log(value, checked);
  },
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
