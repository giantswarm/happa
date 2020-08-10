import { fireEvent, screen } from '@testing-library/react';
import UpgradeClusterModal from 'Cluster/ClusterDetail/UpgradeClusterModal';
import React from 'react';
import { IState } from 'reducers/types';
import { v5ClusterResponse } from 'testUtils/mockHttpCalls';
import { renderWithStore } from 'testUtils/renderUtils';

function renderAndOpen(
  props: React.ComponentPropsWithoutRef<typeof UpgradeClusterModal> = {},
  state: IState = {}
) {
  interface IComponent {
    show: () => void;
  }

  const elementRef = React.createRef<IComponent>();
  const defaultProps = Object.assign({}, { ref: elementRef }, props);
  const element = renderWithStore(UpgradeClusterModal, defaultProps, state);

  // Make modal visible.
  (elementRef.current as IComponent).show();

  return element;
}

function createRelease(version: string, active: boolean): IRelease {
  return {
    version,
    active,
    timestamp: '2020-06-11T12:34:56Z',
    components: [{ name: 'kubernetes', version: '1.16.3' }],
    changelog: [{ component: 'dummy', description: 'dummy' }],
    kubernetesVersion: '1.16.3',
    releaseNotesURL: 'dummy',
  } as IRelease;
}

function createInitialState(
  releases: Record<string, IRelease>,
  isAdmin: boolean = false
) {
  return {
    entities: {
      releases: {
        items: releases,
      },
    },
    main: {
      loggedInUser: {
        isAdmin,
      },
    },
  };
}

describe('UpgradeClusterModal', () => {
  it('renders without crashing', () => {
    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
    });
    renderAndOpen({
      cluster: cluster,
    });
  });

  it('renders the inspect changes page by default', () => {
    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
    });
    renderAndOpen({
      cluster: cluster,
    });

    expect(
      screen.getByText(/Before upgrading please acknowledge the following/i)
    ).toBeInTheDocument();
  });

  it(`can't change the upgrade release version if the user is not an admin`, () => {
    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
    });
    const targetRelease = {
      version: '1.0.0',
      timestamp: '2020-06-11T12:34:56Z',
      components: [{ name: 'kubernetes', version: '1.16.3' }],
      changelog: [{ component: 'dummy', description: 'dummy' }],
      active: true,
      kubernetesVersion: '1.16.3',
      releaseNotesURL: 'dummy',
    };
    renderAndOpen({
      cluster: cluster,
      targetRelease,
      isAdmin: false,
    });

    fireEvent.click(screen.getByText(/inspect changes/i));

    expect(screen.queryByText(/Change version/i)).not.toBeInTheDocument();
  });

  it('can change the upgrade release version if the user is an admin', () => {
    const setTargetReleaseMockFn = jest.fn();
    const cancelSetTargetReleaseMockFn = jest.fn();

    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
      release_version: '2.0.2',
    });
    const targetRelease = {
      version: '3.0.0',
      timestamp: '2020-06-11T12:34:56Z',
      components: [{ name: 'kubernetes', version: '1.16.3' }],
      changelog: [{ component: 'dummy', description: 'dummy' }],
      active: true,
      kubernetesVersion: '1.16.3',
      releaseNotesURL: 'dummy',
    };
    const initialState = createInitialState(
      {
        '1.0.0': createRelease('1.0.0', true),
        '2.0.0': createRelease('2.0.0', false),
        '2.0.1': createRelease('2.0.1', false),
        '2.0.2': createRelease('2.0.2', true),
        '3.0.0': createRelease('3.0.0', true),
        '3.0.1': createRelease('3.0.1', false),
        '4.0.0': createRelease('4.0.0', true),
      },
      true
    );
    renderAndOpen(
      {
        cluster: cluster,
        targetRelease,
        isAdmin: true,
        setTargetRelease: setTargetReleaseMockFn,
        cancelSetTargetRelease: cancelSetTargetReleaseMockFn,
      },
      initialState
    );

    fireEvent.click(screen.getByText(/inspect changes/i));
    expect(
      screen.getByText(/inspect changes from version 2.0.2 to 3.0.0/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/change version/i));

    // Pick the latest version.
    fireEvent.click(screen.getByText(/3.0.1/i));
    fireEvent.click(screen.getByText(/select version/i));
    expect(setTargetReleaseMockFn).toBeCalledWith('3.0.1');
  });

  it('can cancel the upgrade release version change and revert to the original upgrade release version', () => {
    const setTargetReleaseMockFn = jest.fn();
    const cancelSetTargetReleaseMockFn = jest.fn();

    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
      release_version: '2.0.2',
    });
    const targetRelease = {
      version: '3.0.0',
      timestamp: '2020-06-11T12:34:56Z',
      components: [{ name: 'kubernetes', version: '1.16.3' }],
      changelog: [{ component: 'dummy', description: 'dummy' }],
      active: true,
      kubernetesVersion: '1.16.3',
      releaseNotesURL: 'dummy',
    };
    const initialState = createInitialState(
      {
        '1.0.0': createRelease('1.0.0', true),
        '2.0.0': createRelease('2.0.0', false),
        '2.0.1': createRelease('2.0.1', false),
        '2.0.2': createRelease('2.0.2', true),
        '3.0.0': createRelease('3.0.0', true),
        '3.0.1': createRelease('3.0.1', false),
        '4.0.0': createRelease('4.0.0', true),
      },
      true
    );
    renderAndOpen(
      {
        cluster: cluster,
        targetRelease,
        isAdmin: true,
        setTargetRelease: setTargetReleaseMockFn,
        cancelSetTargetRelease: cancelSetTargetReleaseMockFn,
      },
      initialState
    );

    fireEvent.click(screen.getByText(/inspect changes/i));
    expect(
      screen.getByText(/inspect changes from version 2.0.2 to 3.0.0/i)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText(/change version/i));

    // Pick the latest version.
    fireEvent.click(screen.getByText(/3.0.1/i));
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(cancelSetTargetReleaseMockFn).toBeCalled();
  });
});
