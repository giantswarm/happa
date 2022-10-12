import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { usePermissionsForClusters } from 'MAPI/clusters/permissions/usePermissionsForClusters';
import { usePermissionsForCPNodes } from 'MAPI/clusters/permissions/usePermissionsForCPNodes';
import { usePermissionsForOrganizations } from 'MAPI/organizations/permissions/usePermissionsForOrganizations';
import { usePermissionsForReleases } from 'MAPI/releases/permissions/usePermissionsForReleases';
import { usePermissionsForNodePools } from 'MAPI/workernodes/permissions/usePermissionsForNodePools';
import { Providers, StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import * as React from 'react';
import { SWRConfig } from 'swr';
import * as authorizationv1Mocks from 'test/mockHttpCalls/authorizationv1';
import * as capav1beta1Mocks from 'test/mockHttpCalls/capav1beta1';
import * as capgv1beta1Mocks from 'test/mockHttpCalls/capgv1beta1';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as infrav1alpha3Mocks from 'test/mockHttpCalls/infrastructurev1alpha3';
import * as releasev1alpha1Mocks from 'test/mockHttpCalls/releasev1alpha1';
import * as securityv1alpha1Mocks from 'test/mockHttpCalls/securityv1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import OrganizationDetailGeneral from '../';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof OrganizationDetailGeneral>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <OrganizationDetailGeneral {...p} />
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

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn().mockReturnValue({ orgId: 'org1' }),
}));

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');
jest.unmock('model/services/mapi/securityv1alpha1/getOrganizationList');

jest.mock('MAPI/clusters/permissions/usePermissionsForClusters');
jest.mock('MAPI/clusters/permissions/usePermissionsForCPNodes');
jest.mock('MAPI/workernodes/permissions/usePermissionsForNodePools');
jest.mock('MAPI/releases/permissions/usePermissionsForReleases');
jest.mock('MAPI/organizations/permissions/usePermissionsForOrganizations');

describe('OrganizationDetailGeneral', () => {
  beforeAll(() => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  it('renders without crashing', () => {
    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );
  });

  it('provides the ability to delete an organization', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .delete('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/')
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListOrgs
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationListResponse);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        items: [],
        kind: 'ClusterList',
      });

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    const deleteButton = await screen.findByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Delete org1'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText('Organization org1 deleted successfully.')
    ).toBeInTheDocument();
  });

  it('is not possible to delete an organization if it is managed by GitOps', async () => {
    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
        isManagedByGitOps: true,
      })
    );

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.queryByText('Delete organization')).not.toBeInTheDocument();
  });

  it('displays an error if deleting an organization fails', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .delete('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.InternalServerError, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'There was a huge problem.',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.InternalError,
        code: StatusCodes.InternalServerError,
      });

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        items: [],
        kind: 'ClusterList',
      });

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    const deleteButton = await screen.findByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Delete org1'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText('Could not delete organization org1:')
    ).toBeInTheDocument();
    expect(screen.getByText('There was a huge problem.')).toBeInTheDocument();
  });

  it('can cancel deletion', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        items: [],
        kind: 'ClusterList',
      });

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    const deleteButton = await screen.findByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Cancel'));

    await waitForElementToBeRemoved(
      screen.getByText('Do you really want to delete organization org1?')
    );
  });

  it('cannot delete the organization if there are still clusters that belong to it', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        items: [
          {
            apiVersion: 'cluster.x-k8s.io/v1beta1',
            kind: 'Cluster',
            metadata: {
              annotations: {
                'cluster.giantswarm.io/description': 'Unnamed cluster',
              },
              creationTimestamp: '2021-04-21T17:23:11Z',
              labels: {
                'azure-operator.giantswarm.io/version': '5.5.2',
                'cluster-operator.giantswarm.io/version': '0.23.22',
                'cluster.x-k8s.io/cluster-name': 'ed30d',
                'giantswarm.io/cluster': 'ed30d',
                'release.giantswarm.io/version': '14.1.4',
              },
              spec: {
                clusterNetwork: {
                  apiServerPort: 443,
                  serviceDomain: 'cluster.local',
                  services: {
                    cidrBlocks: ['172.31.0.0/16'],
                  },
                },
                controlPlaneEndpoint: {
                  host: '',
                  port: 0,
                },
                infrastructureRef: {
                  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
                  kind: 'AzureCluster',
                  name: 'ed30d',
                  namespace: 'org-org1',
                },
              },
            },
          },
        ],
        kind: 'ClusterList',
      });

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    await screen.findByText('Delete this organization');

    const deleteButton = screen.queryByText('Delete organization');
    expect(deleteButton).not.toBeInTheDocument();

    await waitFor(() => expect(nock.isDone()).toBeTruthy());
  });

  it('can delete the organization if the cluster CRD is not ensured', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);
    nock(window.config.mapiEndpoint)
      .delete('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/')
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListOrgs
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationListResponse);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.NotFound);

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    const deleteButton = await screen.findByText('Delete organization');
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);
    fireEvent.click(screen.getByText('Delete org1'));

    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    expect(
      await screen.findByText('Organization org1 deleted successfully.')
    ).toBeInTheDocument();
  });

  it('does not allow deletion if the user does not have permissions to do so', async () => {
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canDelete: false,
    });

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        items: [],
        kind: 'ClusterList',
      });

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    const deleteButton = await screen.findByText('Delete organization');
    expect(deleteButton).toBeDisabled();
  });
});

