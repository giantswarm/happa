import {
  selectIsClusterAwaitingUpgrade,
  selectTargetRelease,
} from 'stores/cluster/selectors';
import { IState } from 'stores/state';
import { v5ClusterResponse } from 'testUtils/mockHttpCalls';

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
  } as IState;
}

function createRelease(version: string, active: boolean): IRelease {
  return {
    version,
    active,
  } as IRelease;
}

describe('cluster::selectors', () => {
  describe('selectTargetRelease', () => {
    it('returns null for a nullish cluster', () => {
      const initialState = {} as IState;
      let releaseVersion = selectTargetRelease(initialState, null);
      expect(releaseVersion).toBeNull();

      releaseVersion = selectTargetRelease(initialState, undefined);
      expect(releaseVersion).toBeNull();
    });

    it('returns null if there are no releases found', () => {
      const initialState = createInitialState({});
      const releaseVersion = selectTargetRelease(
        initialState,
        (v5ClusterResponse as unknown) as V5.ICluster
      );
      expect(releaseVersion).toBeNull();
    });

    it('returns the next active version', () => {
      const initialState = createInitialState({
        '1.0.0': createRelease('1.0.0', true),
        '2.0.0': createRelease('2.0.0', false),
        '2.0.1': createRelease('2.0.1', true),
        '3.0.0': createRelease('3.0.0', true),
      });
      const cluster = (Object.assign({}, v5ClusterResponse, {
        release_version: '1.0.0',
      }) as unknown) as V5.ICluster;
      const releaseVersion = selectTargetRelease(initialState, cluster);
      expect(releaseVersion).toBe('2.0.1');
    });

    it(`returns null if there's no newer active version available`, () => {
      const initialState = createInitialState({
        '1.0.0': createRelease('1.0.0', true),
        '2.0.0': createRelease('2.0.0', false),
        '2.0.1': createRelease('2.0.1', true),
        '3.0.0': createRelease('3.0.0', true),
      });
      const cluster = (Object.assign({}, v5ClusterResponse, {
        release_version: '3.0.0',
      }) as unknown) as V5.ICluster;
      const releaseVersion = selectTargetRelease(initialState, cluster);
      expect(releaseVersion).toBeNull();
    });

    it(`returns null if there's a newer version available, but it's inactive, or if there's a newer version, but it's a pre-release one`, () => {
      const initialState = createInitialState({
        '1.0.0': createRelease('1.0.0', true),
        '2.0.0': createRelease('2.0.0', false),
        '2.0.1': createRelease('2.0.1', true),
        '3.0.0': createRelease('3.0.0', true),
        '3.0.1': createRelease('3.0.1', false),
        '3.0.1-beta': createRelease('3.0.1-beta', true),
      });
      const cluster = (Object.assign({}, v5ClusterResponse, {
        release_version: '3.0.0',
      }) as unknown) as V5.ICluster;
      const releaseVersion = selectTargetRelease(initialState, cluster);
      expect(releaseVersion).toBeNull();
    });

    it('returns the next active version, even if the cluster version is not found', () => {
      const initialState = createInitialState({
        '1.0.0': createRelease('1.0.0', true),
        '2.0.1': createRelease('2.0.1', true),
        '3.0.0': createRelease('3.0.0', true),
      });
      const cluster = (Object.assign({}, v5ClusterResponse, {
        release_version: '2.0.0',
      }) as unknown) as V5.ICluster;
      const releaseVersion = selectTargetRelease(initialState, cluster);
      expect(releaseVersion).toBe('2.0.1');
    });

    it('returns the next active version, if the user is an admin', () => {
      const initialState = createInitialState(
        {
          '1.0.0': createRelease('1.0.0', true),
          '2.0.0': createRelease('2.0.0', false),
          '2.0.1': createRelease('2.0.1', false),
          '2.0.2-alpha': createRelease('2.0.2-alpha', true),
          '2.0.2': createRelease('2.0.2', true),
          '3.0.0': createRelease('3.0.0', true),
        },
        true
      );
      const cluster = (Object.assign({}, v5ClusterResponse, {
        release_version: '2.0.0',
      }) as unknown) as V5.ICluster;
      const releaseVersion = selectTargetRelease(initialState, cluster);
      expect(releaseVersion).toBe('2.0.2');
    });

    it('returns the next inactive version, if the user is an admin and there is no newer active version', () => {
      const initialState = createInitialState(
        {
          '1.0.0': createRelease('1.0.0', true),
          '2.0.0': createRelease('2.0.0', false),
          '2.0.1': createRelease('2.0.1', false),
          '2.0.2': createRelease('2.0.2', true),
          '3.0.0': createRelease('3.0.0', true),
          '3.0.1': createRelease('3.0.1', false),
        },
        true
      );
      const cluster = (Object.assign({}, v5ClusterResponse, {
        release_version: '3.0.0',
      }) as unknown) as V5.ICluster;
      const releaseVersion = selectTargetRelease(initialState, cluster);
      expect(releaseVersion).toBe('3.0.1');
    });

    it('returns the next pre-release version, if the user is an admin and there is no newer active version', () => {
      const initialState = createInitialState(
        {
          '1.0.0': createRelease('1.0.0', true),
          '2.0.0': createRelease('2.0.0', false),
          '2.0.1': createRelease('2.0.1', false),
          '2.0.2': createRelease('2.0.2', true),
          '3.0.0': createRelease('3.0.0', true),
          '3.0.1-alpha': createRelease('3.0.1-alpha', true),
        },
        true
      );
      const cluster = (Object.assign({}, v5ClusterResponse, {
        release_version: '3.0.0',
      }) as unknown) as V5.ICluster;
      const releaseVersion = selectTargetRelease(initialState, cluster);
      expect(releaseVersion).toBe('3.0.1-alpha');
    });
  });

  describe('selectIsClusterAwaitingUpgrade', () => {
    it('returns true if a cluster ID is in the list', () => {
      const state = ({
        entities: {
          clusters: {
            idsAwaitingUpgrade: {
              as12d: true,
              '435sd': true,
            },
          },
        },
      } as unknown) as IState;

      expect(selectIsClusterAwaitingUpgrade('as12d')(state)).toBeTruthy();
      expect(selectIsClusterAwaitingUpgrade('435sd')(state)).toBeTruthy();
      expect(selectIsClusterAwaitingUpgrade('s3as1')(state)).toBeFalsy();
      expect(selectIsClusterAwaitingUpgrade('asda1')(state)).toBeFalsy();
    });
  });
});
