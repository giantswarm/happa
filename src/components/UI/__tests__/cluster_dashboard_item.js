import 'jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ThemeProvider } from 'emotion-theming';
import ClusterDashboardItem from 'UI/cluster_dashboard_item';
import React from 'react';
import theme from 'styles/theme';

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(<ClusterDashboardItem />, div);
});

it('has links to the cluster detail page', () => {
  const href = '/organizations/acme/clusters/1234';
  const { container, debug } = render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={['/']}>
        <ClusterDashboardItem cluster={{ owner: 'acme', id: '1234' }} />
      </MemoryRouter>
    </ThemeProvider>
  );

  const links = container.querySelectorAll('a');

  expect(links[0]).toHaveAttribute('href', href);
  expect(links[1]).toHaveAttribute('href', href);
});

it('shows the clusters name', () => {
  //
});

it('has links to the clusters release version', () => {
  //
});

it('shows a relative creation date', () => {
  //
});

it('shows a nodepool count if the cluster has nodepools', () => {
  //
});

it('shows storage count if we are on kvm', () => {
  //
});

it('shows CPU cores count', () => {
  //
});

it('shows Memory GB count', () => {
  //
});

it('shows a Get Started button if the cluster is less than 30 days old', () => {
  //
});
