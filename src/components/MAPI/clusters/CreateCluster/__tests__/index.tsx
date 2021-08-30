import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as MAPIUtils from 'MAPI/utils';
import nock from 'nock';
import React from 'react';
import { Providers, StatusCodes } from 'shared/constants';
import { cache, SWRConfig } from 'swr';
import { withMarkup } from 'testUtils/assertUtils';
import * as capiv1alpha3Mocks from 'testUtils/mockHttpCalls/capiv1alpha3';
import * as capzv1alpha3Mocks from 'testUtils/mockHttpCalls/capzv1alpha3';
import * as releasev1alpha1Mocks from 'testUtils/mockHttpCalls/releasev1alpha1';
import { getComponentWithStore } from 'testUtils/renderUtils';

import * as CreateClusterUtils from '../../utils';
import ClusterCreate from '../';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterCreate>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <ClusterCreate {...p} />
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
  useRouteMatch: jest.fn().mockReturnValue({
    url: '',
    params: {
      orgId: 'org1',
    },
  }),
}));

const generateUIDMockFn = jest.spyOn(MAPIUtils, 'generateUID');
generateUIDMockFn.mockReturnValue(
  capiv1alpha3Mocks.randomCluster1.metadata.name
);

describe('ClusterCreate', () => {
  const originalInfo = window.config.info;

  beforeAll(() => {
    window.config.info = {
      ...window.config.info,
      general: {
        ...window.config.info.general,
        availabilityZones: {
          default: 1,
          max: 3,
          zones: ['1', '2', '3'],
        },
        provider: Providers.AZURE,
      },
    };
  });

  afterAll(() => {
    window.config.info = originalInfo;
  });

  afterEach(() => {
    cache.clear();
  });

  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('can see the name that the resource will get', () => {
    render(getComponent({}));

    expect(screen.getByLabelText('Cluster name: j5y9m')).toBeInTheDocument();
  });

  it('can set the description', async () => {
    const createClusterMockFn = jest.spyOn(CreateClusterUtils, 'createCluster');
    createClusterMockFn.mockResolvedValue({
      cluster: capiv1alpha3Mocks.randomCluster1,
      providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
      controlPlaneNode: capzv1alpha3Mocks.randomAzureMachine1,
    });

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(getComponent({}));

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'A new description' },
    });

    const createButton = screen.getByRole('button', { name: 'Create cluster' });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createClusterMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        cluster: expect.objectContaining({
          metadata: expect.objectContaining({
            annotations: expect.objectContaining({
              'cluster.giantswarm.io/description': 'A new description',
            }),
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)('Cluster j5y9m created successfully')
    ).toBeInTheDocument();

    createClusterMockFn.mockRestore();
  });

  it('can set the release version', async () => {
    const createClusterMockFn = jest.spyOn(CreateClusterUtils, 'createCluster');
    createClusterMockFn.mockResolvedValue({
      cluster: capiv1alpha3Mocks.randomCluster1,
      providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
      controlPlaneNode: capzv1alpha3Mocks.randomAzureMachine1,
    });

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(getComponent({}));

    // Has the latest version selected by default.
    expect(
      await screen.findByLabelText('The currently selected version is 15.0.0')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Available releases'));
    fireEvent.click(screen.getByLabelText('Release version 14.1.5'));

    const createButton = screen.getByRole('button', { name: 'Create cluster' });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createClusterMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        cluster: expect.objectContaining({
          metadata: expect.objectContaining({
            labels: expect.objectContaining({
              'release.giantswarm.io/version': '14.1.5',
            }),
          }),
        }),
        providerCluster: expect.objectContaining({
          metadata: expect.objectContaining({
            labels: expect.objectContaining({
              'release.giantswarm.io/version': '14.1.5',
            }),
          }),
        }),
        controlPlaneNode: expect.objectContaining({
          metadata: expect.objectContaining({
            labels: expect.objectContaining({
              'release.giantswarm.io/version': '14.1.5',
            }),
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)('Cluster j5y9m created successfully')
    ).toBeInTheDocument();

    createClusterMockFn.mockRestore();
  });

  it('can configure the availability zone', async () => {
    const createClusterMockFn = jest.spyOn(CreateClusterUtils, 'createCluster');
    createClusterMockFn.mockResolvedValue({
      cluster: capiv1alpha3Mocks.randomCluster1,
      providerCluster: capzv1alpha3Mocks.randomAzureCluster1,
      controlPlaneNode: capzv1alpha3Mocks.randomAzureMachine1,
    });

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(getComponent({}));

    fireEvent.click(screen.getByText('Manual selection'));
    fireEvent.click(await screen.findByLabelText('Availability zone 3'));

    const createButton = screen.getByRole('button', { name: 'Create cluster' });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createClusterMockFn).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(Object),
      expect.objectContaining({
        controlPlaneNode: expect.objectContaining({
          spec: expect.objectContaining({
            failureDomain: '3',
          }),
        }),
      })
    );

    expect(
      await withMarkup(screen.findByText)('Cluster j5y9m created successfully')
    ).toBeInTheDocument();

    createClusterMockFn.mockRestore();
  });

  it('creates a cluster with default options', async () => {
    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    nock(window.config.mapiEndpoint)
      .post(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Created, capiv1alpha3Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .post(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azureclusters/${capzv1alpha3Mocks.randomAzureCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Created, capzv1alpha3Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .post(
        `/apis/infrastructure.cluster.x-k8s.io/v1alpha3/namespaces/org-org1/azuremachines/${capzv1alpha3Mocks.randomAzureMachine1.metadata.name}/`
      )
      .reply(StatusCodes.Created, capzv1alpha3Mocks.randomAzureMachine1);

    render(getComponent({}));

    const createButton = screen.getByRole('button', { name: 'Create cluster' });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(
      await withMarkup(screen.findByText)('Cluster j5y9m created successfully')
    ).toBeInTheDocument();
  });
});
