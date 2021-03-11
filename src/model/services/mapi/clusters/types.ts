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
  resourceVersion?: string;
  uid?: string;
}

export interface ICapiV1Alpha3ClusterSpecClusterNetwork {
  apiServerPort: number;
  serviceDomain: string;
  services: {
    cidrBlocks: string[];
  };
}

export interface ICapiV1Alpha3ClusterSpecControlPlaneNetwork {
  host: string;
  port: number;
}

export interface ICapiV1Alpha3ClusterSpec {
  clusterNetwork: ICapiV1Alpha3ClusterSpecClusterNetwork;
  controlPlaneEndpoint: ICapiV1Alpha3ClusterSpecControlPlaneNetwork;
  controlPlaneRef: ICoreV1ObjectReference;
  infrastructureRef: ICoreV1ObjectReference;
}

export interface ICapiV1Alpha3ClusterStatusCondition {
  lastTransitionTime: string;
  status: string;
  type: string;
  message?: string;
  reason?: string;
  severity?: string;
}

export interface ICapiV1Alpha3ClusterStatus {
  conditions: ICapiV1Alpha3ClusterStatusCondition[];
  controlPlaneInitialized: boolean;
  controlPlaneReady: boolean;
  infrastructureReady: boolean;
  observedGeneration: number;
  phase: string;
}

export interface ICapiV1Alpha3Cluster {
  apiVersion: string;
  kind: string;
  metadata: IMetaV1ObjectMeta;
  spec: ICapiV1Alpha3ClusterSpec;
  status: ICapiV1Alpha3ClusterStatus;
}

export interface IMetaV1List<T> {
  apiVersion: string;
  kind: string;
  metadata: IMetaV1TypeMeta;
  items: T[];
}

export interface ICapiV1Alpha3ClusterList
  extends IMetaV1List<ICapiV1Alpha3Cluster> {}
