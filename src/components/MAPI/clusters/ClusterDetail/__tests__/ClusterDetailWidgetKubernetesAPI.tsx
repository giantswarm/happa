import { screen } from '@testing-library/react';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import { renderWithStore } from 'testUtils/renderUtils';

import ClusterDetailWidgetKubernetesAPI from '../ClusterDetailWidgetKubernetesAPI';

type ComponentProps = React.ComponentPropsWithoutRef<
  typeof ClusterDetailWidgetKubernetesAPI
>;

describe('ClusterDetailWidgetKubernetesAPI', () => {
  it('renders without crashing', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {} as ComponentProps);
  });

  it('displays loading animations if the cluster is still loading', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: undefined,
    } as ComponentProps);

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    } as ComponentProps);

    expect(screen.getByText('https://test.k8s.gs.com')).toBeInTheDocument();
  });

  it('displays the getting started button', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    } as ComponentProps);

    expect(
      screen.getByRole('button', {
        name: 'Get Started',
      })
    ).toBeInTheDocument();
  });
});
