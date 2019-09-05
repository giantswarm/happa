import 'jest-dom/extend-expect';
import { render } from '@testing-library/react';
import React from 'react';
import ClusterDashboardItem from 'UI/cluster_dashboard_item';

it('renders without crashing', () => {
  const div = document.createElement('div');
  render(<ClusterDashboardItem />, div);
});
