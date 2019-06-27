import { mount } from 'enzyme';
import React from 'react';
import ReactDOM from 'react-dom';
import Tab from 'react-bootstrap/lib/Tab';

import Tabs from './tabs';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Tabs />, div);
});

it('renders only the first tab', () => {
  const tabs = mount(
    <Tabs>
      <Tab eventKey={1} title='first'>
        <h1>First Tab</h1>
      </Tab>
      <Tab eventKey={2} title='second'>
        <h1>Second Tab</h1>
      </Tab>
      <Tab eventKey={3} title='third'>
        <h1>Third Tab</h1>
      </Tab>
    </Tabs>
  );

  expect(tabs.find('#tabs-pane-1').hasClass('active')).toEqual(true);

  expect(tabs.find('#tabs-pane-2').hasClass('active')).toEqual(false);

  expect(tabs.find('#tabs-pane-3').hasClass('active')).toEqual(false);
});
