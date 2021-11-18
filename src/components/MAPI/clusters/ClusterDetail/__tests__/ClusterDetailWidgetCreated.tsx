import { screen } from '@testing-library/react';
import sub from 'date-fns/fp/sub';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import { renderWithTheme } from 'test/renderUtils';

import ClusterDetailWidgetCreated from '../ClusterDetailWidgetCreated';

describe('ClusterDetailWidgetCreated', () => {
  it('renders without crashing', () => {
    renderWithTheme(ClusterDetailWidgetCreated, {});
  });

  it('displays loading animations if the cluster is still loading', () => {
    renderWithTheme(ClusterDetailWidgetCreated, {
      cluster: undefined,
    });

    expect(screen.getAllByLabelText('Loading...').length).toEqual(2);
  });

  it('displays the absolute date when the cluster was created', () => {
    renderWithTheme(ClusterDetailWidgetCreated, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    });

    expect(screen.getByLabelText('Created')).toBeInTheDocument();
    expect(screen.getByText('27 Apr 2021, 10:46 UTC'));
  });

  it('displays the date when the cluster was created, relative to now', () => {
    const creationDate = sub({
      hours: 1,
    })(new Date());

    const cluster: typeof capiv1alpha3Mocks.randomCluster1 = {
      ...capiv1alpha3Mocks.randomCluster1,
      metadata: {
        ...capiv1alpha3Mocks.randomCluster1.metadata,
        creationTimestamp: creationDate.toISOString(),
      },
    };

    renderWithTheme(ClusterDetailWidgetCreated, {
      cluster,
    });

    expect(screen.getByLabelText('Created')).toBeInTheDocument();
    expect(screen.getByText('about 1 hour ago'));
  });
});
