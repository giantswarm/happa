import { screen } from '@testing-library/react';
import { ProviderFlavors, Providers } from 'model/constants';
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

describe('ClusterDetailWidgetKubernetesAPI on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;
    window.config.info.general.providerFlavor = ProviderFlavors.VINTAGE;

    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1beta1Mocks.randomCluster1,
    });

    expect(
      screen.getByText('https://api.j5y9m.k8s.test.gigantic.io:443')
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetKubernetesAPI on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;
  const audience = window.config.audience;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
    window.config.info.general.providerFlavor = ProviderFlavors.CAPI;
    window.config.audience = 'https://api.test.gigantic.io';

    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
    window.config.audience = audience;
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1beta1Mocks.randomClusterGCP1,
    });

    expect(
      screen.getByText(`https://api.m317f.gigantic.io`)
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetKubernetesAPI on CAPA', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;
    window.config.info.general.providerFlavor = ProviderFlavors.CAPI;

    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1beta1Mocks.randomClusterCAPA1,
    });

    expect(
      screen.getByText(
        `https://asdf1-apiserver-123412345.eu-west-2.elb.amazonaws.com:6443`
      )
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetKubernetesAPI on CAPA EKS', () => {});

describe('ClusterDetailWidgetKubernetesAPI on CAPZ', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;
  const providerFlavor = window.config.info.general.providerFlavor;
  const audience = window.config.audience;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPZ;
    window.config.info.general.providerFlavor = ProviderFlavors.CAPI;
    window.config.audience = 'https://api.test.gigantic.io';

    (usePermissionsForKeyPairs as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
    window.config.info.general.providerFlavor = providerFlavor;
    window.config.audience = audience;
  });

  it('displays the kubernetes API endpoint URL for the cluster', () => {
    renderWithStore(ClusterDetailWidgetKubernetesAPI, {
      cluster: capiv1beta1Mocks.randomClusterCAPZ1,
    });

    expect(
      screen.getByText(`https://api.test12.gigantic.io:6443`)
    ).toBeInTheDocument();
  });
});
