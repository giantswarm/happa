import { screen } from '@testing-library/react';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import { renderWithStore } from 'test/renderUtils';

import ClusterDetailWidgetKubernetesAPI from '../ClusterDetailWidgetKubernetesAPI';

describe('ClusterDetailWidgetKubernetesAPI', () => {
  it('renders without crashing', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {});
  });

  it('displays loading animations if the cluster is still loading', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: undefined,
    });

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    });

    expect(screen.getByText('https://test.k8s.gs.com')).toBeInTheDocument();
  });

  it('displays the getting started button', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    });

    expect(
      screen.getByRole('button', {
        name: 'Get started',
      })
    ).toBeInTheDocument();
  });
});
