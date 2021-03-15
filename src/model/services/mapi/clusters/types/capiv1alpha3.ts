import * as corev1 from '../../types/corev1';
import * as metav1 from '../../types/metav1';

export interface IClusterNetwork {
  apiServerPort: number;
  serviceDomain: string;
  services: {
    cidrBlocks: string[];
  };
}

export interface IApiEndpoint {
  host: string;
  port: number;
}

export interface IClusterSpec {
  clusterNetwork: IClusterNetwork;
  controlPlaneEndpoint: IApiEndpoint;
  controlPlaneRef?: corev1.IObjectReference;
  infrastructureRef?: corev1.IObjectReference;
}

export interface IStatusCondition {
  lastTransitionTime: string;
  status: string;
  type: string;
  message?: string;
  reason?: string;
  severity?: string;
}

export type FailureDomains = Record<string, IFailureDomainSpec>;

export interface IFailureDomainSpec {
  controlPlane: boolean;
  attributes?: Record<string, string>;
}

export interface ICondition {
  type: string;
  status: 'True' | 'False' | 'Unknown';
  severity?: 'Error' | 'Warning' | 'Info' | '';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface IClusterStatus {
  conditions: IStatusCondition[];
  controlPlaneInitialized: boolean;
  controlPlaneReady: boolean;
  infrastructureReady: boolean;
  observedGeneration: number;
  phase: string;
}

export interface ICluster {
  apiVersion: string;
  kind: string;
  metadata: metav1.IObjectMeta;
  spec: IClusterSpec;
  status: IClusterStatus;
}

export interface IClusterList extends metav1.IList<ICluster> {}
