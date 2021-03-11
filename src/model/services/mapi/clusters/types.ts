import { ICoreV1ObjectReference } from '../core/types';
import { IMetaV1List, IMetaV1ObjectMeta } from '../meta/types';

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

export interface ICapiV1Alpha3ClusterList
  extends IMetaV1List<ICapiV1Alpha3Cluster> {}
