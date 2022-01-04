import { fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as mockCapiv1alpha3 from 'test/mockHttpCalls/capiv1alpha3';
import * as capzv1alpha3Mocks from 'test/mockHttpCalls/capzv1alpha3';
import * as securityv1alpha1Mocks from 'test/mockHttpCalls/securityv1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import { usePermissionsForClusters } from '../../permissions/usePermissionsForClusters';
import ClusterDetail from '../';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetail>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetail {...p} />
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
  useRouteMatch: jest.fn().mockReturnValue({
    url: '',
    params: {
      orgId: 'org1',
      clusterId: mockCapiv1alpha3.randomCluster1.metadata.name,
    },
  }),
}));

jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');

jest.mock('MAPI/clusters/permissions/usePermissionsForClusters');

describe('ClusterDetail', () => {
  it('renders without crashing', () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    render(getComponent({}));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(1);
  });

  it(`displays the cluster's description`, async () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

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
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/${
          mockCapiv1alpha3.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1alpha3.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureCluster1);

    render(getComponent({}));

    expect(await screen.findByText('Random Cluster')).toBeInTheDocument();
  });

  it(`can edit the cluster's description`, async () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

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
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/${
          mockCapiv1alpha3.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1alpha3.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1alpha3.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1alpha3.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/${
          mockCapiv1alpha3.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1alpha3.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1alpha3.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...mockCapiv1alpha3.randomCluster1,
        metadata: {
          ...mockCapiv1alpha3.randomCluster1.metadata,
          annotations: {
            ...mockCapiv1alpha3.randomCluster1.metadata.annotations,
            'cluster.giantswarm.io/description': 'Some Cluster',
          },
        },
      });

    render(getComponent({}));

    fireEvent.click(await screen.findByText('Random Cluster'));
    fireEvent.change(screen.getByDisplayValue('Random Cluster'), {
      target: { value: 'Some Cluster' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));

    expect(
      await screen.findByText(`Successfully updated the cluster's description`)
    ).toBeInTheDocument();
  });

  it('does not allow editing the cluster description if the user does not have permissions to do so', async () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue({
      ...defaultPermissions,
      canUpdate: false,
    });

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
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/${
          mockCapiv1alpha3.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1alpha3.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1alpha3Mocks.randomAzureCluster1);

    render(getComponent({}));

    fireEvent.click(await screen.findByText('Random Cluster'));

    expect(
      screen.queryByLabelText(`cluster description`)
    ).not.toBeInTheDocument();
  });
});
