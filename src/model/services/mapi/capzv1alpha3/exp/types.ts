import * as capiv1beta1 from '../../capiv1beta1';
import * as capzv1beta1 from '../../capzv1beta1';

export const ApiVersion = 'exp.infrastructure.cluster.x-k8s.io/v1alpha3';

export interface IAzureMachinePoolInstance {
  version?: string;
  provisioningState?: string;
  providerID?: string;
  instanceID?: string;
  instanceName?: string;
  latestModelApplied?: boolean;
}

export interface IAzureMachinePoolFuture {
  type: string;
  resourceGroup?: string;
  name?: string;
  futureData?: string;
}

export interface IAzureMachinePoolStatus {
  ready?: boolean;
  replicas?: number;
  instances?: IAzureMachinePoolInstance[];
  version?: string;
  provisioningState?: string;
  failureReason?: string;
  failureMessage?: string;
  conditions?: capiv1beta1.ICondition[];
  longRunningOperationState?: IAzureMachinePoolFuture;
}

export const AzureMachinePool = 'AzureMachinePool';

export interface IAzureMachinePool
  extends Omit<capzv1beta1.IAzureMachinePool, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}
export const AzureMachinePoolList = 'AzureMachinePoolList';

export interface IAzureMachinePoolList
  extends Omit<capzv1beta1.IAzureMachinePoolList, 'apiVersion' | 'items'> {
  apiVersion: typeof ApiVersion;
  items: IAzureMachinePool[];
}
