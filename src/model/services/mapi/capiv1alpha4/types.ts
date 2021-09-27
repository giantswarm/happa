import * as corev1 from '../corev1';
import * as metav1 from '../metav1';

export interface ICondition {
  type: string;
  status:
    | typeof corev1.conditionTrue
    | typeof corev1.conditionFalse
    | typeof corev1.conditionUnknown;
  severity?: 'Error' | 'Warning' | 'Info' | '';
  lastTransitionTime?: string;
  reason?: string;
  message?: string;
}

export interface IMachineSpecBootstrap {
  configRef?: corev1.IObjectReference;
  dataSecretName?: string;
}

export interface IMachineSpec {
  clusterName: string;
  bootstrap: IMachineSpecBootstrap;
  infrastructureRef: corev1.IObjectReference;
  version?: string;
  providerID?: string;
  failureDomain?: string;
  nodeDrainTimeout?: number;
}

export interface IMachineTemplateSpec {
  metadata?: metav1.IObjectMeta;
  spec?: IMachineSpec;
}

export interface IMachinePoolSpec {
  clusterName: string;
  template: IMachineTemplateSpec;
  replicas?: number;
  minReadySeconds?: number;
  providerIDList?: string[];
  failureDomains?: string[];
}

export interface IMachinePoolStatus {
  nodeRefs?: corev1.IObjectReference[];
  replicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  unavailableReplicas?: number;
  failureReason?: string;
  failureMessage?: string;
  phase?: string;
  bootstrapReady?: boolean;
  infrastructureReady?: boolean;
  observedGeneration?: number;
  conditions?: ICondition[];
}

export const MachinePool = 'MachinePool';

export interface IMachinePool {
  apiVersion: 'cluster.x-k8s.io/v1alpha4';
  kind: typeof MachinePool;
  metadata: metav1.IObjectMeta;
  spec?: IMachinePoolSpec;
  status?: IMachinePoolStatus;
}

export const MachinePoolList = 'MachinePoolList';

export interface IMachinePoolList extends metav1.IList<IMachinePool> {
  apiVersion: 'cluster.x-k8s.io/v1alpha4';
  kind: typeof MachinePoolList;
}
