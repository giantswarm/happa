import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForCPNodes } from 'MAPI/clusters/permissions/usePermissionsForCPNodes';
import { Providers, StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capav1beta1Mocks from 'test/mockHttpCalls/capav1beta1';
import * as capgv1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailWidgetVersions from '../ClusterDetailWidgetVersions';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetVersions>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetVersions {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    undefined,
    undefined,
    history,
    auth
  );
}

const defaultPermissions = {
  canGet: true,
  canList: true,
  canUpdate: true,
  canCreate: true,
  canDelete: true,
};

jest.mock('MAPI/clusters/permissions/usePermissionsForCPNodes');

describe('ClusterDetailWidgetVersions', () => {
  beforeAll(() => {
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(
      getComponent({
        cluster: undefined,
        providerCluster: undefined,
      })
    );

    expect(screen.getAllByLabelText('Loading...').length).toEqual(1);
  });
});

describe('ClusterDetailWidgetVersions on GCP', () => {
  const provider = window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays the cluster app version', () => {
    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
        providerCluster: capgv1beta1Mocks.randomGCPCluster1,
      })
    );

    expect(
      screen.getByLabelText('Cluster app version: 0.15.1')
    ).toBeInTheDocument();
  });

  it(`displays a link to the cluster app version's release notes`, () => {
    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
        providerCluster: capgv1beta1Mocks.randomGCPCluster1,
      })
    );

    const releaseNotesLink = screen.getByLabelText(
      'Cluster app version 0.15.1 release notes'
    );
    expect(releaseNotesLink).toBeInTheDocument();

    expect(releaseNotesLink).toHaveAttribute(
      'href',
      'https://github.com/giantswarm/cluster-gcp/releases/tag/v0.15.1'
    );
  });

  it('displays the Kubernetes version of the control plane', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machines/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterGCP1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3D`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterGCP1MachineList);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
        providerCluster: capgv1beta1Mocks.randomGCPCluster1,
      })
    );

    expect(
      await screen.findByLabelText('Kubernetes version: 1.22.10')
    ).toBeInTheDocument();
  });

  it('displays if the Kubernetes version cannot be determined', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machines/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterGCP1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3D`
      )
      .reply(StatusCodes.BadRequest);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
        providerCluster: capgv1beta1Mocks.randomGCPCluster1,
      })
    );

    expect(
      await screen.findByLabelText(
        'Kubernetes version: no information available'
      )
    ).toBeInTheDocument();
  });
});

describe('ClusterDetailWidgetVersions on CAPA', () => {
  const provider = window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays the cluster app version', () => {
    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterCAPA1,
        providerCluster: capav1beta1Mocks.randomAWSCluster1,
      })
    );

    expect(
      screen.getByLabelText('Cluster app version: 0.9.2')
    ).toBeInTheDocument();
  });

  it(`displays a link to the cluster app version's release notes`, () => {
    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterCAPA1,
        providerCluster: capav1beta1Mocks.randomAWSCluster1,
      })
    );

    const releaseNotesLink = screen.getByLabelText(
      'Cluster app version 0.9.2 release notes'
    );
    expect(releaseNotesLink).toBeInTheDocument();

    expect(releaseNotesLink).toHaveAttribute(
      'href',
      'https://github.com/giantswarm/cluster-aws/releases/tag/v0.9.2'
    );
  });
});

describe('ClusterDetailWidgetVersions on CAPZ', () => {
  const provider = window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPZ;
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
  });
  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays the cluster app version', () => {
    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterCAPZ1,
        providerCluster: capzv1beta1Mocks.randomAzureClusterCAPZ1,
      })
    );

    expect(
      screen.getByLabelText('Cluster app version: 0.0.15')
    ).toBeInTheDocument();
  });

  it(`displays a link to the cluster app version's release notes`, () => {
    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterCAPZ1,
        providerCluster: capzv1beta1Mocks.randomAzureClusterCAPZ1,
      })
    );

    const releaseNotesLink = screen.getByLabelText(
      'Cluster app version 0.0.15 release notes'
    );
    expect(releaseNotesLink).toBeInTheDocument();

    expect(releaseNotesLink).toHaveAttribute(
      'href',
      'https://github.com/giantswarm/cluster-azure/releases/tag/v0.0.15'
    );
  });

  it('displays the Kubernetes version of the control plane', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machines/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterCAPZ1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3D`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterCAPZ1MachineList);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterCAPZ1,
        providerCluster: capzv1beta1Mocks.randomAzureClusterCAPZ1,
      })
    );

    expect(
      await screen.findByLabelText('Kubernetes version: 1.24.11')
    ).toBeInTheDocument();
  });
});
