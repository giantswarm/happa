import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import { renderWithStore } from 'testUtils/renderUtils';

import Tabs from '../Tabs';

it('renders without crashing', () => {
  renderWithStore(Tabs);
});

it('renders only the first tab', () => {
  const { queryByText } = renderWithStore(Tabs, {
    children: [
      (<Tab key={1} eventKey={1} title='first'>
        <h1>First Tab</h1>
      </Tab>),
      (<Tab key={2} eventKey={2} title='second'>
        <h1>Second Tab</h1>
      </Tab>),
      (<Tab key={3} eventKey={3} title='third'>
        <h1>Third Tab</h1>
      </Tab>),
    ],
  });

  expect(queryByText(/first tab/i)).toBeInTheDocument();
  expect(queryByText(/second tab/i)).not.toBeInTheDocument();
  expect(queryByText(/third tab/i)).not.toBeInTheDocument();
});
