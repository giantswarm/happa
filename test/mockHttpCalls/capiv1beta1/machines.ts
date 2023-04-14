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

// MachineList for randomClusterCAPA1's control plane
export const randomClusterCAPA1MachineList: capiv1beta1.IMachineList = {
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
            '{"etcd":{"local":{"extraArgs":{"quota-backend-bytes":"8589934592"}}},"networking":{"serviceSubnet":"172.31.0.0/16"},"apiServer":{"extraArgs":{"audit-log-maxage":"30","audit-log-maxbackup":"30","audit-log-maxsize":"100","audit-log-path":"/var/log/apiserver/audit.log","audit-policy-file":"/etc/kubernetes/policies/audit-policy.yaml","cloud-provider":"aws","enable-admission-plugins":"NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,DefaultStorageClass,PersistentVolumeClaimResize,Priority,DefaultTolerationSeconds,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,PodSecurityPolicy","encryption-provider-config":"/etc/kubernetes/encryption/config.yaml","feature-gates":"TTLAfterFinished=true","kubelet-preferred-address-types":"InternalIP","profiling":"false","runtime-config":"api/all=true,scheduling.k8s.io/v1alpha1=true","service-account-lookup":"true","service-cluster-ip-range":"172.31.0.0/16","tls-cipher-suites":"TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_128_GCM_SHA256"},"extraVolumes":[{"name":"auditlog","hostPath":"/var/log/apiserver","mountPath":"/var/log/apiserver","pathType":"DirectoryOrCreate"},{"name":"policies","hostPath":"/etc/kubernetes/policies","mountPath":"/etc/kubernetes/policies","pathType":"DirectoryOrCreate"},{"name":"encryption","hostPath":"/etc/kubernetes/encryption","mountPath":"/etc/kubernetes/encryption","pathType":"DirectoryOrCreate"}],"certSANs":["api.asdf1.gaws.gigantic.io","127.0.0.1"],"timeoutForControlPlane":"20m0s"},"controllerManager":{"extraArgs":{"allocate-node-cidrs":"true","bind-address":"0.0.0.0","cloud-provider":"aws","cluster-cidr":"100.64.0.0/12"}},"scheduler":{"extraArgs":{"bind-address":"0.0.0.0"}},"dns":{}}',
        },
        creationTimestamp: '2022-09-29T09:29:27Z',
        finalizers: ['machine.cluster.x-k8s.io'],
        generation: 3,
        labels: {
          app: 'cluster-aws',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/version': '0.10.0',
          'application.giantswarm.io/team': 'hydra',
          'cluster.x-k8s.io/cluster-name': 'asdf1',
          'cluster.x-k8s.io/control-plane': '',
          'cluster.x-k8s.io/watch-filter': 'capi',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/organization': 'org1',
          'helm.sh/chart': 'cluster-aws-0.10.0',
          'release.giantswarm.io/version': '20.0.0-alpha1',
        },
        name: 'asdf1-4gcc8',
        namespace: 'org-org1',
        ownerReferences: [
          {
            apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'KubeadmControlPlane',
            name: 'asdf1',
            uid: '861633d0-52ad-4425-a595-c68d2433a07a',
          },
        ],
        resourceVersion: '62762859',
        uid: '7cde8ab6-a990-4f63-8c51-55e936d1611f',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'asdf1-gl2x8',
            namespace: 'org-org1',
            uid: '93448208-c7d7-4345-92d8-262e95ff1013',
          },
          dataSecretName: 'asdf1-gl2x8',
        },
        clusterName: 'asdf1',
        failureDomain: 'eu-west-2b',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'AWSMachine',
          name: 'asdf1-control-plane-a9317eaf-pzlzv',
          namespace: 'org-org1',
          uid: '49813988-1dd5-42d8-ad63-4faa4eee7db4',
        },
        providerID: 'aws:///eu-west-2b/i-00d72aa05a2ec69af',
        version: 'v1.22.12',
      },
      status: {
        addresses: [
          {
            address: 'ip-10-0-133-8.eu-west-2.compute.internal',
            type: 'InternalDNS',
          },
          {
            address: '10.0.133.8',
            type: 'InternalIP',
          },
        ],
        bootstrapReady: true,
        conditions: [
          {
            lastTransitionTime: '2022-09-29T09:29:44Z',
            status: 'True',
            type: 'Ready',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:34Z',
            status: 'True',
            type: 'APIServerPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:27Z',
            status: 'True',
            type: 'BootstrapReady',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:34Z',
            status: 'True',
            type: 'ControllerManagerPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:04Z',
            status: 'True',
            type: 'EtcdMemberHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:34Z',
            status: 'True',
            type: 'EtcdPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:44Z',
            status: 'True',
            type: 'InfrastructureReady',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:46Z',
            status: 'True',
            type: 'NodeHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:34Z',
            status: 'True',
            type: 'SchedulerPodHealthy',
          },
        ],
        infrastructureReady: true,
        lastUpdated: '2022-09-29T09:30:56Z',
        nodeInfo: {
          architecture: 'amd64',
          bootID: 'f7277b97-ce50-425f-9117-2ba790f5e675',
          containerRuntimeVersion: 'containerd://1.6.2',
          kernelVersion: '5.15.0-1015-aws',
          kubeProxyVersion: 'v1.22.12',
          kubeletVersion: 'v1.22.12',
          machineID: 'ec278a90678192f27b30c34edb461f1c',
          operatingSystem: 'linux',
          osImage: 'Ubuntu 20.04.4 LTS',
          systemUUID: 'ec278a90-6781-92f2-7b30-c34edb461f1c',
        },
        nodeRef: {
          apiVersion: 'v1',
          kind: 'Node',
          name: 'ip-10-0-133-8.eu-west-2.compute.internal',
          uid: 'e4045660-e8f5-4666-a499-877596b0c1df',
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
            '{"etcd":{"local":{"extraArgs":{"quota-backend-bytes":"8589934592"}}},"networking":{"serviceSubnet":"172.31.0.0/16"},"apiServer":{"extraArgs":{"audit-log-maxage":"30","audit-log-maxbackup":"30","audit-log-maxsize":"100","audit-log-path":"/var/log/apiserver/audit.log","audit-policy-file":"/etc/kubernetes/policies/audit-policy.yaml","cloud-provider":"aws","enable-admission-plugins":"NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,DefaultStorageClass,PersistentVolumeClaimResize,Priority,DefaultTolerationSeconds,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,PodSecurityPolicy","encryption-provider-config":"/etc/kubernetes/encryption/config.yaml","feature-gates":"TTLAfterFinished=true","kubelet-preferred-address-types":"InternalIP","profiling":"false","runtime-config":"api/all=true,scheduling.k8s.io/v1alpha1=true","service-account-lookup":"true","service-cluster-ip-range":"172.31.0.0/16","tls-cipher-suites":"TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_128_GCM_SHA256"},"extraVolumes":[{"name":"auditlog","hostPath":"/var/log/apiserver","mountPath":"/var/log/apiserver","pathType":"DirectoryOrCreate"},{"name":"policies","hostPath":"/etc/kubernetes/policies","mountPath":"/etc/kubernetes/policies","pathType":"DirectoryOrCreate"},{"name":"encryption","hostPath":"/etc/kubernetes/encryption","mountPath":"/etc/kubernetes/encryption","pathType":"DirectoryOrCreate"}],"certSANs":["api.asdf1.gaws.gigantic.io","127.0.0.1"],"timeoutForControlPlane":"20m0s"},"controllerManager":{"extraArgs":{"allocate-node-cidrs":"true","bind-address":"0.0.0.0","cloud-provider":"aws","cluster-cidr":"100.64.0.0/12"}},"scheduler":{"extraArgs":{"bind-address":"0.0.0.0"}},"dns":{}}',
        },
        creationTimestamp: '2022-09-29T09:24:11Z',
        finalizers: ['machine.cluster.x-k8s.io'],
        generation: 3,
        labels: {
          app: 'cluster-aws',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/version': '0.10.0',
          'application.giantswarm.io/team': 'hydra',
          'cluster.x-k8s.io/cluster-name': 'asdf1',
          'cluster.x-k8s.io/control-plane': '',
          'cluster.x-k8s.io/watch-filter': 'capi',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/organization': 'org1',
          'helm.sh/chart': 'cluster-aws-0.10.0',
          'release.giantswarm.io/version': '20.0.0-alpha1',
        },
        name: 'asdf1-k4rj2',
        namespace: 'org-org1',
        ownerReferences: [
          {
            apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'KubeadmControlPlane',
            name: 'asdf1',
            uid: '861633d0-52ad-4425-a595-c68d2433a07a',
          },
        ],
        resourceVersion: '62762771',
        uid: '898544ee-4aa6-4123-9e1c-3524cfa6edb6',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'asdf1-wgffl',
            namespace: 'org-org1',
            uid: 'd6fc943b-885c-4496-939e-a8ca070bc50d',
          },
          dataSecretName: 'asdf1-wgffl',
        },
        clusterName: 'asdf1',
        failureDomain: 'eu-west-2c',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'AWSMachine',
          name: 'asdf1-control-plane-a9317eaf-zxmwb',
          namespace: 'org-org1',
          uid: '66de53a8-6cd7-4fd8-a516-84d37201dc6c',
        },
        providerID: 'aws:///eu-west-2c/i-062df494d6d742b92',
        version: 'v1.22.12',
      },
      status: {
        addresses: [
          {
            address: 'ip-10-0-244-79.eu-west-2.compute.internal',
            type: 'InternalDNS',
          },
          {
            address: '10.0.244.79',
            type: 'InternalIP',
          },
        ],
        bootstrapReady: true,
        conditions: [
          {
            lastTransitionTime: '2022-09-29T09:24:29Z',
            status: 'True',
            type: 'Ready',
          },
          {
            lastTransitionTime: '2022-09-29T09:27:30Z',
            status: 'True',
            type: 'APIServerPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:24:11Z',
            status: 'True',
            type: 'BootstrapReady',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:26Z',
            status: 'True',
            type: 'ControllerManagerPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:04Z',
            status: 'True',
            type: 'EtcdMemberHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:27:30Z',
            status: 'True',
            type: 'EtcdPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:24:29Z',
            status: 'True',
            type: 'InfrastructureReady',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:42Z',
            status: 'True',
            type: 'NodeHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:26Z',
            status: 'True',
            type: 'SchedulerPodHealthy',
          },
        ],
        infrastructureReady: true,
        lastUpdated: '2022-09-29T09:27:04Z',
        nodeInfo: {
          architecture: 'amd64',
          bootID: '7b9890f7-ea99-4664-93a7-25188c081c3b',
          containerRuntimeVersion: 'containerd://1.6.2',
          kernelVersion: '5.15.0-1015-aws',
          kubeProxyVersion: 'v1.22.12',
          kubeletVersion: 'v1.22.12',
          machineID: 'ec27e2a8dd42911456a04b33df361630',
          operatingSystem: 'linux',
          osImage: 'Ubuntu 20.04.4 LTS',
          systemUUID: 'ec27e2a8-dd42-9114-56a0-4b33df361630',
        },
        nodeRef: {
          apiVersion: 'v1',
          kind: 'Node',
          name: 'ip-10-0-244-79.eu-west-2.compute.internal',
          uid: '7923bb23-86b2-4a3e-8b28-0b37b57821fa',
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
            '{"etcd":{"local":{"extraArgs":{"quota-backend-bytes":"8589934592"}}},"networking":{"serviceSubnet":"172.31.0.0/16"},"apiServer":{"extraArgs":{"audit-log-maxage":"30","audit-log-maxbackup":"30","audit-log-maxsize":"100","audit-log-path":"/var/log/apiserver/audit.log","audit-policy-file":"/etc/kubernetes/policies/audit-policy.yaml","cloud-provider":"aws","enable-admission-plugins":"NamespaceLifecycle,LimitRanger,ServiceAccount,ResourceQuota,DefaultStorageClass,PersistentVolumeClaimResize,Priority,DefaultTolerationSeconds,MutatingAdmissionWebhook,ValidatingAdmissionWebhook,PodSecurityPolicy","encryption-provider-config":"/etc/kubernetes/encryption/config.yaml","feature-gates":"TTLAfterFinished=true","kubelet-preferred-address-types":"InternalIP","profiling":"false","runtime-config":"api/all=true,scheduling.k8s.io/v1alpha1=true","service-account-lookup":"true","service-cluster-ip-range":"172.31.0.0/16","tls-cipher-suites":"TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,TLS_RSA_WITH_AES_256_GCM_SHA384,TLS_RSA_WITH_AES_128_GCM_SHA256"},"extraVolumes":[{"name":"auditlog","hostPath":"/var/log/apiserver","mountPath":"/var/log/apiserver","pathType":"DirectoryOrCreate"},{"name":"policies","hostPath":"/etc/kubernetes/policies","mountPath":"/etc/kubernetes/policies","pathType":"DirectoryOrCreate"},{"name":"encryption","hostPath":"/etc/kubernetes/encryption","mountPath":"/etc/kubernetes/encryption","pathType":"DirectoryOrCreate"}],"certSANs":["api.asdf1.gaws.gigantic.io","127.0.0.1"],"timeoutForControlPlane":"20m0s"},"controllerManager":{"extraArgs":{"allocate-node-cidrs":"true","bind-address":"0.0.0.0","cloud-provider":"aws","cluster-cidr":"100.64.0.0/12"}},"scheduler":{"extraArgs":{"bind-address":"0.0.0.0"}},"dns":{}}',
        },
        creationTimestamp: '2022-09-29T09:27:30Z',
        finalizers: ['machine.cluster.x-k8s.io'],
        generation: 3,
        labels: {
          app: 'cluster-aws',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/version': '0.10.0',
          'application.giantswarm.io/team': 'hydra',
          'cluster.x-k8s.io/cluster-name': 'asdf1',
          'cluster.x-k8s.io/control-plane': '',
          'cluster.x-k8s.io/watch-filter': 'capi',
          'giantswarm.io/cluster': 'asdf1',
          'giantswarm.io/organization': 'org1',
          'helm.sh/chart': 'cluster-aws-0.10.0',
          'release.giantswarm.io/version': '20.0.0-alpha1',
        },
        name: 'asdf1-mh8tv',
        namespace: 'org-org1',
        ownerReferences: [
          {
            apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'KubeadmControlPlane',
            name: 'asdf1',
            uid: '861633d0-52ad-4425-a595-c68d2433a07a',
          },
        ],
        resourceVersion: '62762772',
        uid: 'c63ebcf3-49f9-4336-a093-10c603e327d2',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'asdf1-wcbl9',
            namespace: 'org-org1',
            uid: 'f1d2af61-7269-4f0b-a1ed-87e39c3350b8',
          },
          dataSecretName: 'asdf1-wcbl9',
        },
        clusterName: 'asdf1',
        failureDomain: 'eu-west-2a',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'AWSMachine',
          name: 'asdf1-control-plane-a9317eaf-6qdjj',
          namespace: 'org-org1',
          uid: '8ce589bd-f81e-4ffa-ae80-512a76365976',
        },
        providerID: 'aws:///eu-west-2a/i-0fc30ad24f2c14a55',
        version: 'v1.22.12',
      },
      status: {
        addresses: [
          {
            address: 'ip-10-0-107-232.eu-west-2.compute.internal',
            type: 'InternalDNS',
          },
          {
            address: '10.0.107.232',
            type: 'InternalIP',
          },
        ],
        bootstrapReady: true,
        conditions: [
          {
            lastTransitionTime: '2022-09-29T09:27:49Z',
            status: 'True',
            type: 'Ready',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:26Z',
            status: 'True',
            type: 'APIServerPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:27:30Z',
            status: 'True',
            type: 'BootstrapReady',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:26Z',
            status: 'True',
            type: 'ControllerManagerPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:14Z',
            status: 'True',
            type: 'EtcdMemberHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:26Z',
            status: 'True',
            type: 'EtcdPodHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:27:49Z',
            status: 'True',
            type: 'InfrastructureReady',
          },
          {
            lastTransitionTime: '2022-09-29T09:31:42Z',
            status: 'True',
            type: 'NodeHealthy',
          },
          {
            lastTransitionTime: '2022-09-29T09:29:18Z',
            status: 'True',
            type: 'SchedulerPodHealthy',
          },
        ],
        infrastructureReady: true,
        lastUpdated: '2022-09-29T09:29:00Z',
        nodeInfo: {
          architecture: 'amd64',
          bootID: 'e6a694b4-015f-4b6e-b5a0-1aa953043f34',
          containerRuntimeVersion: 'containerd://1.6.2',
          kernelVersion: '5.15.0-1015-aws',
          kubeProxyVersion: 'v1.22.12',
          kubeletVersion: 'v1.22.12',
          machineID: 'ec2c50ec24cd7d894b318763b2217f84',
          operatingSystem: 'linux',
          osImage: 'Ubuntu 20.04.4 LTS',
          systemUUID: 'ec2c50ec-24cd-7d89-4b31-8763b2217f84',
        },
        nodeRef: {
          apiVersion: 'v1',
          kind: 'Node',
          name: 'ip-10-0-107-232.eu-west-2.compute.internal',
          uid: 'e97c9613-1362-42a3-99dc-65eb037a7211',
        },
        observedGeneration: 3,
        phase: 'Running',
      },
    },
  ],
};

