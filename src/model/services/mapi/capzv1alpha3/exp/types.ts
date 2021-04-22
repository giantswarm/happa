import * as capiv1alpha3 from '../../capiv1alpha3';
import * as metav1 from '../../metav1';
import { Tags } from '../types';

export interface IAzureMachinePoolTemplateImageSharedGallery {
  subscriptionID: string;
  resourceGroup: string;
  gallery: string;
  name: string;
  version: string;
}

export interface IAzureMachinePoolTemplateImageMarketplace {
  publisher: string;
  offer: string;
  sku: string;
  version: string;
  thirdPatyImage: string;
}

export interface IAzureMachinePoolTemplateImage {
  id?: string;
  sharedGallery?: IAzureMachinePoolTemplateImageSharedGallery;
  marketplace?: IAzureMachinePoolTemplateImageMarketplace;
}

export interface IAzureMachinePoolTemplateOSDiskManagedDiskEncryptionSet {
  id?: string;
}

export interface IAzureMachinePoolTemplateManagedDisk {
  storageAccountType: string;
  diskEncryptionSet?: IAzureMachinePoolTemplateOSDiskManagedDiskEncryptionSet;
}

export interface IAzureMachinePoolTemplateOSDiskDiffDiskSettings {
  option: string;
}

export interface IAzureMachinePoolTemplateOSDisk {
  osType: string;
  diskSizeGB: number;
  managedDisk: IAzureMachinePoolTemplateManagedDisk;
  diffDiskSettings?: IAzureMachinePoolTemplateOSDiskDiffDiskSettings;
  cachingType?: string;
}

export interface IAzureMachinePoolTemplateDataDisk {
  nameSuffix: string;
  diskSizeGB: number;
  managedDisk?: IAzureMachinePoolTemplateManagedDisk;
  lun?: number;
  cachingType?: string;
}

export interface IAzureMachinePoolTemplateSecurityProfile {
  encryptionAtHost?: boolean;
}

export interface IAzureMachinePoolTemplateSpotVMOptions {
  maxPrice?: number | string;
}

export interface IAzureMachinePoolTemplate {
  vmSize: string;
  osDisk: IAzureMachinePoolTemplateOSDisk;
  image?: IAzureMachinePoolTemplateImage;
  dataDisks?: IAzureMachinePoolTemplateDataDisk[];
  sshPublicKey?: string;
  acceleratedNetworking?: boolean;
  terminateNotificationTimeout?: number;
  securityProfile?: IAzureMachinePoolTemplateSecurityProfile;
  spotVMOptions?: IAzureMachinePoolTemplateSpotVMOptions;
}

export interface IAzureMachinePoolSpecUserAssignedIdentity {
  providerID: string;
}

export interface IAzureMachinePoolSpec {
  location: string;
  template: IAzureMachinePoolTemplate;
  additionalTags?: Tags;
  providerID?: string;
  providerIDList?: string[];
  identity?: string;
  roleAssignmentName?: string;
  userAssignedIdentities?: IAzureMachinePoolSpecUserAssignedIdentity[];
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
  conditions?: capiv1alpha3.ICondition[];
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
