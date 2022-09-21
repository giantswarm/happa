import { Meta } from '@storybook/react';
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { Tabs } from '..';

export { Simple } from './Simple';

const store = createStore((state) => state);

export default {
  title: 'Layout/Tabs',
  component: Tabs,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    ),
  ],
} as Meta;
