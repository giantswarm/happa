import {
  fireEvent,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import ClusterStatus from 'Home/ClusterStatus';
import { IState } from 'reducers/types';
import { Providers } from 'shared/constants';
import {
  nodePoolRelease,
  nodePoolWithFlatcarRelease,
} from 'testUtils/mockHttpCalls';
import { renderWithStore } from 'testUtils/renderUtils';

describe('ClusterStatus', () => {
  it('renders without crashing', () => {
    renderWithStore(ClusterStatus, { clusterId: '' });
  });

  it('shows that a cluster is ready to be upgraded', async () => {
    const state = makeState(
      {
        id: 'as129',
        release_version: nodePoolRelease.version,
        conditions: [
          {
            last_transition_time: '123',
            condition: 'Created',
          },
        ],
      },
      {
        [nodePoolRelease.version]: nodePoolRelease as IRelease,
        [nodePoolWithFlatcarRelease.version]: nodePoolWithFlatcarRelease as IRelease,
      }
    );
    const onClickMockFn = jest.fn();
    renderWithStore(
      ClusterStatus,
      { clusterId: 'as129', onClick: onClickMockFn },
      state
    );

    const statusLabel = screen.getByRole('document', {
      name: 'Upgrade Available',
    });
    expect(statusLabel).toBeInTheDocument();

    fireEvent.click(statusLabel);
    expect(onClickMockFn).toHaveBeenCalled();

    const hoverMessageRegex = /There's a new release version available\. Upgrade now to get the latest features\./i;
    fireEvent.mouseEnter(statusLabel);
    expect(screen.getByText(hoverMessageRegex)).toBeInTheDocument();
    fireEvent.mouseLeave(statusLabel);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(hoverMessageRegex)
    );
  });

  it('shows that a cluster is in creation state', async () => {
    const state = makeState(
      {
        id: 'as129',
        release_version: nodePoolRelease.version,
        conditions: [
          {
            last_transition_time: '123',
            condition: 'Creating',
          },
        ],
      },
      {
        [nodePoolRelease.version]: nodePoolRelease as IRelease,
      }
    );
    const onClickMockFn = jest.fn();
    renderWithStore(
      ClusterStatus,
      { clusterId: 'as129', onClick: onClickMockFn },
      state
    );

    const statusLabel = screen.getByRole('document', {
      name: 'Cluster creating…',
    });
    expect(statusLabel).toBeInTheDocument();

    fireEvent.click(statusLabel);
    expect(onClickMockFn).not.toHaveBeenCalled();

    const hoverMessageRegex = /The cluster is currently creating\. This step usually takes about 30 minutes\./i;
    fireEvent.mouseEnter(statusLabel);
    expect(screen.getByText(hoverMessageRegex)).toBeInTheDocument();
    fireEvent.mouseLeave(statusLabel);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(hoverMessageRegex)
    );
  });

  it('shows that a cluster is in upgrading state', async () => {
    const state = makeState(
      {
        id: 'as129',
        release_version: nodePoolRelease.version,
        conditions: [
          {
            last_transition_time: '123',
            condition: 'Updating',
          },
        ],
      },
      {
        [nodePoolRelease.version]: nodePoolRelease as IRelease,
      }
    );
    const onClickMockFn = jest.fn();
    renderWithStore(
      ClusterStatus,
      { clusterId: 'as129', onClick: onClickMockFn },
      state
    );

    const statusLabel = screen.getByRole('document', {
      name: 'Upgrade in progress…',
    });
    expect(statusLabel).toBeInTheDocument();

    fireEvent.click(statusLabel);
    expect(onClickMockFn).not.toHaveBeenCalled();

    const hoverMessageRegex = /The cluster is currently upgrading\. This step usually takes about 30 minutes\./i;
    fireEvent.mouseEnter(statusLabel);
    expect(screen.getByText(hoverMessageRegex)).toBeInTheDocument();
    fireEvent.mouseLeave(statusLabel);
    await waitForElementToBeRemoved(() =>
      screen.queryByText(hoverMessageRegex)
    );
  });

  it('renders an empty output if the cluster has a deleting condition', () => {
    const state = makeState(
      {
        id: 'as129',
        release_version: nodePoolRelease.version,
        conditions: [
          {
            last_transition_time: '123',
            condition: 'Deleting',
          },
        ],
      },
      {
        [nodePoolRelease.version]: nodePoolRelease as IRelease,
      }
    );
    renderWithStore(ClusterStatus, { clusterId: 'as129' }, state);
    expect(screen.queryByRole('document')).not.toBeInTheDocument();
  });

  it('renders an empty output if the cluster has been deleted in the app', () => {
    const state = makeState(
      {
        id: 'as129',
        release_version: nodePoolRelease.version,
        delete_date: '123123',
      },
      {
        [nodePoolRelease.version]: nodePoolRelease as IRelease,
      }
    );
    renderWithStore(ClusterStatus, { clusterId: 'as129' }, state);
    expect(screen.queryByRole('document')).not.toBeInTheDocument();
  });

  it('renders an empty output if the cluster is not found', () => {
    const state = makeState(
      {
        id: 'as129',
        release_version: nodePoolRelease.version,
      },
      {
        [nodePoolRelease.version]: nodePoolRelease as IRelease,
      }
    );
    renderWithStore(ClusterStatus, { clusterId: 'd01sa' }, state);
    expect(screen.queryByRole('document')).not.toBeInTheDocument();
  });

  it('can be rendered with no text', () => {
    const state = makeState(
      {
        id: 'as129',
        release_version: nodePoolRelease.version,
        conditions: [
          {
            last_transition_time: '123',
            condition: 'Updating',
          },
        ],
      },
      {
        [nodePoolRelease.version]: nodePoolRelease as IRelease,
      }
    );
    renderWithStore(
      ClusterStatus,
      { clusterId: 'as129', hideText: true },
      state
    );

    expect(screen.queryByText('Upgrade in progress…')).not.toBeInTheDocument();
  });
});

function makeState(
  cluster: Partial<V4.ICluster | V5.ICluster>,
  releases: IReleases
): IState {
  return {
    main: {
      loggedInUser: {
        isAdmin: false,
      },
      info: {
        general: {
          provider: Providers.AWS,
        },
      },
    },
    entities: ({
      releases: {
        items: releases,
      },
      clusters: {
        items: { [cluster.id as string]: cluster },
      },
    } as unknown) as IState['entities'],
  };
}
