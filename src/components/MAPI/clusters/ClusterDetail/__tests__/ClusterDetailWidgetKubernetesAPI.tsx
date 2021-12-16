import { screen } from '@testing-library/react';
import { usePermissionsForKeyPairs } from 'MAPI/keypairs/permissions/usePermissionsForKeyPairs';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import { renderWithStore } from 'test/renderUtils';

import ClusterDetailWidgetKubernetesAPI from '../ClusterDetailWidgetKubernetesAPI';

const defaultPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
};

jest.mock('MAPI/keypairs/permissions/usePermissionsForKeypairs');

describe('ClusterDetailWidgetKubernetesAPI', () => {
  it('renders without crashing', () => {
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    renderWithStore(ClusterDetailWidgetKubernetesAPI, {});
  });

  it('displays loading animations if the cluster is still loading', () => {
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: undefined,
    });

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    });

    expect(screen.getByText('https://test.k8s.gs.com')).toBeInTheDocument();
  });

  it('displays the getting started button', () => {
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    });

    expect(
      screen.getByRole('button', {
        name: 'Get started',
      })
    ).toBeInTheDocument();
  });

  it('does not display the getting started button if the user does not have permission to create key pairs', () => {
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canCreate: false,
    });

    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1alpha3Mocks.randomCluster1,
    });

    expect(
      screen.queryByRole('button', {
        name: 'Get started',
      })
    ).not.toBeInTheDocument();
  });
});
