import { IState } from 'reducers/types';
import { selectTargetRelease } from 'stores/cluster/selectors';
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

jest.unmock('stores/user/selectors');

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

    it(`returns null if there's a newer active version available, but it's inactive`, () => {
      const initialState = createInitialState({
        '1.0.0': createRelease('1.0.0', true),
        '2.0.0': createRelease('2.0.0', false),
        '2.0.1': createRelease('2.0.1', true),
        '3.0.0': createRelease('3.0.0', true),
        '3.0.1': createRelease('3.0.1', false),
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
  });
});
