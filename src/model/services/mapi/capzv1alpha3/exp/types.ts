import * as capiv1beta1 from '../../capiv1beta1';
import {
  IDataDisk,
  IImage,
  IOSDisk,
  ISecurityProfile,
  ISpotVMOptions,
  IUserAssignedIdentity,
  Tags,
} from '../../capzv1beta1';
import * as metav1 from '../../metav1';

export interface IAzureMachinePoolTemplate {
  vmSize: string;
  osDisk: IOSDisk;
  image?: IImage;
  dataDisks?: IDataDisk[];
  sshPublicKey?: string;
  acceleratedNetworking?: boolean;
  terminateNotificationTimeout?: number;
  securityProfile?: ISecurityProfile;
  spotVMOptions?: ISpotVMOptions;
}

export interface IAzureMachinePoolSpec {
  location: string;
  template: IAzureMachinePoolTemplate;
  additionalTags?: Tags;
  providerID?: string;
  providerIDList?: string[];
  identity?: string;
  roleAssignmentName?: string;
  userAssignedIdentities?: IUserAssignedIdentity[];
}

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

export interface IAzureMachinePool {
  apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3';
  kind: typeof AzureMachinePool;
  metadata: metav1.IObjectMeta;
  spec?: IAzureMachinePoolSpec;
  status?: IAzureMachinePoolStatus;
}

export const AzureMachinePoolList = 'AzureMachinePoolList';

export interface IAzureMachinePoolList extends metav1.IList<IAzureMachinePool> {
  apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3';
  kind: typeof AzureMachinePoolList;
}
