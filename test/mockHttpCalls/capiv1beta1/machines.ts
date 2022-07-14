import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';

// MachineList for randomClusterGCP1's control plane
export const randomClusterGCP1MachineList: capiv1beta1.IMachineList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'MachineList',
  metadata: {
    resourceVersion: '16045121',
  },
  items: [
    {
      apiVersion: 'cluster.x-k8s.io/v1beta1',
      kind: 'Machine',
      metadata: {
        annotations: {
          'controlplane.cluster.x-k8s.io/kubeadm-cluster-configuration':
            '{"etcd":{"local":{"imageTag":"3.5.4-0","extraArgs":{"quota-backend-bytes":"8589934592"}}},"networking":{"serviceSubnet":"172.31.0.0/16"},"apiServer":{"extraArgs":{"audit-log-maxage":"30","audit-log-maxbackup":"30","audit-log-maxsize":"100","audit-log-path":"/var/log/apiserver/audit.log","audit-policy-file":"/etc/kubernetes/policies/audit-policy.yaml","cloud-provider":"gce","enable-admission-plugins":"NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,DefaultStorageClass,PersistentVolumeClaimResize,Priority,DefaultTolerationSeconds,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,PodSecurityPolicy","encryption-provider-config":"/etc/kubernetes/encryption/config.yaml","feature-gates":"TTLAfterFinished=true","kubelet-preferred-address-types":"InternalIP","profiling":"false","runtime-config":"api/all=true,scheduling.k8s.io/v1alpha1=true","service-account-lookup":"true","service-cluster-ip-range":"172.31.0.0/16","tls-cipher-suites":"TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_128_GCM_SHA256"},"extraVolumes":[{"name":"auditlog","hostPath":"/var/log/apiserver","mountPath":"/var/log/apiserver","pathType":"DirectoryOrCreate"},{"name":"policies","hostPath":"/etc/kubernetes/policies","mountPath":"/etc/kubernetes/policies","pathType":"DirectoryOrCreate"},{"name":"encryption","hostPath":"/etc/kubernetes/encryption","mountPath":"/etc/kubernetes/encryption","pathType":"DirectoryOrCreate"}],"certSANs":["api.m317f.gtest.gigantic.io"],"timeoutForControlPlane":"20m0s"},"controllerManager":{"extraArgs":{"allocate-node-cidrs":"false","bind-address":"0.0.0.0","cloud-config":"/etc/kubernetes/gcp.conf","cloud-provider":"gce"},"extraVolumes":[{"name":"cloud-config","hostPath":"/etc/kubernetes/gcp.conf","mountPath":"/etc/kubernetes/gcp.conf","readOnly":true}]},"scheduler":{"extraArgs":{"bind-address":"0.0.0.0"}},"dns":{}}',
        },
        creationTimestamp: '2022-07-12T06:28:41Z',
        finalizers: ['machine.cluster.x-k8s.io'],
        generation: 3,
        labels: {
          app: 'cluster-gcp',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/version': '0.15.1',
          'application.giantswarm.io/team': 'phoenix',
          'cluster.x-k8s.io/cluster-name': 'm317f',
          'cluster.x-k8s.io/control-plane': '',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/organization': 'org1',
          'helm.sh/chart': 'cluster-gcp-0.15.1',
        },
        name: 'm317f-pksll',
        namespace: 'org-org1',
        ownerReferences: [
          {
            apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'KubeadmControlPlane',
            name: 'm317f',
            uid: '7c0c0be2-b108-402e-97c2-ffc5ee70e9cc',
          },
        ],
        resourceVersion: '14270245',
        uid: 'c9d1790c-3019-455f-82c4-fbc3fed24a61',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'm317f-hmh9n',
            namespace: 'org-org1',
            uid: '7c823b51-4334-494a-becb-6ec865e70479',
          },
          dataSecretName: 'm317f-hmh9n',
        },
        clusterName: 'm317f',
        failureDomain: 'europe-west3-c',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'GCPMachine',
          name: 'm317f-control-plane-18a2c814-b9px5',
          namespace: 'org-org1',
          uid: '300a466d-ee3e-4a79-9955-134006078ac4',
        },
        providerID:
          'gce://giantswarm-352614/europe-west3-c/m317f-control-plane-18a2c814-b9px5',
        version: 'v1.22.10',
      },
      status: {
        addresses: [
          {
            address: '10.156.0.8',
            type: 'InternalIP',
          },
          {
            address:
              'm317f-control-plane-18a2c814-b9px5.europe-west3-c.c.giantswarm-352614.internal',
            type: 'InternalDNS',
          },
          {
            address:
              'm317f-control-plane-18a2c814-b9px5.c.giantswarm-352614.internal',
            type: 'InternalDNS',
          },
          {
            address: 'm317f-control-plane-18a2c814-b9px5',
            type: 'InternalDNS',
          },
        ],
        bootstrapReady: true,
        conditions: [
          {
            lastTransitionTime: '2022-07-12T06:28:53Z',
            status: 'True',
            type: 'Ready',
          },
          {
            lastTransitionTime: '2022-07-12T06:30:30Z',
            status: 'True',
            type: 'APIServerPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:41Z',
            status: 'True',
            type: 'BootstrapReady',
          },
          {
            lastTransitionTime: '2022-07-12T06:30:39Z',
            status: 'True',
            type: 'ControllerManagerPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:30:39Z',
            status: 'True',
            type: 'EtcdMemberHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:30:39Z',
            status: 'True',
            type: 'EtcdPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:53Z',
            status: 'True',
            type: 'InfrastructureReady',
          },
          {
            lastTransitionTime: '2022-07-12T06:30:27Z',
            status: 'True',
            type: 'NodeHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:30:30Z',
            status: 'True',
            type: 'SchedulerPodHealthy',
          },
        ],
        infrastructureReady: true,
        lastUpdated: '2022-07-12T06:29:57Z',
        nodeInfo: {
          architecture: 'amd64',
          bootID: 'c8bd0246-ecd9-40b1-969e-5363f3b7547f',
          containerRuntimeVersion: 'containerd://1.6.2',
          kernelVersion: '5.13.0-1033-gcp',
          kubeProxyVersion: 'v1.22.10',
          kubeletVersion: 'v1.22.10',
          machineID: '886fac3de542ea601f48a5eedc9d1b28',
          operatingSystem: 'linux',
          osImage: 'Ubuntu 20.04.4 LTS',
          systemUUID: '886fac3d-e542-ea60-1f48-a5eedc9d1b28',
        },
        nodeRef: {
          apiVersion: 'v1',
          kind: 'Node',
          name: 'm317f-control-plane-18a2c814-b9px5',
          uid: '6716b7dc-cdb2-4440-84bf-6d10d7444587',
        },
        observedGeneration: 3,
        phase: 'Running',
      },
    },
    {
      apiVersion: 'cluster.x-k8s.io/v1beta1',
      kind: 'Machine',
      metadata: {
        annotations: {
          'controlplane.cluster.x-k8s.io/kubeadm-cluster-configuration':
            '{"etcd":{"local":{"imageTag":"3.5.4-0","extraArgs":{"quota-backend-bytes":"8589934592"}}},"networking":{"serviceSubnet":"172.31.0.0/16"},"apiServer":{"extraArgs":{"audit-log-maxage":"30","audit-log-maxbackup":"30","audit-log-maxsize":"100","audit-log-path":"/var/log/apiserver/audit.log","audit-policy-file":"/etc/kubernetes/policies/audit-policy.yaml","cloud-provider":"gce","enable-admission-plugins":"NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,DefaultStorageClass,PersistentVolumeClaimResize,Priority,DefaultTolerationSeconds,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,PodSecurityPolicy","encryption-provider-config":"/etc/kubernetes/encryption/config.yaml","feature-gates":"TTLAfterFinished=true","kubelet-preferred-address-types":"InternalIP","profiling":"false","runtime-config":"api/all=true,scheduling.k8s.io/v1alpha1=true","service-account-lookup":"true","service-cluster-ip-range":"172.31.0.0/16","tls-cipher-suites":"TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_128_GCM_SHA256"},"extraVolumes":[{"name":"auditlog","hostPath":"/var/log/apiserver","mountPath":"/var/log/apiserver","pathType":"DirectoryOrCreate"},{"name":"policies","hostPath":"/etc/kubernetes/policies","mountPath":"/etc/kubernetes/policies","pathType":"DirectoryOrCreate"},{"name":"encryption","hostPath":"/etc/kubernetes/encryption","mountPath":"/etc/kubernetes/encryption","pathType":"DirectoryOrCreate"}],"certSANs":["api.m317f.gtest.gigantic.io"],"timeoutForControlPlane":"20m0s"},"controllerManager":{"extraArgs":{"allocate-node-cidrs":"false","bind-address":"0.0.0.0","cloud-config":"/etc/kubernetes/gcp.conf","cloud-provider":"gce"},"extraVolumes":[{"name":"cloud-config","hostPath":"/etc/kubernetes/gcp.conf","mountPath":"/etc/kubernetes/gcp.conf","readOnly":true}]},"scheduler":{"extraArgs":{"bind-address":"0.0.0.0"}},"dns":{}}',
        },
        creationTimestamp: '2022-07-12T06:21:26Z',
        finalizers: ['machine.cluster.x-k8s.io'],
        generation: 3,
        labels: {
          app: 'cluster-gcp',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/version': '0.15.1',
          'application.giantswarm.io/team': 'phoenix',
          'cluster.x-k8s.io/cluster-name': 'm317f',
          'cluster.x-k8s.io/control-plane': '',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/organization': 'org1',
          'helm.sh/chart': 'cluster-gcp-0.15.1',
        },
        name: 'm317f-swfld',
        namespace: 'org-org1',
        ownerReferences: [
          {
            apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'KubeadmControlPlane',
            name: 'm317f',
            uid: '7c0c0be2-b108-402e-97c2-ffc5ee70e9cc',
          },
        ],
        resourceVersion: '14268350',
        uid: '00d5a7db-31f3-4d62-9aec-30d75b1e981a',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'm317f-scnxk',
            namespace: 'org-org1',
            uid: 'dcb4a1e1-d683-4e2d-9c78-e9e5045ecd9f',
          },
          dataSecretName: 'm317f-scnxk',
        },
        clusterName: 'm317f',
        failureDomain: 'europe-west3-a',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'GCPMachine',
          name: 'm317f-control-plane-18a2c814-95xgz',
          namespace: 'org-org1',
          uid: 'e711a468-5306-4928-b7e7-2ae6ae825bec',
        },
        providerID:
          'gce://giantswarm-352614/europe-west3-a/m317f-control-plane-18a2c814-95xgz',
        version: 'v1.22.10',
      },
      status: {
        addresses: [
          {
            address: '10.156.0.2',
            type: 'InternalIP',
          },
          {
            address:
              'm317f-control-plane-18a2c814-95xgz.europe-west3-a.c.giantswarm-352614.internal',
            type: 'InternalDNS',
          },
          {
            address:
              'm317f-control-plane-18a2c814-95xgz.c.giantswarm-352614.internal',
            type: 'InternalDNS',
          },
          {
            address: 'm317f-control-plane-18a2c814-95xgz',
            type: 'InternalDNS',
          },
        ],
        bootstrapReady: true,
        conditions: [
          {
            lastTransitionTime: '2022-07-12T06:22:07Z',
            status: 'True',
            type: 'Ready',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:18Z',
            status: 'True',
            type: 'APIServerPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:21:27Z',
            status: 'True',
            type: 'BootstrapReady',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:20Z',
            status: 'True',
            type: 'ControllerManagerPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:41Z',
            status: 'True',
            type: 'EtcdMemberHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:26:23Z',
            status: 'True',
            type: 'EtcdPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:22:07Z',
            status: 'True',
            type: 'InfrastructureReady',
          },
          {
            lastTransitionTime: '2022-07-12T06:27:54Z',
            status: 'True',
            type: 'NodeHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:19Z',
            status: 'True',
            type: 'SchedulerPodHealthy',
          },
        ],
        infrastructureReady: true,
        lastUpdated: '2022-07-12T06:25:26Z',
        nodeInfo: {
          architecture: 'amd64',
          bootID: '2512d68d-abe7-4bf2-b532-51e87bf63d1e',
          containerRuntimeVersion: 'containerd://1.6.2',
          kernelVersion: '5.13.0-1033-gcp',
          kubeProxyVersion: 'v1.22.10',
          kubeletVersion: 'v1.22.10',
          machineID: '5257034993047a6394d050efef781249',
          operatingSystem: 'linux',
          osImage: 'Ubuntu 20.04.4 LTS',
          systemUUID: '52570349-9304-7a63-94d0-50efef781249',
        },
        nodeRef: {
          apiVersion: 'v1',
          kind: 'Node',
          name: 'm317f-control-plane-18a2c814-95xgz',
          uid: 'd6e2ffb5-0fba-4c33-80bf-aed05cfc5f90',
        },
        observedGeneration: 3,
        phase: 'Running',
      },
    },
    {
      apiVersion: 'cluster.x-k8s.io/v1beta1',
      kind: 'Machine',
      metadata: {
        annotations: {
          'controlplane.cluster.x-k8s.io/kubeadm-cluster-configuration':
            '{"etcd":{"local":{"imageTag":"3.5.4-0","extraArgs":{"quota-backend-bytes":"8589934592"}}},"networking":{"serviceSubnet":"172.31.0.0/16"},"apiServer":{"extraArgs":{"audit-log-maxage":"30","audit-log-maxbackup":"30","audit-log-maxsize":"100","audit-log-path":"/var/log/apiserver/audit.log","audit-policy-file":"/etc/kubernetes/policies/audit-policy.yaml","cloud-provider":"gce","enable-admission-plugins":"NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,DefaultStorageClass,PersistentVolumeClaimResize,Priority,DefaultTolerationSeconds,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,PodSecurityPolicy","encryption-provider-config":"/etc/kubernetes/encryption/config.yaml","feature-gates":"TTLAfterFinished=true","kubelet-preferred-address-types":"InternalIP","profiling":"false","runtime-config":"api/all=true,scheduling.k8s.io/v1alpha1=true","service-account-lookup":"true","service-cluster-ip-range":"172.31.0.0/16","tls-cipher-suites":"TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_128_GCM_SHA256"},"extraVolumes":[{"name":"auditlog","hostPath":"/var/log/apiserver","mountPath":"/var/log/apiserver","pathType":"DirectoryOrCreate"},{"name":"policies","hostPath":"/etc/kubernetes/policies","mountPath":"/etc/kubernetes/policies","pathType":"DirectoryOrCreate"},{"name":"encryption","hostPath":"/etc/kubernetes/encryption","mountPath":"/etc/kubernetes/encryption","pathType":"DirectoryOrCreate"}],"certSANs":["api.m317f.gtest.gigantic.io"],"timeoutForControlPlane":"20m0s"},"controllerManager":{"extraArgs":{"allocate-node-cidrs":"false","bind-address":"0.0.0.0","cloud-config":"/etc/kubernetes/gcp.conf","cloud-provider":"gce"},"extraVolumes":[{"name":"cloud-config","hostPath":"/etc/kubernetes/gcp.conf","mountPath":"/etc/kubernetes/gcp.conf","readOnly":true}]},"scheduler":{"extraArgs":{"bind-address":"0.0.0.0"}},"dns":{}}',
        },
        creationTimestamp: '2022-07-12T06:26:38Z',
        finalizers: ['machine.cluster.x-k8s.io'],
        generation: 3,
        labels: {
          app: 'cluster-gcp',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/version': '0.15.1',
          'application.giantswarm.io/team': 'phoenix',
          'cluster.x-k8s.io/cluster-name': 'm317f',
          'cluster.x-k8s.io/control-plane': '',
          'giantswarm.io/cluster': 'm317f',
          'giantswarm.io/organization': 'org1',
          'helm.sh/chart': 'cluster-gcp-0.15.1',
        },
        name: 'm317f-w6k7j',
        namespace: 'org-org1',
        ownerReferences: [
          {
            apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'KubeadmControlPlane',
            name: 'm317f',
            uid: '7c0c0be2-b108-402e-97c2-ffc5ee70e9cc',
          },
        ],
        resourceVersion: '14268302',
        uid: '4fa16d86-fd60-4d95-a0af-631e2d03f345',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'm317f-tqzgl',
            namespace: 'org-org1',
            uid: '36db9147-e7e7-483d-bd62-89879bd6fd96',
          },
          dataSecretName: 'm317f-tqzgl',
        },
        clusterName: 'm317f',
        failureDomain: 'europe-west3-b',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'GCPMachine',
          name: 'm317f-control-plane-18a2c814-llbhd',
          namespace: 'org-org1',
          uid: 'f5b81288-a397-49f3-b226-82ad41622823',
        },
        providerID:
          'gce://giantswarm-352614/europe-west3-b/m317f-control-plane-18a2c814-llbhd',
        version: 'v1.22.10',
      },
      status: {
        addresses: [
          {
            address: '10.156.0.7',
            type: 'InternalIP',
          },
          {
            address:
              'm317f-control-plane-18a2c814-llbhd.europe-west3-b.c.giantswarm-352614.internal',
            type: 'InternalDNS',
          },
          {
            address:
              'm317f-control-plane-18a2c814-llbhd.c.giantswarm-352614.internal',
            type: 'InternalDNS',
          },
          {
            address: 'm317f-control-plane-18a2c814-llbhd',
            type: 'InternalDNS',
          },
        ],
        bootstrapReady: true,
        conditions: [
          {
            lastTransitionTime: '2022-07-12T06:26:49Z',
            status: 'True',
            type: 'Ready',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:22Z',
            status: 'True',
            type: 'APIServerPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:26:39Z',
            status: 'True',
            type: 'BootstrapReady',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:39Z',
            status: 'True',
            type: 'ControllerManagerPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:17Z',
            status: 'True',
            type: 'EtcdMemberHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:22Z',
            status: 'True',
            type: 'EtcdPodHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:26:49Z',
            status: 'True',
            type: 'InfrastructureReady',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:33Z',
            status: 'True',
            type: 'NodeHealthy',
          },
          {
            lastTransitionTime: '2022-07-12T06:28:39Z',
            status: 'True',
            type: 'SchedulerPodHealthy',
          },
        ],
        infrastructureReady: true,
        lastUpdated: '2022-07-12T06:27:54Z',
        nodeInfo: {
          architecture: 'amd64',
          bootID: '1d2f26f0-f5e0-422e-aa80-ff2f5e7b03b2',
          containerRuntimeVersion: 'containerd://1.6.2',
          kernelVersion: '5.13.0-1033-gcp',
          kubeProxyVersion: 'v1.22.10',
          kubeletVersion: 'v1.22.10',
          machineID: 'd087a19b5bb2213a7b43167d17966345',
          operatingSystem: 'linux',
          osImage: 'Ubuntu 20.04.4 LTS',
          systemUUID: 'd087a19b-5bb2-213a-7b43-167d17966345',
        },
        nodeRef: {
          apiVersion: 'v1',
          kind: 'Node',
          name: 'm317f-control-plane-18a2c814-llbhd',
          uid: 'd4da3302-f286-4f73-965c-1d4f978f5012',
        },
        observedGeneration: 3,
        phase: 'Running',
      },
    },
  ],
};
