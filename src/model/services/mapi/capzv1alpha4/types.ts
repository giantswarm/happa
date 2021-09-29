import * as capiv1alpha4 from '../capiv1alpha4';
import * as metav1 from '../metav1';

export type Tags = Record<string, string>;

export interface IImageSharedGalleryImage {
  subscriptionID: string;
  resourceGroup: string;
  gallery: string;
  name: string;
  version: string;
  publisher?: string;
  offer?: string;
  sku?: string;
}

export interface IImageMarketplaceImage {
  publisher: string;
  offer: string;
  sku: string;
  version: string;
  thirdPartyImage: boolean;
}

export interface IImage {
  id?: string;
  sharedGallery?: IImageSharedGalleryImage;
  marketplace?: IImageMarketplaceImage;
}

export interface IOSDiskManagedDiskEncryptionSetParameters {
  id?: string;
}

export interface IManagedDiskParameters {
  storageAccountType?: string;
  diskEncryptionSet?: IOSDiskManagedDiskEncryptionSetParameters;
}

export interface IOSDiskDiffDiskSettings {
  option: string;
}

export interface IOSDisk {
  osType: string;
  diskSizeGB?: number;
  managedDisk?: IManagedDiskParameters;
  diffDiskSettings?: IOSDiskDiffDiskSettings;
  cachingType?: string;
}

export interface IDataDisk {
  nameSuffix: string;
  diskSizeGB: number;
  managedDisk?: IManagedDiskParameters;
  lun?: number;
  cachingType?: string;
}

export interface IUserAssignedIdentity {
  providerID: string;
}

export interface ISpotVMOptions {
  maxPrice?: metav1.Quantity;
}

export interface ISecurityProfile {
  encryptionAtHost?: boolean;
}

export interface IFuture {
  type: string;
  name: string;
  serviceName: string;
  resourceGroup?: string;
  data?: string;
}

export interface IAzureMachinePoolMachineTemplate {
  vmSize: string;
  osDisk: IOSDisk;
  image?: IImage;
  dataDisks?: IDataDisk[];
  sshPublicKey?: string;
  acceleratedNetworking?: boolean;
  terminateNotificationTimeout?: number;
  securityProfile?: ISecurityProfile;
  spotVMOptions?: ISpotVMOptions;
  subnetName?: string;
}

export interface IAzureMachinePoolDeploymentStrategyRollingUpdate {
  maxUnavailable?: number | string;
  maxSurge?: number | string;
  deletePolicy?: string;
}

export interface IAzureMachinePoolDeploymentStrategy {
  type?: string;
  rollingUpdate?: IAzureMachinePoolDeploymentStrategyRollingUpdate;
}

export interface IAzureMachinePoolSpec {
  location: string;
  template: IAzureMachinePoolMachineTemplate;
  additionalTags?: Tags;
  providerID?: string;
  providerIDList?: string[];
  identity?: string;
  roleAssignmentName?: string;
  userAssignedIdentities?: IUserAssignedIdentity[];
  strategy?: IAzureMachinePoolDeploymentStrategy;
  nodeDrainTimeout?: number;
}

export interface IAzureMachinePoolInstanceStatus {
  version?: string;
  provisioningState?: string;
  providerID?: string;
  instanceID?: string;
  instanceName?: string;
  latestModelApplied?: boolean;
}

export interface IAzureMachinePoolStatus {
  ready?: boolean;
  replicas?: number;
  instances?: IAzureMachinePoolInstanceStatus[];
  image?: IImage;
  version?: string;
  provisioningState?: string;
  failureReason?: string;
  failureMessage?: string;
  conditions?: capiv1alpha4.ICondition[];
  longRunningOperationState?: IFuture;
}

export const AzureMachinePool = 'AzureMachinePool';

export interface IAzureMachinePool {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha4';
  kind: typeof AzureMachinePool;
  metadata: metav1.IObjectMeta;
  spec?: IAzureMachinePoolSpec;
  status?: IAzureMachinePoolStatus;
}

export const AzureMachinePoolList = 'AzureMachinePoolList';

export interface IAzureMachinePoolList extends metav1.IList<IAzureMachinePool> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha4';
  kind: typeof AzureMachinePoolList;
}
