import { fireEvent, screen } from '@testing-library/react';
import UpgradeClusterModal from 'Cluster/ClusterDetail/UpgradeClusterModal';
import React from 'react';
import { IState } from 'reducers/types';
import { Providers } from 'shared/constants';
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
      cluster,
      provider: Providers.AWS,
    });
  });

  it('renders the inspect changes page by default', () => {
    const cluster = Object.assign({}, v5ClusterResponse, {
      capabilities: {},
    });
    renderAndOpen({
      cluster,
      provider: Providers.AWS,
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
      cluster,
      provider: Providers.AWS,
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
        cluster,
        provider: Providers.AWS,
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

  it('cancels the upgrade release version change and revert to the original upgrade release version', () => {
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
        cluster,
        provider: Providers.AWS,
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

  it('cancels the upgrade release version change and revert to the original version if the modal is closed', () => {
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
        cluster,
        provider: Providers.AWS,
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
    fireEvent.click(screen.getByText(/×/i));
    expect(cancelSetTargetReleaseMockFn).toBeCalled();
  });

  it('only displays the versions that are supported by the current cluster', () => {
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
        cluster,
        provider: Providers.AWS,
        targetRelease,
        isAdmin: true,
        setTargetRelease: setTargetReleaseMockFn,
        cancelSetTargetRelease: cancelSetTargetReleaseMockFn,
      },
      initialState
    );

    fireEvent.click(screen.getByText(/inspect changes/i));
    fireEvent.click(screen.getByText(/change version/i));

    const releaseVersions = Object.keys(initialState.entities.releases.items);
    const currentVersionIdx = releaseVersions.indexOf(cluster.release_version);
    for (let i = 0; i < releaseVersions.length; i++) {
      if (i > currentVersionIdx) {
        expect(screen.getAllByText(releaseVersions[i]).length).toBeGreaterThan(
          0
        );
      } else {
        expect(screen.queryAllByText(releaseVersions[i]).length).toBe(0);
      }
    }
  });
});
