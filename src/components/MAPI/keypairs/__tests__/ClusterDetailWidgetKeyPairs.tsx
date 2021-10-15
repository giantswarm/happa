import { render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import TestOAuth2 from 'lib/OAuth2/TestOAuth2';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';
import nock from 'nock';
import React from 'react';
import { StatusCodes } from 'shared/constants';
import { SWRConfig } from 'swr';
import * as mockCapiv1alpha3 from 'testUtils/mockHttpCalls/capiv1alpha3';
import * as legacyMocks from 'testUtils/mockHttpCalls/legacy';
import { getComponentWithStore } from 'testUtils/renderUtils';

import ClusterDetailWidgetKeyPairs from '../ClusterDetailWidgetKeyPairs';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetKeyPairs>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetKeyPairs {...p} />
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

describe('ClusterDetailWidgetKeyPairs', () => {
  it('displays loading animations if the cluster is still loading', () => {
    render(getComponent({}));

    expect(screen.getAllByLabelText('Loading...').length).toEqual(1);
  });

  it('displays a placeholder if there are no keypairs', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/core.giantswarm.io/v1alpha1/namespaces/giantswarm/storageconfigs/cluster-service/`
      )
      .reply(StatusCodes.Ok, {
        apiVersion: 'core.giantswarm.io/v1alpha1',
        kind: gscorev1alpha1.StorageConfig,
        metadata: {
          name: 'cluster-service',
          namespace: 'giantswarm',
          resourceVersion: '294675100',
          selfLink:
            '/apis/core.giantswarm.io/v1alpha1/namespaces/giantswarm/storageconfigs/cluster-service/',
        },
        spec: {
          storage: {
            data: {},
          },
        },
      });

    render(getComponent({}));

    expect(await screen.findByText('No key pairs')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => {
        return (
          node?.textContent === 'Use gsctl create kubeconfig to create one.'
        );
      })
    ).toBeInTheDocument();
  });

  it('displays stats about the keypairs created for this cluster', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/core.giantswarm.io/v1alpha1/namespaces/giantswarm/storageconfigs/cluster-service/`
      )
      .reply(StatusCodes.Ok, legacyMocks.clusterServiceStorage);

    render(getComponent({}));

    expect(await screen.findByLabelText('2 key pairs')).toBeInTheDocument();
  });
});
