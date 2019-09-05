import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import configureStore from 'stores/configureStore';
import mockedNodePool from 'test_utils/mocked_node_pool';
import React from 'react';
import theme from 'styles/theme';

// Components
import ClusterDetailIndex from '../index';
import ClusterDetailView from '../cluster_detail_view';
import Layout from 'layout';
import NodePool from '../node_pool';
import NodePoolDropdownMenu from '../node_pool_dropdown_menu';

it('shows the dropdown when the three dots button is clicked', () => {
  const div = document.createElement('div');
  const { getByText, getByRole } = render(
    <ThemeProvider theme={theme}>
      <NodePoolDropdownMenu render={{ isOpen: true }} />
    </ThemeProvider>,
    div
  );
  fireEvent.click(getByText('•••'));
  const menu = getByRole('menu');
  expect(menu).toBeInTheDocument();
});

it('renders all node pools passed as props', () => {
  // To be implemented
});

it('patches node pool name correctly', () => {
  // To be implemented
});

/** TODO This test is failing because ClusterDetailView is not loading.
 * Steps I think we should folow to solve this:
 *  1. Learn how to mock the redux store because I think that this is the problem here
 *  2. Extract providers and mocked data into reusable wrapping functions
 * *
 * Alternative approach: use Cypress for these kind of testing where different
 * components are involved.
 */
it.skip('shows the modal when the button is clicked', async () => {
  const div = document.createElement('div');
  const store = configureStore({
    app: { firstLoadComplete: true },
    entities: { nodePools: { [mockedNodePool.id]: mockedNodePool } },
  });

  const { getByText, getByRole, debug } = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={['/']}>
          <Layout firstLoadComplete={true}>
            <ClusterDetailIndex>
              <ClusterDetailView
                cluster={{ id: 'm0ckd' }}
                organizationId='acme'
              >
                <NodePool
                  availableZonesGridTemplateAreas={'ab'}
                  nodePool={mockedNodePool}
                >
                  <NodePoolDropdownMenu render={{ isOpen: true }} />
                </NodePool>
              </ClusterDetailView>
            </ClusterDetailIndex>
          </Layout>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>,
    div
  );

  await wait(() => getByText('•••'));
  debug();

  fireEvent.click(getByText('•••'));
  const menu = getByRole('menu');
  expect(menu).toBeInTheDocument();

  fireEvent.click(getByText(/edit scaling limits/i));
  const modal = getByRole('dialog');
  expect(modal).toBeInTheDocument();
});
