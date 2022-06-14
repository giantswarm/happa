import {
  ICondition,
  IMachineDeploymentStrategy,
  IMachineDeploymentTemplate,
} from '../../capiv1beta1';
import * as corev1 from '../../corev1';
import * as metav1 from '../../metav1';

export const ApiVersion = 'exp.cluster.x-k8s.io/v1alpha3';

export interface IMachinePoolSpec {
  clusterName: string;
  template: IMachineDeploymentTemplate;
  strategy?: IMachineDeploymentStrategy;
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
  observedGenerationReady?: number;
  conditions?: ICondition[];
}

export const MachinePool = 'MachinePool';

export interface IMachinePool {
  apiVersion: typeof ApiVersion;
  kind: typeof MachinePool;
  metadata: metav1.IObjectMeta;
  spec?: IMachinePoolSpec;
  status?: IMachinePoolStatus;
}

export const MachinePoolList = 'MachinePoolList';

export interface IMachinePoolList extends metav1.IList<IMachinePool> {
  apiVersion: typeof ApiVersion;
  kind: typeof MachinePoolList;
}
