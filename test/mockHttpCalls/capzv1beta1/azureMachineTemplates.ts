import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';

// AzureMachineTemplateList for randomClusterCAPZ1's control plane
export const randomClusterCAPZ1AzureMachineTemplateListCP: capzv1beta1.IAzureMachineTemplateList =
  {
    kind: 'AzureMachineTemplateList',
    metadata: {
      resourceVersion: '',
    },
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    items: [
      {
        apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
        kind: 'AzureMachineTemplate',
        metadata: {
          annotations: {
            'meta.helm.sh/release-name': 'test12',
            'meta.helm.sh/release-namespace': 'org-org1',
          },
          creationTimestamp: '2023-03-28T10:38:26Z',
          finalizers: [],
          generation: 2,
          labels: {
            app: 'cluster-azure',
            'app.kubernetes.io/managed-by': 'Helm',
            'app.kubernetes.io/version': '',
            'application.giantswarm.io/team': 'team',
            'cluster.x-k8s.io/cluster-name': 'test12',
            'cluster.x-k8s.io/role': 'control-plane',
            'giantswarm.io/cluster': 'test12',
            'giantswarm.io/organization': 'giantswarm',
            'helm.sh/chart': 'cluster-azure-0.0.15',
          },
          name: 'test12-control-plane-test12',
          namespace: 'org-org1',
          ownerReferences: [
            {
              apiVersion: 'cluster.x-k8s.io/v1beta1',
              kind: 'Cluster',
              name: 'test12',
              uid: '',
            },
          ],
          resourceVersion: '',
          uid: '',
        },
        spec: {
          template: {
            metadata: {
              labels: {
                app: 'cluster-azure',
                'app.kubernetes.io/managed-by': 'Helm',
                'app.kubernetes.io/version': '',
                'application.giantswarm.io/team': 'team',
                'cluster.x-k8s.io/cluster-name': 'test12',
                'giantswarm.io/cluster': 'test12',
                'giantswarm.io/organization': 'org1',
                'helm.sh/chart': 'cluster-azure-0.0.15',
              },
            },
            spec: {
              osDisk: {
                osType: 'Linux',
              },
              vmSize: 'Standard_D4s_v3',
            },
          },
        },
      },
    ],
  };

// AzureMachineTemplate for randomClusterCAPZ1's worker node
export const randomClusterCAPZ1AzureMachineTemplate: capzv1beta1.IAzureMachineTemplate =
  {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'AzureMachineTemplate',
    metadata: {
      annotations: {
        'meta.helm.sh/release-name': 'test12',
        'meta.helm.sh/release-namespace': 'org-org1',
      },
      creationTimestamp: '2023-03-13T13:57:37Z',
      finalizers: [],
      generation: 1,
      labels: {
        app: 'cluster-azure',
        'app.kubernetes.io/managed-by': 'Helm',
        'app.kubernetes.io/version': '',
        'application.giantswarm.io/team': 'team',
        'cluster.x-k8s.io/cluster-name': 'test12',
        'giantswarm.io/cluster': 'test12',
        'giantswarm.io/machine-deployment': 'test12-md00',
        'giantswarm.io/organization': 'org1',
        'helm.sh/chart': 'cluster-azure-0.0.15',
      },
      name: 'test12-md00',
      namespace: 'org-org1',
      ownerReferences: [
        {
          apiVersion: 'cluster.x-k8s.io/v1beta1',
          kind: 'Cluster',
          name: 'test12',
          uid: '',
        },
      ],
      resourceVersion: '',
      uid: '',
    },
    spec: {
      template: {
        metadata: {
          labels: {
            app: 'cluster-azure',
            'app.kubernetes.io/managed-by': 'Helm',
            'app.kubernetes.io/version': '',
            'application.giantswarm.io/team': 'team',
            'cluster.x-k8s.io/cluster-name': 'test12',
            'giantswarm.io/cluster': 'test12',
            'giantswarm.io/organization': 'org1',
            'helm.sh/chart': 'cluster-azure-0.0.15',
          },
        },
        spec: {
          osDisk: {
            osType: 'Linux',
          },
          vmSize: 'Standard_D4s_v3',
        },
      },
    },
  };
