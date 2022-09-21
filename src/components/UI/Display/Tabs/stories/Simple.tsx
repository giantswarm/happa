import { Story } from '@storybook/react';
import React from 'react';
import { ComponentPropsWithoutRef } from 'react';

import { Tab, Tabs } from '..';

export const Simple: Story<ComponentPropsWithoutRef<typeof Tabs>> = () => {
  return (
    <Tabs>
      <Tab path='1' title='First'>
        <div>This is some content in the First tab</div>
      </Tab>
      <Tab path='2' title='Second'>
        <div>This is some content in the Second tab</div>
      </Tab>
    </Tabs>
  );
};
