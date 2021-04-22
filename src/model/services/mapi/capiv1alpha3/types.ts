import * as corev1 from '../corev1';
import * as k8sUrl from '../k8sUrl';
import * as metav1 from '../metav1';

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

export const Cluster = 'Cluster';
export const ClusterList = 'ClusterList';

export interface IMachineDeploymentTemplateSpecBootstrap {
  configRef?: corev1.IObjectReference;
  data?: string;
  dataSecretName?: string;
}

export interface IMachineDeploymentTemplateSpec {
  clusterName: string;
  bootstrap: IMachineDeploymentTemplateSpecBootstrap;
  infrastructureRef: corev1.IObjectReference;
  version?: string;
  providerID?: string;
  failureDomain?: string;
  nodeDrainTimeout?: number;
}

export interface IMachineDeploymentTemplate {
  metadata: metav1.IObjectMeta;
  spec: IMachineDeploymentTemplateSpec;
}

export interface IMachineDeploymentStrategyRollingUpdate {
  maxUnavailable?: number | string;
  maxSurge?: number | string;
}

export interface IMachineDeploymentStrategy {
  type?: string;
  rollingUpdate?: IMachineDeploymentStrategyRollingUpdate;
}

export interface IMachineDeploymentSpec {
  clusterName: string;
  template: IMachineDeploymentTemplate;
  strategy?: IMachineDeploymentStrategy;
  minReadySeconds?: number;
  revisionHistoryLimit?: number;
  paused?: boolean;
  progressDeadlineSeconds?: number;
  replicas?: number;
  selector?: k8sUrl.IK8sLabelSelector;
}

export interface IMachineDeploymentStatus {
  observedGeneration?: number;
  selector?: string;
  replicas?: number;
  updatedReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  unavailableReplicas?: number;
  phase?: string;
}

export const MachineDeployment = 'MachineDeployment';
export interface IMachineDeployment {
  apiVersion: 'cluster.x-k8s.io/v1alpha3';
  kind: typeof MachineDeployment;
  metadata: metav1.IObjectMeta;
  spec?: IMachineDeploymentSpec;
  status?: IMachineDeploymentStatus;
}

export const MachineDeploymentList = 'MachineDeploymentList';

export interface IMachineDeploymentList
  extends metav1.IList<IMachineDeployment> {
  apiVersion: 'cluster.x-k8s.io/v1alpha3';
  kind: typeof MachineDeploymentList;
}
