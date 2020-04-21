import '@testing-library/jest-dom/extend-expect';

import { render } from '@testing-library/react';
import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';

import Tabs from '../Tabs';

it('renders without crashing', () => {
  render(<Tabs />);
});

it('renders only the first tab', () => {
  const { container } = render(
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

  expect(container.querySelector('#tabs-pane-1')).toHaveAttribute(
    'class',
    'tab-pane active'
  );

  expect(container.querySelector('#tabs-pane-2')).toHaveAttribute(
    'class',
    'tab-pane'
  );

  expect(container.querySelector('#tabs-pane-3')).toHaveAttribute(
    'class',
    'tab-pane'
  );
});
