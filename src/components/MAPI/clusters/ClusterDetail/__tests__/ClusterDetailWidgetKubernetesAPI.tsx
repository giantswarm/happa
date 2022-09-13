import { screen } from '@testing-library/react';
import { Providers } from 'model/constants';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import { renderWithStore } from 'test/renderUtils';

import { usePermissionsForKeyPairs } from '../../../keypairs/permissions/usePermissionsForKeyPairs';
import ClusterDetailWidgetKubernetesAPI from '../ClusterDetailWidgetKubernetesAPI';

const defaultPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
};

jest.mock('MAPI/keypairs/permissions/usePermissionsForKeyPairs');

describe('ClusterDetailWidgetKubernetesAPI', () => {
  beforeAll(() => {
    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  it('renders without crashing', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {});
  });

  it('displays loading animations if the cluster is still loading', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: undefined,
    });

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetKubernetesAPI on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;

    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1beta1Mocks.randomCluster1,
    });

    expect(screen.getByText('https://test.k8s.gs.com')).toBeInTheDocument();
  });

  it('displays the getting started button', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1beta1Mocks.randomCluster1,
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
      cluster: capiv1beta1Mocks.randomCluster1,
    });

    expect(
      screen.queryByRole('button', {
        name: 'Get started',
      })
    ).not.toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetKubernetesAPI on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const audience = window.config.audience;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
    window.config.audience = 'https://api.test.gigantic.io';

    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.audience = audience;
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1beta1Mocks.randomClusterGCP1,
    });

    expect(
      screen.getByText(
        `https://api.${capiv1beta1Mocks.randomClusterGCP1.metadata.name}.gigantic.io`
      )
    ).toBeInTheDocument();
  });
});
