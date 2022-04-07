import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import add from 'date-fns/fp/add';
import format from 'date-fns/fp/format';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as mockCapiv1beta1 from 'test/mockHttpCalls/capiv1beta1';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as releasev1alpha1Mocks from 'test/mockHttpCalls/releasev1alpha1';
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
      clusterId: mockCapiv1beta1.randomCluster1.metadata.name,
    },
  }),
}));

jest.unmock('model/services/mapi/securityv1alpha1/getOrganization');

jest.mock('MAPI/clusters/permissions/usePermissionsForClusters');
jest.mock('MAPI/releases/permissions/usePermissionsForReleases', () => ({
  ...jest.requireActual('MAPI/releases/permissions/usePermissionsForReleases'),
  usePermissionsForReleases: jest.fn().mockReturnValue(defaultPermissions),
}));

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
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

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
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...mockCapiv1beta1.randomCluster1,
        metadata: {
          ...mockCapiv1beta1.randomCluster1.metadata,
          annotations: {
            ...mockCapiv1beta1.randomCluster1.metadata.annotations,
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
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, mockCapiv1beta1.randomCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

    render(getComponent({}));

    fireEvent.click(await screen.findByText('Random Cluster'));

    expect(
      screen.queryByLabelText(`cluster description`)
    ).not.toBeInTheDocument();
  });

  it('displays a warning when cluster creation in progress', async () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...mockCapiv1beta1.randomCluster1,
        status: {
          ...mockCapiv1beta1.randomCluster1.status,
          conditions: [
            {
              status: 'True',
              type: 'Creating',
              lastTransitionTime: '2020-04-01T12:00:00Z',
            },
          ],
        },
      });

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

    render(getComponent({}));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    const clusterStatus = screen.getByTestId('cluster-status');
    expect(clusterStatus).toBeInTheDocument();
    expect(
      within(clusterStatus).getByText(
        'The cluster is currently being created. This step usually takes about 15 minutes.'
      )
    ).toBeInTheDocument();
  });

  it('does not display a warning when cluster upgrade in progress', async () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...mockCapiv1beta1.randomCluster1,
        status: {
          ...mockCapiv1beta1.randomCluster1.status,
          conditions: [
            {
              status: 'True',
              type: 'Upgrading',
              reason: 'UpgradePending',
              lastTransitionTime: '2020-04-01T12:00:00Z',
            },
          ],
        },
      });

    render(getComponent({}));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.queryByTestId('cluster-status')).not.toBeInTheDocument();
  });

  it('does not display a warning when cluster upgrade available', async () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...mockCapiv1beta1.randomCluster1,
        status: {
          ...mockCapiv1beta1.randomCluster1.status,
          conditions: [
            {
              status: 'False',
              type: 'Creating',
              reason: 'CreationCompleted',
              lastTransitionTime: '2020-04-01T12:00:00Z',
            },
            {
              status: 'True',
              type: 'Ready',
              lastTransitionTime: '2020-04-01T12:01:00Z',
            },
          ],
        },
      });

    render(getComponent({}));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.queryByTestId('cluster-status')).not.toBeInTheDocument();
  });

  it('does not display a warning when cluster upgrade scheduled', async () => {
    (usePermissionsForClusters as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .get('/apis/security.giantswarm.io/v1alpha1/organizations/org1/')
      .reply(StatusCodes.Ok, securityv1alpha1Mocks.getOrganizationByName);

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/${
          mockCapiv1beta1.randomCluster1.metadata.namespace
        }/azureclusters/${
          mockCapiv1beta1.randomCluster1.spec!.infrastructureRef!.name
        }/`
      )
      .reply(StatusCodes.Ok, capzv1beta1Mocks.randomAzureCluster1);

    const targetTime = `${format('dd MMM yy HH:mm')(
      add({ days: 1 })(new Date())
    )} UTC`;
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/${securityv1alpha1Mocks.getOrganizationByName.status.namespace}/clusters/${mockCapiv1beta1.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...mockCapiv1beta1.randomCluster1,
        metadata: {
          ...mockCapiv1beta1.randomCluster1.metadata,
          annotations: {
            ...mockCapiv1beta1.randomCluster1.metadata.annotations,
            'alpha.giantswarm.io/update-schedule-target-release': '15.0.0',
            'alpha.giantswarm.io/update-schedule-target-time': targetTime,
          },
        },
      });

    render(getComponent({}));

    if (screen.queryAllByText('Loading...').length > 0) {
      await waitForElementToBeRemoved(() =>
        screen.queryAllByText('Loading...')
      );
    }

    expect(screen.queryByTestId('cluster-status')).not.toBeInTheDocument();
  });
});
