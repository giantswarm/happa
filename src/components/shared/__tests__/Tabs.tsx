import { fireEvent, render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import { getComponentWithStore, initialStorage } from 'testUtils/renderUtils';

import { Tabs } from '../Tabs';

describe('Tabs', () => {
  const renderComponent = (
    props: Partial<React.ComponentProps<typeof Tabs>> = {},
    history = createMemoryHistory()
  ) => {
    return render(
      getComponentWithStore(Tabs, props, {}, initialStorage, history)
    );
  };

  it('renders without crashing', () => {
    renderComponent();
  });

  it('renders only the first tab', () => {
    const { queryByText } = renderComponent({
      children: [
        <Tab key={1} eventKey={1} title='first'>
          <h1>First Tab</h1>
        </Tab>,
        <Tab key={2} eventKey={2} title='second'>
          <h1>Second Tab</h1>
        </Tab>,
        <Tab key={3} eventKey={3} title='third'>
          <h1>Third Tab</h1>
        </Tab>,
      ],
    });

    expect(queryByText(/first tab/i)).toBeInTheDocument();
    expect(queryByText(/second tab/i)).not.toBeInTheDocument();
    expect(queryByText(/third tab/i)).not.toBeInTheDocument();
  });

  it(`changes the URL when switching tabs, if the 'useRoutes' option is enabled`, () => {
    const history = createMemoryHistory();
    const { getByText } = renderComponent(
      {
        children: [
          <Tab key={1} eventKey='/' title='First tab'>
            <h1>First Content</h1>
          </Tab>,
          <Tab key={2} eventKey='/second-tab' title='Second Tab'>
            <h1>Second Content</h1>
          </Tab>,
          <Tab key={3} eventKey='/third-tab' title='Third Tab'>
            <h1>Third Content</h1>
          </Tab>,
        ],
        useRoutes: true,
      },
      history
    );

    fireEvent.click(getByText(/second tab/i));
    expect(history.location.pathname).toBe('/second-tab');

    fireEvent.click(getByText(/third tab/i));
    expect(history.location.pathname).toBe('/third-tab');

    fireEvent.click(getByText(/first tab/i));
    expect(history.location.pathname).toBe('/');
  });
});
