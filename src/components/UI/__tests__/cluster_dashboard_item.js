import 'jest-dom/extend-expect';
import { render } from '@testing-library/react';
import React from 'react';
import ClusterDashboardItem from 'UI/cluster_dashboard_item';

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(<ClusterDashboardItem />, div);
});

it('has links to the cluster detail page', () => {
  //
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
