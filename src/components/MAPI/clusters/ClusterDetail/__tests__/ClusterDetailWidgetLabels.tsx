import { fireEvent, render, screen, within } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { StatusCodes } from 'model/constants';
import nock from 'nock';
import React from 'react';
import { SWRConfig } from 'swr';
import * as capiv1beta1Mocks from 'test/mockHttpCalls/capiv1beta1';
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
        cluster: capiv1beta1Mocks.randomCluster1,
        canUpdateCluster: true,
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
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, {
        ...capiv1beta1Mocks.randomCluster1,
        metadata: {
          ...capiv1beta1Mocks.randomCluster1.metadata,
          labels: {
            ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
            'some-key': 'some-value',
          },
        },
      });

    render(
      getComponent({
        cluster: capiv1beta1Mocks.randomCluster1,
        canUpdateCluster: true,
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
      ...capiv1beta1Mocks.randomCluster1,
      metadata: {
        ...capiv1beta1Mocks.randomCluster1.metadata,
        labels: {
          ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
          'some-key': 'some-value',
        },
      },
    };

    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, cluster);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster1);

    render(getComponent({ cluster, canUpdateCluster: true }));

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

  it('displays cluster labels as read-only if the user does not have permissions to update cluster resources', () => {
    const cluster = {
      ...capiv1beta1Mocks.randomCluster1,
      metadata: {
        ...capiv1beta1Mocks.randomCluster1.metadata,
        labels: {
          ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
          'some-key': 'some-value',
        },
      },
    };

    render(getComponent({ cluster, canUpdateCluster: false }));

    // Does not display add button
    expect(
      screen.queryByRole('button', {
        name: 'Add label',
      })
    ).not.toBeInTheDocument();

    // Does not display delete button for the label
    expect(
      screen.queryByRole('button', {
        name: `Delete 'some-key' label`,
      })
    ).not.toBeInTheDocument();

    // Does not allow editing by clicking on the label
    const label = screen.getByLabelText('Label some-key with value some-value');

    fireEvent.mouseOver(label);

    expect(
      screen.getByText('For editing labels, you need additional permissions.')
    ).toBeInTheDocument();

    fireEvent.click(label);

    expect(screen.queryByLabelText('Label key')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Label value')).not.toBeInTheDocument();
  });

  it('displays interpreted values for priority label', () => {
    const cluster = {
      ...capiv1beta1Mocks.randomCluster1,
      metadata: {
        ...capiv1beta1Mocks.randomCluster1.metadata,
        labels: {
          ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
          'giantswarm.io/service-priority': 'highest',
        },
      },
    };

    render(getComponent({ cluster, canUpdateCluster: true }));

    const label = screen.getByLabelText(
      'Label giantswarm.io/service-priority with value highest'
    );

    expect(within(label).queryByText('Service priority')).toBeInTheDocument();
    expect(within(label).queryByText('Highest')).toBeInTheDocument();
    expect(
      within(label).queryByText('giantswarm.io/service-priority')
    ).not.toBeInTheDocument();
    expect(within(label).queryByText('highest')).not.toBeInTheDocument();
  });

  it('displays raw values for priority label in raw mode', () => {
    const cluster = {
      ...capiv1beta1Mocks.randomCluster1,
      metadata: {
        ...capiv1beta1Mocks.randomCluster1.metadata,
        labels: {
          ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
          'giantswarm.io/service-priority': 'highest',
        },
      },
    };

    render(getComponent({ cluster, canUpdateCluster: true }));

    const rawDisplayControl = screen.getByLabelText('Display raw labels');
    fireEvent.click(rawDisplayControl);

    const label = screen.getByLabelText(
      'Label giantswarm.io/service-priority with value highest'
    );

    expect(
      within(label).queryByText('Service priority')
    ).not.toBeInTheDocument();
    expect(within(label).queryByText('Highest')).not.toBeInTheDocument();
    expect(
      within(label).queryByText('giantswarm.io/service-priority')
    ).toBeInTheDocument();
    expect(within(label).queryByText('highest')).toBeInTheDocument();
  });

  it('cannot remove a service priority label', () => {
    const cluster = {
      ...capiv1beta1Mocks.randomCluster1,
      metadata: {
        ...capiv1beta1Mocks.randomCluster1.metadata,
        labels: {
          ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
          'giantswarm.io/service-priority': 'highest',
        },
      },
    };

    render(getComponent({ cluster, canUpdateCluster: true }));

    expect(
      screen.queryByRole('button', {
        name: `Delete 'giantswarm.io/service-priority' label`,
      })
    ).not.toBeInTheDocument();
  });

  it('can edit a service priority label', async () => {
    nock(window.config.mapiEndpoint)
      .get(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster1);

    nock(window.config.mapiEndpoint)
      .put(
        `/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/${capiv1beta1Mocks.randomCluster1.metadata.name}/`
      )
      .reply(StatusCodes.Ok, capiv1beta1Mocks.randomCluster1);

    const cluster = {
      ...capiv1beta1Mocks.randomCluster1,
      metadata: {
        ...capiv1beta1Mocks.randomCluster1.metadata,
        labels: {
          ...capiv1beta1Mocks.randomCluster1.metadata.labels!,
          'giantswarm.io/service-priority': 'highest',
        },
      },
    };

    render(getComponent({ cluster, canUpdateCluster: true }));

    const label = screen.getByLabelText(
      'Label giantswarm.io/service-priority with value highest'
    );

    fireEvent.click(label);

    expect(screen.queryByLabelText('Label key')).toBeInTheDocument();
    expect(screen.queryByLabelText('Label key')).toHaveValue(
      'giantswarm.io/service-priority'
    );
    expect(screen.queryByLabelText('Label key')).toBeDisabled();
    expect(screen.queryByLabelText('Label value')).toBeInTheDocument();
    expect(screen.queryByLabelText('Label value')).toHaveValue('highest');
    expect(screen.queryByLabelText('Label value')).not.toBeDisabled();

    fireEvent.change(screen.getByLabelText('Label value'), {
      target: { value: 'lowest' },
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

  it('displays hidden labels as read-only in raw mode', () => {
    const cluster = capiv1beta1Mocks.randomCluster1;
    render(getComponent({ cluster, canUpdateCluster: true }));

    expect(
      screen.queryByText('giantswarm.io/organization')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('org1')).not.toBeInTheDocument();

    const rawDisplayControl = screen.getByLabelText('Display raw labels');
    fireEvent.click(rawDisplayControl);

    expect(
      screen.queryByText('giantswarm.io/organization')
    ).toBeInTheDocument();
    expect(screen.queryByText('org1')).toBeInTheDocument();

    expect(
      screen.queryByRole('button', {
        name: `Delete 'giantswarm.io/organization' label`,
      })
    ).not.toBeInTheDocument();

    const label = screen.getByLabelText(
      'Label giantswarm.io/organization with value org1'
    );

    fireEvent.mouseOver(label);

    expect(screen.getByText('This label cannot be edited')).toBeInTheDocument();

    fireEvent.click(label);

    expect(screen.queryByLabelText('Label key')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Label value')).not.toBeInTheDocument();
  });
});
