import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { IMainState } from 'stores/main/types';
import { IOrganizationState } from 'stores/organization/types';
import { IState } from 'stores/state';
import { cache, SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as authorizationv1Mocks from 'testUtils/mockHttpCalls/authorizationv1';
import * as securityv1alpha1Mocks from 'testUtils/mockHttpCalls/securityv1alpha1';
import preloginState from 'testUtils/preloginState';
import { getComponentWithStore } from 'testUtils/renderUtils';

import OrganizationIndex from '../OrganizationIndex';

const defaultState: IState = {
  ...preloginState,
  main: {
    ...preloginState.main,
  } as IMainState,
  entities: {
    organizations: {
      ...preloginState.entities.organizations,
      items: {
        org1: {
          id: 'org1',
          name: 'org1',
          namespace: 'org-org1',
        },
        org2: {
          id: 'org2',
          name: 'org2',
          namespace: 'org-org2',
        },
      },
    } as IOrganizationState,
  } as IState['entities'],
} as IState;

const generateCluster = (
  orgName: string = 'org1',
  namespace: string = 'org-org1'
): capiv1alpha3.ICluster => {
  return {
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: capiv1alpha3.Cluster,
    metadata: {
      annotations: {
        'cluster.giantswarm.io/description': 'Random Cluster',
      },
      creationTimestamp: '2020-12-01T08:41:06Z',
      finalizers: [
        'operatorkit.giantswarm.io/azure-operator-cluster-controller',
      ],
      generation: 4,
      labels: {
        'azure-operator.giantswarm.io/version': '5.5.2',
        'cluster-operator.giantswarm.io/version': '0.23.22',
        'cluster.x-k8s.io/cluster-name': '0fa12',
        'giantswarm.io/cluster': '0fa12',
        'giantswarm.io/organization': orgName,
        'release.giantswarm.io/version': '13.1.0',
      },
      name: '0fa12',
      namespace,
      resourceVersion: '294578552',
      selfLink: `/apis/cluster.x-k8s.io/v1alpha3/namespaces/${namespace}/clusters/0fa12`,
      uid: '2d448421-8735-4964-929b-2adce693d874',
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
        host: 'test.k8s.gs.com',
        port: 0,
      },
      infrastructureRef: {
        apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
        kind: 'AzureCluster',
        name: '0fa12',
        namespace,
        resourceVersion: '294571809',
        uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
      },
    },
    status: {
      controlPlaneInitialized: true,
      infrastructureReady: false,
    },
  };
};

const generateClusterList = (
  items: capiv1alpha3.ICluster[]
): capiv1alpha3.IClusterList => {
  return {
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'ClusterList',
    metadata: {
      resourceVersion: '294659579',
      selfLink: '/apis/cluster.x-k8s.io/v1alpha3/clusters/',
    },
    items,
  };
};

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof OrganizationIndex>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <OrganizationIndex {...p} />
    </SWRConfig>
  );

  return getComponentWithStore(
    Component,
    props,
    defaultState,
    undefined,
    history,
    auth
  );
}

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.unmock('model/services/mapi/securityv1alpha1/getOrganizationList');

describe('OrganizationIndex', () => {
  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays organizations and their cluster counts', async () => {
    const randomClusterList = generateClusterList([
      generateCluster(),
      generateCluster(),
      generateCluster('org2', 'org-org2'),
    ]);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/clusters/')
      .reply(StatusCodes.Ok, randomClusterList);

    render(getComponent({}));

    expect(screen.getByText('org1')).toBeInTheDocument();
    expect(screen.getByText('org2')).toBeInTheDocument();

    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  it('displays the button to create an organization', () => {
    const randomClusterList = generateClusterList([]);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/clusters/')
      .reply(StatusCodes.Ok, randomClusterList);

    render(getComponent({}));

    expect(
      screen.getByRole('button', { name: 'Add organization' })
    ).toBeInTheDocument();
  });

  it('can create an organization', async () => {
    const randomClusterList = generateClusterList([]);

    nock(window.config.mapiEndpoint)
      .post('/apis/security.giantswarm.io/v1alpha1/organizations/')
      .reply(StatusCodes.Ok, {
        apiVersion: 'security.giantswarm.io/v1alpha1',
        kind: 'Organization',
        metadata: {
          name: 'some-org',
        },
        spec: {},
        status: {
          namespace: 'org-some-org',
        },
      });

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
      .get('/apis/cluster.x-k8s.io/v1alpha3/clusters/')
      .reply(StatusCodes.Ok, randomClusterList);

    render(getComponent({}));

    const addOrgnizationButton = screen.getByRole('button', {
      name: 'Add organization',
    });
    fireEvent.click(addOrgnizationButton);

    const createOrganizationButton = screen.getByRole('button', {
      name: 'Create organization',
    });
    expect(createOrganizationButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, {
      target: { value: 'some-org' },
    });

    expect(createOrganizationButton).not.toBeDisabled();

    fireEvent.click(createOrganizationButton);

    expect(await screen.findByText('some-org')).toBeInTheDocument();
    expect(
      await withMarkup(screen.findByText)(
        'Organization some-org created successfully'
      )
    );
    expect(
      screen.queryByRole('button', {
        name: 'Create organization',
      })
    ).not.toBeInTheDocument();
  });

  it('can cancel an organization creation', async () => {
    const randomClusterList = generateClusterList([]);

    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1alpha3/clusters/')
      .reply(StatusCodes.Ok, randomClusterList);

    render(getComponent({}));

    const addOrgnizationButton = screen.getByRole('button', {
      name: 'Add organization',
    });
    fireEvent.click(addOrgnizationButton);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, {
      target: { value: 'not-created-org' },
    });

    const cancelButton = screen.getByRole('button', {
      name: 'Cancel',
    });
    fireEvent.click(cancelButton);

    expect(screen.queryByText('not-created-org')).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: 'Create organization',
      })
    ).not.toBeInTheDocument();

    expect(
      await screen.findByRole('button', {
        name: 'Add organization',
      })
    ).toBeInTheDocument();
  });

  it('displays an error if an organization cannot be created', async () => {
    nock(window.config.mapiEndpoint)
      .post('/apis/security.giantswarm.io/v1alpha1/organizations/')
      .reply(StatusCodes.InternalServerError, {
        apiVersion: 'security.giantswarm.io/v1alpha1',
        kind: 'Status',
        message: 'Some error occurred',
      });

    render(getComponent({}));

    const addOrgnizationButton = screen.getByRole('button', {
      name: 'Add organization',
    });
    fireEvent.click(addOrgnizationButton);

    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, {
      target: { value: 'another-org' },
    });

    const createOrganizationButton = screen.getByRole('button', {
      name: 'Create organization',
    });
    fireEvent.click(createOrganizationButton);

    expect(
      await withMarkup(screen.findByText)(
        'Unable to create organization another-org'
      )
    );
    expect(screen.getByText('Some error occurred')).toBeInTheDocument();
  });
});
