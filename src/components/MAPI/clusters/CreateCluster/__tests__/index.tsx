import { fireEvent, screen, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import * as MAPIUtils from 'MAPI/utils';
import { Providers, StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import { withMarkup } from 'test/assertUtils';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
import * as capzv1beta1Mocks from 'test/mockHttpCalls/capzv1beta1';
import * as releasev1alpha1Mocks from 'test/mockHttpCalls/releasev1alpha1';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import * as CreateClusterUtils from '../../utils';
import ClusterCreate from '../';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterCreate>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
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
  capiv1beta1Mocks.randomCluster1.metadata.name
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
      cluster: capiv1beta1Mocks.randomCluster1,
      providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      controlPlaneNodes: [capzv1beta1Mocks.randomAzureMachine1],
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
      expect.any(Function),
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
      cluster: capiv1beta1Mocks.randomCluster1,
      providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      controlPlaneNodes: [capzv1beta1Mocks.randomAzureMachine1],
    });

    nock(window.config.mapiEndpoint)
      .get('/apis/release.giantswarm.io/v1alpha1/releases/')
      .reply(StatusCodes.Ok, releasev1alpha1Mocks.releasesList);

    render(getComponent({}));

    // Has the latest active version selected by default.
    expect(
      await screen.findByLabelText('Release version: 15.0.0')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText('Available releases'));

    // Shows preview releases in the list of releases, but don't allow selection
    expect(
      screen.getByLabelText('Release version 20.0.0-alpha')
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Select release 20.0.0-alpha')
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Release version 14.1.5'));

    const createButton = screen.getByRole('button', { name: 'Create cluster' });

    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });

    fireEvent.click(createButton);

    expect(createClusterMockFn).toHaveBeenCalledWith(
      expect.any(Function),
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
        controlPlaneNodes: expect.arrayContaining([
          expect.objectContaining({
            metadata: expect.objectContaining({
              labels: expect.objectContaining({
                'release.giantswarm.io/version': '14.1.5',
              }),
            }),
          }),
        ]),
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
      cluster: capiv1beta1Mocks.randomCluster1,
      providerCluster: capzv1beta1Mocks.randomAzureCluster1,
      controlPlaneNodes: [capzv1beta1Mocks.randomAzureMachine1],
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
      expect.any(Function),
      expect.any(Object),
      expect.objectContaining({
        controlPlaneNodes: expect.arrayContaining([
          expect.objectContaining({
            spec: expect.objectContaining({
              failureDomain: '3',
            }),
          }),
        ]),
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
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Created, capiv1beta1Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .post(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azureclusters/${capzv1beta1Mocks.randomAzureCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Created, capzv1beta1Mocks.randomAzureCluster1);

    nock(window.config.mapiEndpoint)
      .post(
        `/apis/infrastructure.cluster.x-k8s.io/v1beta1/namespaces/org-org1/azuremachines/${capzv1beta1Mocks.randomAzureMachine1.metadata.name}/`
      )
      .reply(StatusCodes.Created, capzv1beta1Mocks.randomAzureMachine1);

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
