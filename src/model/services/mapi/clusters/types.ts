export interface IMetaV1ObjectMeta {
  name: string;
  namespace: string;
  resourceVersion: string;
  selfLink: string;
  uid: string;
  creationTimestamp: string;
  finalizers: string[];
  generation: number;
  annotations?: Record<string, string>;
  deletionTimestamp?: string;
  labels?: Record<string, string>;
}

export interface IMetaV1TypeMeta {
  resourceVersion: string;
  selfLink: string;
}

export interface ICoreV1ObjectReference {
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
  resourceVersion: string;
  uid: string;
}

export interface ICAPIV1Alpha3ClusterSpecClusterNetwork {
  apiServerPort: number;
  serviceDomain: string;
  services: {
    cidrBlocks: string[];
  };
}

export interface ICAPIV1Alpha3ClusterSpecControlPlaneNetwork {
  host: string;
  port: number;
}

export interface ICAPIV1Alpha3ClusterSpec {
  clusterNetwork: ICAPIV1Alpha3ClusterSpecClusterNetwork;
  controlPlaneEndpoint: ICAPIV1Alpha3ClusterSpecControlPlaneNetwork;
  controlPlaneRef: ICoreV1ObjectReference;
  infrastructureRef: ICoreV1ObjectReference;
}

export interface ICAPIV1Alpha3ClusterStatusCondition {
  lastTransitionTime: string;
  status: string;
  type: string;
  message?: string;
  reason?: string;
  severity?: string;
}

export interface ICAPIV1Alpha3ClusterStatus {
  conditions: ICAPIV1Alpha3ClusterStatusCondition[];
  controlPlaneInitialized: boolean;
  controlPlaneReady: boolean;
  infrastructureReady: boolean;
  observedGeneration: number;
  phase: string;
}

export interface ICAPIV1Alpha3Cluster {
  apiVersion: string;
  kind: string;
  metadata: IMetaV1ObjectMeta;
  spec: ICAPIV1Alpha3ClusterSpec;
  status: ICAPIV1Alpha3ClusterStatus;
}

export interface IMetaV1List<T> {
  apiVersion: string;
  kind: string;
  metadata: IMetaV1TypeMeta;
  items: T[];
}

export interface ICAPIV1Alpha3ClusterList
  extends IMetaV1List<ICAPIV1Alpha3Cluster> {}
