import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import React from 'react';
import { getComponentWithStore, initialStorage } from 'testUtils/renderUtils';

import { Tab, Tabs } from '..';

describe('Tabs', () => {
  const renderComponent = (
    props: Partial<React.ComponentProps<typeof Tabs>> = {
      children: [],
    },
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
    renderComponent({
      children: [
        <Tab key='tab-1' title='first'>
          <h1>First Tab</h1>
        </Tab>,
        <Tab key='tab-2' title='second'>
          <h1>Second Tab</h1>
        </Tab>,
        <Tab key='tab-3' title='third'>
          <h1>Third Tab</h1>
        </Tab>,
      ],
    });

    expect(screen.queryByText(/first tab/i)).toBeInTheDocument();
    expect(screen.queryByText(/second tab/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/third tab/i)).not.toBeInTheDocument();
  });

  it(`changes the URL when switching tabs, if the 'useRoutes' option is enabled`, () => {
    const history = createMemoryHistory();

    renderComponent(
      {
        children: [
          <Tab key='tab-1' path='/' title='First tab'>
            <h1>First Content</h1>
          </Tab>,
          <Tab key='tab-2' path='/second-tab' title='Second Tab'>
            <h1>Second Content</h1>
          </Tab>,
          <Tab key='tab-3' path='/third-tab' title='Third Tab'>
            <h1>Third Content</h1>
          </Tab>,
        ],
        useRoutes: true,
      },
      history
    );

    fireEvent.click(screen.getByText(/second tab/i));
    expect(history.location.pathname).toBe('/second-tab');

    fireEvent.click(screen.getByText(/third tab/i));
    expect(history.location.pathname).toBe('/third-tab');

    fireEvent.click(screen.getByText(/first tab/i));
    expect(history.location.pathname).toBe('/');
  });

  it('renders a basic tab layout', () => {
    const { container } = renderComponent({
      children: [
        <Tab key='tab-1' title='first'>
          <h1>First Tab</h1>
        </Tab>,
        <Tab key='tab-2' title='second'>
          <h1>Second Tab</h1>
        </Tab>,
        <Tab key='tab-3' title='third'>
          <h1>Third Tab</h1>
        </Tab>,
      ],
    });

    expect(container.firstChild).toMatchSnapshot();
  });
});
