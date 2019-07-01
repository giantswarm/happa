// import { mount } from 'enzyme';
import '@testing-library/react/cleanup-after-each';
import 'jest-dom/extend-expect';
import { render } from '@testing-library/react';
import React from 'react';
import ReactDOM from 'react-dom';
import Tab from 'react-bootstrap/lib/Tab';

import Tabs from '../tabs';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Tabs />, div);
});

it('renders only the first tab', () => {
  const div = document.createElement('div');
  ReactDOM.render(
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
    </Tabs>,
    div
  );

  expect(div.querySelector('#tabs-pane-1')).toBeVisible();
});
