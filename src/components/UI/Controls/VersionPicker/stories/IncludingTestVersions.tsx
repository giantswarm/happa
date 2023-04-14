import { action } from '@storybook/addon-actions';
import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import VersionPicker from '../VersionPicker';

export const IncludingTestVersions: StoryFn<
  ComponentPropsWithoutRef<typeof VersionPicker>
> = (args) => {
  return (
    <VersionPicker
      onChange={action('changed')}
      selectedVersion={args.selectedVersion}
      versions={[
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '1.0.5',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '1.0.4-test',
          test: true,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '1.0.3',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '1.0.2-test',
          test: true,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.9',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.8-test',
          test: true,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.7',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.6-test',
          test: true,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.5',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.4',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.3',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.2',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.1',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.0',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.7.10',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.7.8',
          test: false,
        },
        {
          created: '2021-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.7.3',
          test: false,
        },
      ]}
    />
  );
};

IncludingTestVersions.args = {
  selectedVersion: '1.0.5',
};

IncludingTestVersions.argTypes = {
  selectedVersion: {
    description: 'The version selected when rendering the component',
    control: {
      type: 'text',
    },
  },
};