// MachineList for randomClusterCAPZ1's control plane
export const randomClusterCAPZ1MachineList: capiv1beta1.IMachineList = {
  kind: 'MachineList',
  metadata: {
    resourceVersion: '',
  },
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  items: [
    {
      apiVersion: 'cluster.x-k8s.io/v1beta1',
      kind: 'Machine',
      metadata: {
        creationTimestamp: '2023-03-15T12:57:15Z',
        finalizers: [],
        generation: 3,
        labels: {
          app: 'cluster-azure',
          'app.kubernetes.io/managed-by': 'Helm',
          'app.kubernetes.io/version': '',
          'application.giantswarm.io/team': 'team',
          'cluster.x-k8s.io/cluster-name': 'test12',
          'cluster.x-k8s.io/control-plane': '',
          'cluster.x-k8s.io/control-plane-name': 'test12',
          'giantswarm.io/cluster': 'test12',
          'giantswarm.io/organization': 'org1',
          'helm.sh/chart': 'cluster-azure-0.0.15',
        },
        name: 'test12-test12',
        namespace: 'org-org1',
        ownerReferences: [
          {
            apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
            blockOwnerDeletion: true,
            controller: true,
            kind: 'KubeadmControlPlane',
            name: 'test12',
            uid: '',
          },
        ],
        resourceVersion: '',
        uid: '',
      },
      spec: {
        bootstrap: {
          configRef: {
            apiVersion: 'bootstrap.cluster.x-k8s.io/v1beta1',
            kind: 'KubeadmConfig',
            name: 'test12-asdf2',
            namespace: 'org-org1',
            uid: '',
          },
        },
        clusterName: 'test12',
        failureDomain: '1',
        infrastructureRef: {
          apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
          kind: 'AzureMachine',
          name: 'test12-control-plane-test12',
          namespace: 'org-org1',
          uid: '',
        },
        providerID: '',
        version: 'v1.24.11',
      },
      status: {
        bootstrapReady: true,
        conditions: [
          {
            lastTransitionTime: '2023-04-04T02:57:59Z',
            status: 'True',
            type: 'Ready',
          },
          {
            lastTransitionTime: '2023-03-13T14:11:04Z',
            status: 'True',
            type: 'APIServerPodHealthy',
          },
          {
            lastTransitionTime: '2023-03-13T13:57:41Z',
            status: 'True',
            type: 'BootstrapReady',
          },
          {
            lastTransitionTime: '2023-03-13T14:11:04Z',
            status: 'True',
            type: 'ControllerManagerPodHealthy',
          },
          {
            lastTransitionTime: '2023-03-13T14:08:15Z',
            status: 'True',
            type: 'EtcdMemberHealthy',
          },
          {
            lastTransitionTime: '2023-03-13T14:11:17Z',
            status: 'True',
            type: 'EtcdPodHealthy',
          },
          {
            lastTransitionTime: '2023-04-04T02:57:59Z',
            status: 'True',
            type: 'InfrastructureReady',
          },
          {
            lastTransitionTime: '2023-03-13T14:10:47Z',
            status: 'True',
            type: 'NodeHealthy',
          },
          {
            lastTransitionTime: '2023-03-13T14:11:17Z',
            status: 'True',
            type: 'SchedulerPodHealthy',
          },
        ],
        infrastructureReady: true,
        observedGeneration: 3,
        phase: 'Running',
      },
    },
  ],
};
