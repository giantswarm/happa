import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import * as featureFlags from 'model/featureFlags';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as metav1 from 'model/services/mapi/metav1';
import { IMainState } from 'model/stores/main/types';
import { mapOAuth2UserToUser } from 'model/stores/main/utils';
import { IOrganizationState } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as authorizationv1Mocks from 'test/mockHttpCalls/authorizationv1';
import * as securityv1alpha1Mocks from 'test/mockHttpCalls/securityv1alpha1';
import preloginState from 'test/preloginState';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import OrganizationIndex from '../OrganizationIndex';
import { usePermissionsForOrganizations } from '../permissions/usePermissionsForOrganizations';

const generateCluster = (
  namespace: string = 'org-org1'
): capiv1beta1.ICluster => {
  return {
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: capiv1beta1.Cluster,
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
        'release.giantswarm.io/version': '13.1.0',
      },
      name: '0fa12',
      namespace,
      resourceVersion: '294578552',
      selfLink: `/apis/cluster.x-k8s.io/v1beta1/namespaces/${namespace}/clusters/0fa12`,
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
        apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
        kind: 'AzureCluster',
        name: '0fa12',
        namespace,
        resourceVersion: '294571809',
        uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
      },
    },
    status: {
      infrastructureReady: false,
    },
  };
};

const generateClusterList = (
  items: capiv1beta1.ICluster[]
): capiv1beta1.IClusterList => {
  return {
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: 'ClusterList',
    metadata: {
      resourceVersion: '294659579',
      selfLink: '/apis/cluster.x-k8s.io/v1beta1/clusters/',
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
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <OrganizationIndex {...p} />
    </SWRConfig>
  );

  const defaultState: IState = {
    ...preloginState,
    main: {
      ...preloginState.main,
      loggedInUser: mapOAuth2UserToUser(auth.loggedInUser!),
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

  return getComponentWithStore(
    Component,
    props,
    defaultState,
    undefined,
    history,
    auth
  );
}

const defaultPermissions = {
  canCreate: true,
  canDelete: true,
  canConfigure: true,
};

jest.unmock(
  'model/services/mapi/authorizationv1/createSelfSubjectAccessReview'
);
jest.unmock('model/services/mapi/securityv1alpha1/getOrganizationList');

jest.mock('../permissions/usePermissionsForOrganizations');

describe('OrganizationIndex', () => {
  it('renders without crashing', () => {
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );
    render(getComponent({}));
  });

  it('displays organizations and their cluster counts', async () => {
    featureFlags.flags.NextGenClusters.enabled = true;
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    const randomClusterList = generateClusterList([
      generateCluster(),
      generateCluster(),
      generateCluster('org-org2'),
    ]);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, randomClusterList);

    render(getComponent({}));

    expect(screen.getByText('org1')).toBeInTheDocument();
    expect(screen.getByText('org2')).toBeInTheDocument();

    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  it('displays organizations and their cluster counts for a user that doesn`t have permissions to list clusters at the cluster scope', async () => {
    featureFlags.flags.NextGenClusters.enabled = true;
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    const randomClusterList1 = generateClusterList([
      generateCluster(),
      generateCluster(),
    ]);

    const randomClusterList2 = generateClusterList([
      generateCluster('org-org2'),
    ]);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(StatusCodes.Ok, {
        ...authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope,
        status: { allowed: false },
      });
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/')
      .reply(StatusCodes.Ok, randomClusterList1);
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org2/clusters/')
      .reply(StatusCodes.Ok, randomClusterList2);

    render(getComponent({}));

    expect(screen.getByText('org1')).toBeInTheDocument();
    expect(screen.getByText('org2')).toBeInTheDocument();

    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByText('1')).toBeInTheDocument();
  });

  it('displays the button to create an organization', () => {
    featureFlags.flags.NextGenClusters.enabled = true;
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    const randomClusterList = generateClusterList([]);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, randomClusterList);

    render(getComponent({}));

    expect(
      screen.getByRole('button', { name: 'Add organization' })
    ).toBeInTheDocument();
  });

  it('can create an organization', async () => {
    featureFlags.flags.NextGenClusters.enabled = true;
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    const randomClusterList = generateClusterList([]);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
      .reply(StatusCodes.Ok, randomClusterList);

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
    featureFlags.flags.NextGenClusters.enabled = true;
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    const randomClusterList = generateClusterList([]);

    nock(window.config.mapiEndpoint)
      .post('/apis/authorization.k8s.io/v1/selfsubjectaccessreviews/', {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectAccessReview',
        spec: {
          resourceAttributes: {
            namespace: '',
            verb: 'list',
            group: 'cluster.x-k8s.io',
            resource: 'clusters',
          },
        },
      })
      .reply(
        StatusCodes.Ok,
        authorizationv1Mocks.selfSubjectAccessReviewCanListClustersAtClusterScope
      );
    nock(window.config.mapiEndpoint)
      .get('/apis/cluster.x-k8s.io/v1beta1/clusters/')
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

    expect(
      screen.queryByRole('button', {
        name: 'Create organization',
      })
    ).not.toBeInTheDocument();

    expect(screen.queryByText('not-created-org')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByDisplayValue('not-created-org')
      ).not.toBeInTheDocument()
    );

    expect(
      await screen.findByRole('button', {
        name: 'Add organization',
      })
    ).toBeInTheDocument();
  });

  it('displays an error if an organization cannot be created', async () => {
    featureFlags.flags.NextGenClusters.enabled = true;
    (usePermissionsForOrganizations as jest.Mock).mockReturnValue(
      defaultPermissions
    );

    nock(window.config.mapiEndpoint)
      .post('/apis/security.giantswarm.io/v1alpha1/organizations/')
      .reply(StatusCodes.InternalServerError, {
        apiVersion: 'v1',
        kind: 'Status',
        message: 'Some error occurred',
        status: metav1.K8sStatuses.Failure,
        reason: metav1.K8sStatusErrorReasons.InternalError,
        code: StatusCodes.InternalServerError,
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
