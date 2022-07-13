import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';

// GCPMachineTemplateList for randomClusterGCP1's control plane
export const randomClusterGCP1GCPMachineTemplateListCP: capgv1beta1.IGCPMachineTemplateList =
  {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'GCPMachineTemplateList',
    metadata: {
      resourceVersion: '16032957',
    },
    items: [
      {
        apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
        kind: 'GCPMachineTemplate',
        metadata: {
          annotations: {
            'meta.helm.sh/release-name': 'm317f',
            'meta.helm.sh/release-namespace': 'org-org1',
          },
          creationTimestamp: '2022-07-13T08:29:54Z',
          finalizers: [
            'deletion-blocker-operator.finalizers.giantswarm.io.175659c9',
          ],
          generation: 3,
          labels: {
            app: 'cluster-gcp',
            'app.kubernetes.io/managed-by': 'Helm',
            'app.kubernetes.io/version': '0.15.1',
            'application.giantswarm.io/team': 'phoenix',
            'cluster.x-k8s.io/cluster-name': 'm317f',
            'cluster.x-k8s.io/role': 'control-plane',
            'giantswarm.io/cluster': 'm317f',
            'giantswarm.io/organization': 'giantswarm',
            'helm.sh/chart': 'cluster-gcp-0.15.1',
          },
          name: 'm317f-control-plane-18a2c123',
          namespace: 'org-org1',
          ownerReferences: [
            {
              apiVersion: 'cluster.x-k8s.io/v1beta1',
              kind: 'Cluster',
              name: 'm317f',
              uid: '7a2858d1-fbff-4337-b89f-e8b9dc41b113',
            },
          ],
          resourceVersion: '14261435',
          uid: '83b3c2dd-6fdf-4de4-be25-373636071846',
        },
        spec: {
          template: {
            spec: {
              additionalDisks: [
                {
                  deviceType: 'pd-ssd',
                  size: 100,
                },
                {
                  deviceType: 'pd-ssd',
                  size: 100,
                },
                {
                  deviceType: 'pd-ssd',
                  size: 100,
                },
              ],
              image:
                'https://www.googleapis.com/compute/v1/projects/giantswarm-vm-images/global/images/cluster-api-ubuntu-2004-v1-22-10-gs',
              instanceType: 'n2-standard-4',
              rootDeviceSize: 100,
              serviceAccounts: {
                email: 'default',
                scopes: [''],
              },
            },
          },
        },
      },
    ],
  };
