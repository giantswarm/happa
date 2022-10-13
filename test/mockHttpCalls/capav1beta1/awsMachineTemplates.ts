import * as capav1beta1 from 'model/services/mapi/capav1beta1';

// AWSMachineTemplateList for randomClusterCAPA1's control plane
export const randomClusterCAPA1AWSMachineTemplateList: capav1beta1.IAWSMachineTemplateList =
  {
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'AWSMachineTemplateList',
    metadata: {
      resourceVersion: '16032957',
    },
    items: [
      {
        apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
        kind: 'AWSMachineTemplate',
        metadata: {
          annotations: {
            'meta.helm.sh/release-name': 'asdf1',
            'meta.helm.sh/release-namespace': 'org-org1',
          },
          creationTimestamp: '2022-09-29T09:20:55Z',
          finalizers: [
            'capa-iam-operator.finalizers.giantswarm.io/control-plane',
          ],
          generation: 1,
          labels: {
            app: 'cluster-aws',
            'app.kubernetes.io/managed-by': 'Helm',
            'app.kubernetes.io/version': '0.10.0',
            'application.giantswarm.io/team': 'hydra',
            'cluster.x-k8s.io/cluster-name': 'asdf1',
            'cluster.x-k8s.io/role': 'control-plane',
            'cluster.x-k8s.io/watch-filter': 'capi',
            'giantswarm.io/cluster': 'asdf1',
            'giantswarm.io/organization': 'org1',
            'helm.sh/chart': 'cluster-aws-0.10.0',
            'release.giantswarm.io/version': '20.0.0-alpha1',
          },
          name: 'asdf1-control-plane-a9317eaf',
          namespace: 'org-org1',
          ownerReferences: [
            {
              apiVersion: 'cluster.x-k8s.io/v1beta1',
              kind: 'Cluster',
              name: 'asdf1',
              uid: 'ca9441e2-eb15-48e6-940f-1eac8c5aa26a',
            },
          ],
          resourceVersion: '62755312',
          uid: '105aca26-5186-43a4-a9a5-2b10a102b971',
        },
        spec: {
          template: {
            metadata: {
              labels: {
                app: 'cluster-aws',
                'app.kubernetes.io/managed-by': 'Helm',
                'app.kubernetes.io/version': '0.10.0',
                'application.giantswarm.io/team': 'hydra',
                'cluster.x-k8s.io/cluster-name': 'asdf1',
                'cluster.x-k8s.io/role': 'control-plane',
                'cluster.x-k8s.io/watch-filter': 'capi',
                'giantswarm.io/cluster': 'asdf1',
                'giantswarm.io/organization': 'org1',
                'helm.sh/chart': 'cluster-aws-0.10.0',
                'release.giantswarm.io/version': '20.0.0-alpha1',
              },
            },
            spec: {
              ami: {},
              cloudInit: {},
              iamInstanceProfile: 'control-plane-asdf1',
              imageLookupBaseOS: 'ubuntu-20.04',
              imageLookupFormat: 'capa-ami-{{.BaseOS}}-{{.K8sVersion}}-00-gs',
              imageLookupOrg: '706635527432',
              instanceType: 'm5.xlarge',
              nonRootVolumes: [
                {
                  deviceName: '/dev/xvdc',
                  encrypted: true,
                  size: 100,
                  type: 'gp3',
                },
                {
                  deviceName: '/dev/xvdd',
                  encrypted: true,
                  size: 100,
                  type: 'gp3',
                },
                {
                  deviceName: '/dev/xvde',
                  encrypted: true,
                  size: 100,
                  type: 'gp3',
                },
              ],
              rootVolume: {
                size: 120,
                type: 'gp3',
              },
              sshKeyName: '',
            },
          },
        },
      },
    ],
  };
