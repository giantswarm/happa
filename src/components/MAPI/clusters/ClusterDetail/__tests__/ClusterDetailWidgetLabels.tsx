import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capiv1alpha3Mocks from 'test/mockHttpCalls/capiv1alpha3';
import { getComponentWithStore } from 'test/renderUtils';
import TestOAuth2 from 'utils/OAuth2/TestOAuth2';

import ClusterDetailWidgetLabels from '../ClusterDetailWidgetLabels';

function getComponent(
  props: React.ComponentPropsWithoutRef<typeof ClusterDetailWidgetLabels>
) {
  const history = createMemoryHistory();
  const auth = new TestOAuth2(history, true);

  const Component = (p: typeof props) => (
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <ClusterDetailWidgetLabels {...p} />
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

describe('ClusterDetailWidgetLabels', () => {
  it('renders without crashing', () => {
    render(getComponent({}));
  });

  it('displays loading animations if the cluster is still loading', () => {
    render(
      getComponent({
        cluster: undefined,
      })
    );

    expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
  });

  it('displays the label editor', () => {
    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    expect(screen.getByText('This cluster has no labels.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'Add label',
      })
    ).toBeInTheDocument();
  });

  it('can add a new label to the cluster', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...capiv1alpha3Mocks.randomCluster1,
        metadata: {
          ...capiv1alpha3Mocks.randomCluster1.metadata,
          labels: {
            ...capiv1alpha3Mocks.randomCluster1.metadata.labels!,
            'some-key': 'some-value',
          },
        },
      });

    render(
      getComponent({
        cluster: capiv1alpha3Mocks.randomCluster1,
      })
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Add label',
      })
    );

    fireEvent.change(screen.getByLabelText('Label key'), {
      target: { value: 'some-key' },
    });
    fireEvent.change(screen.getByLabelText('Label value'), {
      target: { value: 'some-value' },
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Save',
      })
    );

    expect(
      await screen.findByText(`Successfully updated the cluster's labels`)
    ).toBeInTheDocument();
  });

  it('can remove a label from a cluster', async () => {
    const cluster = {
      ...capiv1alpha3Mocks.randomCluster1,
      metadata: {
        ...capiv1alpha3Mocks.randomCluster1.metadata,
        labels: {
          ...capiv1alpha3Mocks.randomCluster1.metadata.labels!,
          'some-key': 'some-value',
        },
      },
    };

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, cluster);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/${capiv1alpha3Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1alpha3Mocks.randomCluster1);

    render(getComponent({ cluster }));

    fireEvent.click(
      screen.getByRole('button', {
        name: `Delete 'some-key' label`,
      })
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete',
      })
    );

    expect(
      await screen.findByText(`Successfully updated the cluster's labels`)
    ).toBeInTheDocument();
  });
});
