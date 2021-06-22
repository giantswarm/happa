import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import * as releasev1alpha1Mocks from 'testUtils/mockHttpCalls/releasev1alpha1';
import * as ui from 'UI/Display/MAPI/releases/types';

import { getReleaseComponentsDiff } from '../utils';

describe('releases::utils', () => {
  describe('getReleaseComponentsDiff', () => {
    it('gets an empty diff for 2 empty releases', () => {
      const a: releasev1alpha1.IRelease = {
        ...releasev1alpha1Mocks.v13_1_0,
        spec: {
          ...releasev1alpha1Mocks.v13_1_0.spec,
          components: [],
          apps: [],
        },
      };

      const diff = getReleaseComponentsDiff(a, a);
      expect(diff).toStrictEqual({
        changes: [],
      });
    });

    it('finds changed versions between releases', () => {
      const a: releasev1alpha1.IRelease = {
        ...releasev1alpha1Mocks.v13_1_0,
        spec: {
          ...releasev1alpha1Mocks.v13_1_0.spec,
          components: [
            {
              catalog: 'control-plane-catalog',
              name: 'containerlinux',
              version: '2765.2.2',
            },
            {
              catalog: 'control-plane-catalog',
              name: 'etcd',
              version: '3.4.14',
            },
          ],
          apps: [],
        },
      };

      const b: releasev1alpha1.IRelease = {
        ...releasev1alpha1Mocks.v13_1_0,
        spec: {
          ...releasev1alpha1Mocks.v13_1_0.spec,
          components: [
            {
              catalog: 'control-plane-catalog',
              name: 'containerlinux',
              version: '2766.0.0',
            },
            {
              catalog: 'control-plane-catalog',
              name: 'etcd',
              version: '3.4.14',
            },
          ],
          apps: [],
        },
      };

      const diff = getReleaseComponentsDiff(a, b);
      expect(diff).toStrictEqual({
        changes: [
          {
            changeType: ui.ReleaseComponentsDiffChangeType.Update,
            component: 'containerlinux',
            oldVersion: '2765.2.2',
            newVersion: '2766.0.0',
          },
        ],
      } as ui.IReleaseComponentsDiff);
    });

    it('finds removed components', () => {
      const a: releasev1alpha1.IRelease = {
        ...releasev1alpha1Mocks.v13_1_0,
        spec: {
          ...releasev1alpha1Mocks.v13_1_0.spec,
          components: [
            {
              catalog: 'control-plane-catalog',
              name: 'containerlinux',
              version: '2765.2.2',
            },
            {
              catalog: 'control-plane-catalog',
              name: 'etcd',
              version: '3.4.14',
            },
          ],
          apps: [],
        },
      };

      const b: releasev1alpha1.IRelease = {
        ...releasev1alpha1Mocks.v13_1_0,
        spec: {
          ...releasev1alpha1Mocks.v13_1_0.spec,
          components: [
            {
              catalog: 'control-plane-catalog',
              name: 'containerlinux',
              version: '2765.2.2',
            },
          ],
          apps: [],
        },
      };

      const diff = getReleaseComponentsDiff(a, b);
      expect(diff).toStrictEqual({
        changes: [
          {
            changeType: ui.ReleaseComponentsDiffChangeType.Delete,
            component: 'etcd',
            oldVersion: '3.4.14',
          },
        ],
      } as ui.IReleaseComponentsDiff);
    });

    it('finds added components', () => {
      const a: releasev1alpha1.IRelease = {
        ...releasev1alpha1Mocks.v13_1_0,
        spec: {
          ...releasev1alpha1Mocks.v13_1_0.spec,
          components: [
            {
              catalog: 'control-plane-catalog',
              name: 'containerlinux',
              version: '2765.2.2',
            },
          ],
          apps: [],
        },
      };

      const b: releasev1alpha1.IRelease = {
        ...releasev1alpha1Mocks.v13_1_0,
        spec: {
          ...releasev1alpha1Mocks.v13_1_0.spec,
          components: [
            {
              catalog: 'control-plane-catalog',
              name: 'containerlinux',
              version: '2765.2.2',
            },
            {
              catalog: 'control-plane-catalog',
              name: 'etcd',
              version: '3.4.14',
            },
          ],
          apps: [],
        },
      };

      const diff = getReleaseComponentsDiff(a, b);
      expect(diff).toStrictEqual({
        changes: [
          {
            changeType: ui.ReleaseComponentsDiffChangeType.Add,
            component: 'etcd',
            newVersion: '3.4.14',
          },
        ],
      } as ui.IReleaseComponentsDiff);
    });

    it('gets a full blown diff between 2 releases', () => {
      const diff = getReleaseComponentsDiff(
        releasev1alpha1Mocks.v14_0_1,
        releasev1alpha1Mocks.v15_0_0
      );
      expect(diff).toStrictEqual({
        changes: [
          {
            changeType: 1,
            component: 'app-operator',
            newVersion: '4.4.0',
            oldVersion: '3.2.1',
          },
          {
            changeType: 1,
            component: 'azure-operator',
            newVersion: '5.7.0',
            oldVersion: '5.5.3',
          },
          {
            changeType: 1,
            component: 'cert-exporter',
            newVersion: '1.6.1',
            oldVersion: '1.6.0',
          },
          {
            changeType: 1,
            component: 'cert-operator',
            newVersion: '1.0.1',
            oldVersion: '0.1.0',
          },
          {
            changeType: 1,
            component: 'chart-operator',
            newVersion: '2.14.0',
            oldVersion: '2.12.0',
          },
          {
            changeType: 1,
            component: 'cluster-autoscaler',
            newVersion: '1.20.2',
            oldVersion: '1.19.1',
          },
          {
            changeType: 1,
            component: 'cluster-operator',
            newVersion: '0.27.1',
            oldVersion: '0.23.22',
          },
          {
            changeType: 1,
            component: 'containerlinux',
            newVersion: '2605.12.0',
            oldVersion: '2765.2.2',
          },
          {
            changeType: 1,
            component: 'coredns',
            newVersion: '1.4.1',
            oldVersion: '1.2.0',
          },
          {
            changeType: 1,
            component: 'external-dns',
            newVersion: '2.3.1',
            oldVersion: '2.3.0',
          },
          {
            changeType: 1,
            component: 'kube-state-metrics',
            newVersion: '1.3.1',
            oldVersion: '1.3.0',
          },
          {
            changeType: 1,
            component: 'kubernetes',
            newVersion: '1.20.6',
            oldVersion: '1.18.0',
          },
          {
            changeType: 1,
            component: 'metrics-server',
            newVersion: '1.3.0',
            oldVersion: '1.2.1',
          },
          {
            changeType: 1,
            component: 'net-exporter',
            newVersion: '1.10.1',
            oldVersion: '1.9.2',
          },
          {
            changeType: 1,
            component: 'node-exporter',
            newVersion: '1.7.2',
            oldVersion: '1.7.1',
          },
        ],
      } as ui.IReleaseComponentsDiff);
    });
  });
});
