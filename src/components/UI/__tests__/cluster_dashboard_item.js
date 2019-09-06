import 'jest-dom/extend-expect';
import { createMemoryHistory } from 'history';
import { MemoryRouter, Router } from 'react-router-dom';
import { fireEvent, render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import ClusterDashboardItem from 'UI/cluster_dashboard_item';
import React from 'react';
import theme from 'styles/theme';

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(<ClusterDashboardItem />, div);
});

it('has links to the cluster detail page', () => {
  const history = createMemoryHistory({ initialEntries: ['/'] });

  const expectedHref = '/organizations/acme/clusters/12345';
  const { container, debug } = render(
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <ClusterDashboardItem cluster={{ owner: 'acme', id: '12345' }} />
      </Router>
      )
    </ThemeProvider>
  );

  // Check if the links are going to the right place.
  const links = container.querySelectorAll('a');
  expect(links[0]).toHaveAttribute('href', expectedHref);
  expect(links[1]).toHaveAttribute('href', expectedHref);

  // Now click on one of them.
  fireEvent(
    links[1],
    new MouseEvent('click', { bubbles: true, cancelable: true })
  );

  // And see if the router has changed location.
  expect(history.location.pathname).toEqual(expectedHref);
});

it('shows the clusters name', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <ClusterDashboardItem cluster={{ name: 'My name' }} />
      </MemoryRouter>
    </ThemeProvider>
  );

  const element = getByText('My name');

  expect(element).toBeInTheDocument();
});

it('shows the clusters release version', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <ClusterDashboardItem cluster={{ release_version: '8.2.0' }} />
      </MemoryRouter>
    </ThemeProvider>
  );

  const element = getByText('8.2.0');

  expect(element).toBeInTheDocument();
});

it('shows a nodepool count if the cluster has nodepools', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <ClusterDashboardItem cluster={{ nodePools: [1, 2, 3, 4] }} />
      </MemoryRouter>
    </ThemeProvider>
  );

  const element = getByText('4 node pools,');

  expect(element).toBeInTheDocument();
});

it('shows storage count if we are on kvm', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <ClusterDashboardItem
          cluster={{
            kvm: true,
            status: {
              cluster: {
                nodes: [
                  { labels: { 'kubernetes.io/role': 'master' } },
                  { labels: [] },
                  { labels: [] },
                ],
              },
            },
            workers: [{ storage: { size_gb: 20 } }, {}, {}],
          }}
        />
      </MemoryRouter>
    </ThemeProvider>
  );

  const element = getByText('40.00 GB storage');

  expect(element).toBeInTheDocument();
});

it('shows CPU cores count', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <ClusterDashboardItem
          cluster={{
            kvm: true,
            status: {
              cluster: {
                nodes: [
                  { labels: { 'kubernetes.io/role': 'master' } },
                  { labels: [] },
                  { labels: [] },
                  { labels: [] },
                  { labels: [] },
                ],
              },
            },
            workers: [{ cpu: { cores: 1 } }, {}, {}, {}],
          }}
        />
      </MemoryRouter>
    </ThemeProvider>
  );

  const element = getByText('4 CPU cores');

  expect(element).toBeInTheDocument();
});

it('shows Memory GB count', () => {
  const { getByText } = render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <ClusterDashboardItem
          cluster={{
            kvm: true,
            status: {
              cluster: {
                nodes: [
                  { labels: { 'kubernetes.io/role': 'master' } },
                  { labels: [] },
                  { labels: [] },
                  { labels: [] },
                  { labels: [] },
                ],
              },
            },
            workers: [{ memory: { size_gb: 1 } }, {}, {}, {}],
          }}
        />
      </MemoryRouter>
    </ThemeProvider>
  );

  const element = getByText('4.00 GB RAM');

  expect(element).toBeInTheDocument();
});

// TODO: Find out how to mock Date globally, or change relativeDate() so that it takes a current date param.
it('shows a relative creation date', () => {
  // To be implemented
});

it('shows a Get Started button if the cluster is less than 30 days old', () => {
  // To be implemented
});
