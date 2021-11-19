import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import * as React from 'react';
import { SWRConfig } from 'swr';
import * as applicationv1alpha1Mocks from 'test/mockHttpCalls/applicationv1alpha1';
import * as authorizationv1Mocks from 'test/mockHttpCalls/authorizationv1';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import * as capiexpv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3/exp';
import * as capzv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3';
import * as capzexpv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3/exp';
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

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useParams: jest.fn().mockReturnValue({ orgId: 'org1' }),
}));

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');
jest.unmock('model/services/mapi/securityv1alpha1/getOrganizationList');

describe('OrganizationDetailGeneral', () => {
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
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
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
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
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
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
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
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'cluster.x-k8s.io/v1alpha3',
        items: [
          {
            apiVersion: 'cluster.x-k8s.io/v1alpha3',
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
                'giantswarm.io/organization': 'org1',
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
                  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
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
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
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

  it('displays various stats about the resources that belong to the organization', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomClusterList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster2.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList2);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/azuremachines/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster3.metadata.name}%2Ccluster.x-k8s.io%2Fcontrol-plane%3Dtrue`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureMachineList3);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/release.giantswarm.io/v1alpha1/releases/${releasev1alpha1Mocks.v14_1_5.metadata.name}/`
      )
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.v14_1_5);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/release.giantswarm.io/v1alpha1/releases/${releasev1alpha1Mocks.v13_1_0.metadata.name}/`
      )
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.v13_1_0);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster1.metadata.name}`
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
        `/apis/exp.cluster.x-k8s.io/v1alpha3/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster2.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiexpv1alpha3Mocks.randomCluster2MachinePoolList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachinepools/${capzexpv1alpha3Mocks.randomCluster2AzureMachinePool1.metadata.name}/`
      )
      .reply(
        StatusCodes.Ok,
        capzexpv1alpha3Mocks.randomCluster2AzureMachinePool1
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${capiv1alpha3Mocks.randomCluster3.metadata.name}`
      )
      .reply(
        StatusCodes.Ok,
        capiexpv1alpha3Mocks.randomCluster3MachinePoolList
      );

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster1.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.randomCluster1AppsList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster2.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.randomCluster2AppsList);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/application.giantswarm.io/v1alpha1/namespaces/${capiv1alpha3Mocks.randomCluster3.metadata.name}/apps/`
      )
      .reply(StatusCodes.Ok, applicationv1alpha1Mocks.randomCluster3AppsList);

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
      expect(screen.getByLabelText('Nodes')).toHaveTextContent('3')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Worker nodes')).toHaveTextContent('12')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in nodes')).toHaveTextContent(
        '52 GB'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in worker nodes')).toHaveTextContent(
        '206 GB'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in nodes')).toHaveTextContent('24')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in worker nodes')).toHaveTextContent(
        '96'
      )
    );

    // Releases summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Oldest release')).toHaveTextContent(
        '13.1.0'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Oldest release Kubernetes version')
      ).toHaveTextContent('1.17')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Newest release')).toHaveTextContent(
        '14.1.5'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Newest release Kubernetes version')
      ).toHaveTextContent('1.19')
    );

    // Apps summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Apps in use')).toHaveTextContent('12')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('App deployments')).toHaveTextContent('14')
    );
  });

  it('displays various stats about the resources that belong to the organization', async () => {
    // eslint-disable-next-line no-magic-numbers
    jest.setTimeout(10000);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomClusterList);

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
      expect(screen.getByLabelText('Nodes')).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Worker nodes')).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in nodes')).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Memory in worker nodes')).toHaveTextContent(
        'n/a'
      )
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in nodes')).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('CPU in worker nodes')).toHaveTextContent(
        'n/a'
      )
    );

    // Releases summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Oldest release')).toHaveTextContent(
        '13.1.0'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Oldest release Kubernetes version')
      ).toHaveTextContent('n/a')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('Newest release')).toHaveTextContent(
        '14.1.5'
      )
    );
    await waitFor(() =>
      expect(
        screen.getByLabelText('Newest release Kubernetes version')
      ).toHaveTextContent('n/a')
    );

    // Apps summary.
    await waitFor(() =>
      expect(screen.getByLabelText('Apps in use')).toHaveTextContent('0')
    );
    await waitFor(() =>
      expect(screen.getByLabelText('App deployments')).toHaveTextContent('0')
    );
  });
});