describe('OrganizationDetailGeneral on Azure', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AZURE;

    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays various stats about the resources that belong to the organization', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList2);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster3.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureMachineList3);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/release.giantswarm.io/v1alpha1/releases/${releasev1alpha1Mocks.v14_0_1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.v14_0_1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/release.giantswarm.io/v1alpha1/releases/${releasev1alpha1Mocks.v17_1_0.metadata.name}/`
      )
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.v17_1_0);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${capiv1beta1Mocks.randomCluster1.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiexpv1alpha3Mocks.randomCluster1MachinePoolList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/${capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capzexpv1alpha3Mocks.randomCluster1AzureMachinePool1
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/${capzexpv1alpha3Mocks.randomCluster1AzureMachinePool2.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capzexpv1alpha3Mocks.randomCluster1AzureMachinePool2
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/namespaces/${capiv1beta1Mocks.randomCluster2.metadata.namespace}/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomCluster2.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiexpv1alpha3Mocks.randomCluster2MachinePoolList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${capiv1beta1Mocks.randomCluster3.metadata.namespace}/machinepools/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomCluster3.metadata.name}`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster3MachinePoolList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachinepools/${capiv1beta1Mocks.randomCluster3MachinePool1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomCluster3AzureMachinePool1);

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    // Clusters summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Workload clusters')).toHaveTextContent('3')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Control plane nodes')).toHaveTextContent(
        '3'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Worker nodes')).toHaveTextContent('12')
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Memory in control plane nodes')
      ).toHaveTextContent('52 GB')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in worker nodes')).toHaveTextContent(
        '206 GB'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('CPU in control plane nodes')
      ).toHaveTextContent('24')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in worker nodes')).toHaveTextContent(
        '96'
      )
    );

    // Releases summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Oldest release')).toHaveTextContent(
        '14.0.1'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Oldest release Kubernetes version')
      ).toHaveTextContent('1.18')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Newest release')).toHaveTextContent(
        '17.1.0'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Newest release Kubernetes version')
      ).toHaveTextContent('1.22')
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Releases in use')).toHaveTextContent('3')
    );
  });

  it('displays if stats for resources are not available', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterList);

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    // Clusters summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Workload clusters')).toHaveTextContent('3')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Control plane nodes')).toHaveTextContent(
        'n/a'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Worker nodes')).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Memory in control plane nodes')
      ).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in worker nodes')).toHaveTextContent(
        'n/a'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('CPU in control plane nodes')
      ).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in worker nodes')).toHaveTextContent(
        'n/a'
      )
    );

    // Releases summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Oldest release')).toHaveTextContent(
        '14.0.1'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Oldest release Kubernetes version')
      ).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Newest release')).toHaveTextContent(
        '17.1.0'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Newest release Kubernetes version')
      ).toHaveTextContent('n/a')
    );

    await waitFor(() =>
      expect(screen.getByLabelText('Releases in use')).toHaveTextContent('3')
    );
  });
});

describe('OrganizationDetailGeneral on AWS', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.AWS;

    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays various stats about the resources that belong to the organization', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterListAWS);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSControlPlaneList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1G8sControlPlaneList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awscontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS2.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS2AWSControlPlaneList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/g8scontrolplanes/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS2.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS2G8sControlPlaneList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${capiv1beta1Mocks.randomClusterAWS1MachineDeploymentList.items[0].metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS1AWSMachineDeployment1
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1beta1Mocks.randomClusterAWS2.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterAWS2MachineDeploymentList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsmachinedeployments/${capiv1beta1Mocks.randomClusterAWS2MachineDeploymentList.items[0].metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        infrav1alpha3Mocks.randomClusterAWS2AWSMachineDeployment
      );

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    // Clusters summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Workload clusters')).toHaveTextContent('2')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Control plane nodes')).toHaveTextContent(
        '4'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Worker nodes')).toHaveTextContent('12')
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Memory in control plane nodes')
      ).toHaveTextContent('64 GB')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in worker nodes')).toHaveTextContent(
        '144 GB'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('CPU in control plane nodes')
      ).toHaveTextContent('16')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in worker nodes')).toHaveTextContent(
        '36'
      )
    );
  });
});

describe('OrganizationDetailGeneral on GCP', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.GCP;

    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays various stats about the resources that belong to the organization', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterListGCP);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machines/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterListGCP.items[0].metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3D`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterGCP1MachineList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machines/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterListGCP.items[0].metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3D`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterGCP1MachineList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterListGCP.items[0].metadata.name}%2Ccluster.x-k8s.io%2Frole%3Dcontrol-plane`
      )
      .reply(
        StatusCodes.Ok,
        capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplateListCP
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinedeployments/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterListGCP.items[0].metadata.name}%2Ccluster.x-k8s.io%2Frole%21%3Dbastion`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/gcpmachinetemplates/${capiv1beta1Mocks.randomClusterGCP1MachineDeploymentList.items[0].spec?.template.spec.infrastructureRef.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capgv1beta1Mocks.randomClusterGCP1GCPMachineTemplate
      );

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    // Clusters summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Workload clusters')).toHaveTextContent('2')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Control plane nodes')).toHaveTextContent(
        '3'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Worker nodes')).toHaveTextContent('3')
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Memory in control plane nodes')
      ).toHaveTextContent('49 GB')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in worker nodes')).toHaveTextContent(
        '49 GB'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('CPU in control plane nodes')
      ).toHaveTextContent('12')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in worker nodes')).toHaveTextContent(
        '12'
      )
    );

    // Releases.
    expect(screen.queryByText('Releases')).not.toBeInTheDocument();

    // Versions.
    await waitFor(() =>
      expect(screen.getByText('Versions')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Cluster app version')).toHaveTextContent(
        '0.15.1, 0.15.2'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Kubernetes version')).toHaveTextContent(
        '1.22'
      )
    );
  });
});

describe('OrganizationDetailGeneral on CAPA', () => {
  const provider: PropertiesOf<typeof Providers> =
    window.config.info.general.provider;

  beforeAll(() => {
    window.config.info.general.provider = Providers.CAPA;

    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForCPNodes as jest.Mock).mockReturnValue(defaultPermissions);
    (usePermissionsForNodePools as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForReleases as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );
  });

  afterAll(() => {
    window.config.info.general.provider = provider;
  });

  it('displays various stats about the resources that belong to the organization', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomClusterListCAPA);
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/machinepools/?labelSelector=cluster.x-k8s.io%2Fcluster-name%3D${capiv1beta1Mocks.randomClusterCAPA1.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiv1beta1Mocks.randomClusterCAPA1MachinePoolList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/awsmachinepools/${capiv1beta1Mocks.randomClusterCAPA1MachinePoolList.items[0].spec?.template.spec?.infrastructureRef.name}/`
      )
      .reply(StatusCodes.Ok, capav1beta1Mocks.randomClusterCAPA1AWSMachinePool);

    render(
      getComponent({
        organizationName: 'org1',
        organizationNamespace: 'org-org1',
      })
    );

    // Clusters summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Workload clusters')).toHaveTextContent('2')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Worker nodes')).toHaveTextContent('3')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in worker nodes')).toHaveTextContent(
        '48 GB'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in worker nodes')).toHaveTextContent(
        '12'
      )
    );

    // Releases.
    expect(screen.queryByText('Releases')).not.toBeInTheDocument();

    // Versions.
    await waitFor(() =>
      expect(screen.getByText('Versions')).toBeInTheDocument()
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Cluster app version')).toHaveTextContent(
        '0.9.2, 0.9.3'
      )
    );
  });
});
