import 'jest-dom/extend-expect';
import { fireEvent, render, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'emotion-theming';
import configureStore from 'stores/configureStore';
import React from 'react';
import theme from 'styles/theme';

// Components
import ClusterDetailIndex from '../index';
import ClusterDetailView from '../cluster_detail_view';
import Layout from 'layout';
import NodePool from '../node_pool';
import NodePoolDropdownMenu from '../node_pool_dropdown_menu';

// TODO Extract this in utils.
const mockedNodePool = {
  id: 'a0sdi',
  name: 'awesome-nodepool-0',
  availability_zones: ['europe-west-1a', 'europe-west-1b'],
  scaling: { Min: 3, Max: 5 },
  node_spec: {
    aws: { instance_type: 'm3.xlarge' },
    labels: ['beta-app'],
    volume_sizes: { docker: 100, kubelet: 100 },
  },
  status: { nodes: 4, nodes_ready: 4 },
  subnet: '10.0.0.0/24',
};

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

/** This test is failing because ClusterDetailView is not loading.
 * Alternative approach: use Cypress for these kind of testing where a lot of
 * components are involved.
 * When fixed we will not need the previous one.
 * TODO Fix it.
 */
it.skip('shows the modal when the button is clicked', async () => {
  const div = document.createElement('div');
  const store = configureStore({
    entities: { nodePools: { [mockedNodePool.id]: mockedNodePool } },
  });

  const nodePool = store.getState().entities.nodePools.a0sdi;

  const { getByText, getByRole, debug } = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <MemoryRouter
          initialEntries={['/organizations/acme/clusters/m0ckd/np']}
        >
          <Layout>
            <ClusterDetailIndex>
              <ClusterDetailView
                cluster={{ id: 'm0ckd' }}
                organizationId='acme'
              >
                <NodePool
                  availableZonesGridTemplateAreas={'ab'}
                  nodePool={nodePool}
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

// It shows all node pools passed as props

// It patched np name correctly
