import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as metav1 from 'model/services/mapi/metav1';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as mockCapiv1alpha3 from 'test/mockHttpCalls/capiv1alpha3';
import * as securityv1alpha1Mocks from 'test/mockHttpCalls/securityv1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailWorkerNodes from '../ClusterDetailWorkerNodes';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWorkerNodes>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWorkerNodes {...p} />
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
  useParams: jest.fn().mockReturnValue({
    orgId: 'org1',
    clusterId: mockCapiv1alpha3.randomCluster1.metadata.name,
  }),
}));

jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');

describe('ClusterDetailWorkerNodes', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays an error message if the list of node pools could not be fetched', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1alpha3.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1alpha3.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1alpha3.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.NotFound, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Lolz',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.NotFound,
        code: StatusCodes.NotFound,
      });

    render(getComponent({}));

    expect(
      await screen.findByText('There was a problem loading node pools.')
    ).toBeInTheDocument();
  });

  it('displays a placeholder if there are no node pools', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1alpha3.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1alpha3.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/exp.cluster.x-k8s.io/v1alpha3/machinepools/?labelSelector=giantswarm.io%2Fcluster%3D${mockCapiv1alpha3.randomCluster1.metadata.name}`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
        kind: 'MachinePoolList',
        metadata: {},
        items: [],
      });

    render(getComponent({}));

    expect(
      await screen.findByText(
        'Add at least one node pool to the cluster so you could run workloads'
      )
    ).toBeInTheDocument();
  });
});
