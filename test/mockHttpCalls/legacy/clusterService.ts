import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';

export const clusterServiceStorage: gscorev1alpha1.IStorageConfig = {
  apiVersion: 'core.giantswarm.io/v1alpha1',
  kind: gscorev1alpha1.StorageConfig,
  metadata: {
    name: 'cluster-service',
    namespace: 'giantswarm',
  },
  spec: {
    storage: {
      data: {
        '/serial-store/cluster/j5y9m/serial/as:df:3f:5f': JSON.stringify({
          cluster_id: 'j5y9m',
          common_name: 'test.user.api.j5y9m.k8s.test.gigantic.io',
          create_date: new Date().toISOString(),
          description: 'Added by user test@test.com using Happa',
          certificate_organizations: '',
          serial_number: 'as:df:3f:5f',
          ttl: 24,
        }),
        '/serial-store/cluster/j5y9m/serial/5f:as:df:2f': JSON.stringify({
          cluster_id: 'j5y9m',
          common_name: 'test.user.api.j5y9m.k8s.test.gigantic.io',
          create_date: new Date().toISOString(),
          description: 'Added by user test2@test.com using Happa',
          certificate_organizations: '',
          serial_number: '5f:as:df:2f',
          // eslint-disable-next-line no-magic-numbers
          ttl: 7 * 24,
        }),
        '/serial-store/cluster/j5y9m/serial/2f:03:2s:ws': JSON.stringify({
          cluster_id: 'j5y9m',
          common_name: 'test.user.api.j5y9m.k8s.test.gigantic.io',
          create_date: '2019-06-21T07:58:42.364252318Z',
          description: 'Added by user test@test.com using Happa',
          certificate_organizations: '',
          serial_number: '2f:03:2s:ws',
          ttl: 0,
        }),
      },
    },
  },
};
