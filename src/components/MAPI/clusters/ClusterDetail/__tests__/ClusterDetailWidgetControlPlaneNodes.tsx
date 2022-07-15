import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Providers, StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capg1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as infrav1alpha3Mocks from 'test/mockHttpCalls/infrastructurev1alpha3';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import { usePermissionsForCPNodes } from '../../permissions/usePermissionsForCPNodes';
import ClusterDetailWidgetControlPlaneNodes from '../ClusterDetailWidgetControlPlaneNodes';

function getComponent(
  props: React.ComponentPropsWithoutRef<
    typeof ClusterDetailWidgetControlPlaneNodes
  >
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetControlPlaneNodes {...p} />
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

describe('ClusterDetailWidgetControlPlaneNodes', () => {
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
      })
    );

    expect(screen.getAllByLabelText('Loading...').length).toEqual(2);
  });
});

describe('ClusterDetailWidgetControlPlaneNodes on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;

    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays the number of control plane nodes that are ready on Azure', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList2);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster2,
      })
    );

    expect(
      await screen.findByLabelText('0 of 1 control plane node ready')
    ).toBeInTheDocument();
  });

  it('displays if all control planes are ready on Azure', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList1);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
      })
    );

    expect(
      await screen.findByLabelText('Control plane node ready')
    ).toBeInTheDocument();
  });

  it('displays if the cluster is not in an availability zone', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList2);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster2,
      })
    );

    expect(await screen.findByText('Availability zones'));
    expect(await screen.findByLabelText('no information available'));
  });

  it(`displays the cluster's availability zone`, async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList1);

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
      })
    );

    expect(await screen.findByText('Availability zone'));
    expect(await screen.findByText('2'));
  });
});

describe('ClusterDetailWidgetControlPlaneNodes on AWS', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AWS;

    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays if control plane is ready', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Dc7hm5`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1G8sControlPlaneList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Dc7hm5`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSControlPlaneList
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS1,
      })
    );

    expect(
      await screen.findByLabelText('Control plane node ready')
    ).toBeInTheDocument();
  });

  it('displays if HA control plane is ready', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Das81f`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS2G8sControlPlaneList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Das81f`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS2AWSControlPlaneList
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS2,
      })
    );

    expect(
      await screen.findByLabelText('All 3 control plane nodes ready')
    ).toBeInTheDocument();
  });

  it(`displays the cluster's availability zone`, async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Dc7hm5`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1G8sControlPlaneList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Dc7hm5`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSControlPlaneList
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS1,
      })
    );

    expect(await screen.findByText('Availability zone'));
    expect(await screen.findByTitle('eu-central-1a'));
  });

  it(`displays the cluster's availability zones (HA)`, async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Das81f`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS2G8sControlPlaneList
      );
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3Das81f`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS2AWSControlPlaneList
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterAWS2,
      })
    );

    expect(await screen.findByText('Availability zones'));
    expect(await screen.findByTitle('eu-central-1a'));
    expect(await screen.findByTitle('eu-central-1b'));
    expect(await screen.findByTitle('eu-central-1c'));
  });
});

describe('ClusterDetailWidgetControlPlaneNodes on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;

    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays if the control plane is ready', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machines/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3Dm317f%2Ccluster.x-k8s.io%2Fcontrol-plane%3D`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterGCP1MachineList);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3Dm317f%2Ccluster.x-k8s.io%2Frole%3Dcontrol-plane`
      )
      .reply(
        StatusCodes.Ok,
        capg1beta1Mocks.randomClusterGCP1GCPMachineTemplateListCP
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
      })
    );

    expect(
      await screen.findByLabelText('All 3 control plane nodes ready')
    ).toBeInTheDocument();
  });

  it(`displays the cluster's availability zones`, async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machines/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3Dm317f%2Ccluster.x-k8s.io%2Fcontrol-plane%3D`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterGCP1MachineList);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3Dm317f%2Ccluster.x-k8s.io%2Frole%3Dcontrol-plane`
      )
      .reply(
        StatusCodes.Ok,
        capg1beta1Mocks.randomClusterGCP1GCPMachineTemplateListCP
      );

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomClusterGCP1,
      })
    );

    expect(await screen.findByText('Zones'));
    expect(await screen.findByTitle('europe-west3-a'));
    expect(await screen.findByTitle('europe-west3-b'));
    expect(await screen.findByTitle('europe-west3-c'));
  });
});
