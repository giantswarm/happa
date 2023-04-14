import { action } from '@storybook/addon-actions';
import { StoryFn } from '@storybook/react';
import React, { ComponentPropsWithoutRef } from 'react';

import VersionPicker from '../VersionPicker';

export const Simple: StoryFn<ComponentPropsWithoutRef<typeof VersionPicker>> = (
  args
) => {
  return (
    <VersionPicker
      onChange={action('changed')}
      selectedVersion={args.selectedVersion}
      versions={[
        {
          created: '2020-12-15T16:39:27Z',
          includesVersion: '2.0.0',
          chartVersion: '1.0.5',
          test: false,
        },
        {
          created: '2020-12-14T16:39:27Z',
          includesVersion: '1.0.0',
          chartVersion: '1.0.3',
          test: false,
        },
        {
          created: '2020-12-13T16:39:27Z',
          includesVersion: '1.0.0',
          chartVersion: '1.0.2',
          test: false,
        },
        {
          created: '2020-12-12T16:39:27Z',
          includesVersion: '1.0.0',
          chartVersion: '0.8.9',
          test: false,
        },
        {
          created: '2020-12-11T16:39:27Z',
          includesVersion: '1.0.0',
          chartVersion: '0.8.8',
          test: false,
        },
        {
          created: '2020-12-10T16:39:27Z',
          includesVersion: '1.0.0',
          chartVersion: '0.8.7',
          test: false,
        },
        {
          created: '2020-11-10T16:39:27Z',
          includesVersion: '1.0.0',
          chartVersion: '0.8.6',
          test: false,
        },
        {
          created: '2020-10-10T16:39:27Z',
          includesVersion: '1.0.0',
          chartVersion: '0.8.5',
          test: false,
        },
        {
          created: '2020-09-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.4',
          test: false,
        },
        {
          created: '2020-08-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.3',
          test: false,
        },
        {
          created: '2020-07-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.2',
          test: false,
        },
        {
          created: '2020-06-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.1',
          test: false,
        },
        {
          created: '2020-05-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.8.0',
          test: false,
        },
        {
          created: '2020-04-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.7.10',
          test: false,
        },
        {
          created: '2020-03-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.7.8',
          test: false,
        },
        {
          created: '2020-02-10T16:39:27Z',
          includesVersion: '0.0.0',
          chartVersion: '0.7.3',
          test: false,
        },
      ]}
    />
  );
};

Simple.args = {
  selectedVersion: '1.0.2',
};

Simple.argTypes = {
  selectedVersion: {
    description: 'The version selected when rendering the component',
    control: { type: 'text' },
  },
};
