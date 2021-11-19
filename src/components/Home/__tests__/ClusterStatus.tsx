import { fireEvent, screen } from '@testing-library/react';
import ClusterStatus from 'Home/ClusterStatus';
import { IState } from 'model/stores/state';
import { Providers } from 'shared/constants';
import {
  nodePoolRelease,
  nodePoolWithFlatcarRelease,
} from 'test/mockHttpCalls';
import preloginState from 'test/preloginState';
import { renderWithStore } from 'test/renderUtils';

describe('ClusterStatus', () => {
  it('renders without crashing', () => {
    renderWithStore(ClusterStatus, { clusterId: '' });
  });

  it('shows that a cluster is ready to be upgraded', () => {
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
        [nodePoolWithFlatcarRelease.version]:
          nodePoolWithFlatcarRelease as IRelease,
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

    const hoverMessageRegex =
      /There's a new release version available\. Upgrade now to get the latest features\./i;
    fireEvent.mouseEnter(statusLabel);
    expect(screen.getByText(hoverMessageRegex)).toBeInTheDocument();
    fireEvent.mouseLeave(statusLabel);
    expect(screen.queryByText(hoverMessageRegex)).not.toBeInTheDocument();
  });

  it('shows that a cluster is in creation state', () => {
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

    const hoverMessageRegex =
      /The cluster is currently creating\. This step usually takes about 30 minutes\./i;
    fireEvent.mouseEnter(statusLabel);
    expect(screen.getByText(hoverMessageRegex)).toBeInTheDocument();
    fireEvent.mouseLeave(statusLabel);
    expect(screen.queryByText(hoverMessageRegex)).not.toBeInTheDocument();
  });

  it('shows that a cluster is in upgrading state', () => {
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

    const hoverMessageRegex =
      /The cluster is currently upgrading\. This step usually takes about 30 minutes\./i;
    fireEvent.mouseEnter(statusLabel);
    expect(screen.getByText(hoverMessageRegex)).toBeInTheDocument();
    fireEvent.mouseLeave(statusLabel);
    expect(screen.queryByText(hoverMessageRegex)).not.toBeInTheDocument();
  });

  it('shows that a cluster is in awaiting upgrade state', () => {
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
      }
    );
    state.entities.clusters.idsAwaitingUpgrade.as129 = true;

    const onClickMockFn = jest.fn();
    renderWithStore(
      ClusterStatus,
      { clusterId: 'as129', onClick: onClickMockFn },
      state
    );

    const statusLabel = screen.getByRole('document', {
      name: 'Awaiting upgrade…',
    });
    expect(statusLabel).toBeInTheDocument();

    fireEvent.click(statusLabel);
    expect(onClickMockFn).not.toHaveBeenCalled();

    const hoverMessageRegex = /The cluster is about to start an upgrade\./i;
    fireEvent.mouseEnter(statusLabel);
    expect(screen.getByText(hoverMessageRegex)).toBeInTheDocument();
    fireEvent.mouseLeave(statusLabel);
    expect(screen.queryByText(hoverMessageRegex)).not.toBeInTheDocument();
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
        delete_date: new Date('2021-02-10T16:39:27Z'),
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

function makeState(cluster: Partial<Cluster>, releases: IReleases): IState {
  return {
    ...preloginState,
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
    entities: {
      releases: {
        items: releases,
      },
      clusters: {
        items: { [cluster.id as string]: cluster },
        idsAwaitingUpgrade: {},
      },
    },
  } as unknown as IState;
}
