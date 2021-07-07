import * as capiv1alpha3 from '../capiv1alpha3';
import * as corev1 from '../corev1';
import * as metav1 from '../metav1';

export type Tags = Record<string, string>;

export interface IVnetSpec {
  name: string;
  resourceGroup?: string;
  id?: string;
  cidrBlocks?: string[];
  tags?: Tags;
}

export interface IIngressRule {
  name: string;
  description: string;
  protocol: 'Udp' | 'Tcp' | '*' | string;
  priority?: number;
  sourcePorts?: string;
  destinationPorts?: string;
  source?: string;
  destionation?: string;
}

export interface ISecurityGroup {
  id?: string;
  name?: string;
  ingressRule?: IIngressRule;
  tags?: Tags;
}

export interface IRouteTable {
  id?: string;
  name?: string;
}

export interface ISubnet {
  name: string;
  role?: 'node' | 'control-plane' | string;
  id?: string;
  cidrBlocks?: string[];
  securityGroup?: ISecurityGroup;
  routeTable?: IRouteTable;
}

export interface IPublicIPSpec {
  name: string;
  dnsName?: string;
}

export interface IFrontendIP {
  name: string;
  privateIP?: string;
  publicIP?: IPublicIPSpec;
}

export interface ILoadBalancerSpec {
  id?: string;
  name?: string;
  sku?: string;
  frontendIPs?: IFrontendIP[];
  type?: 'Internal' | 'Public' | string;
}

export interface INetworkSpec {
  vnet?: IVnetSpec;
  subnets?: ISubnet[];
  apiServerLB?: ILoadBalancerSpec;
}

export interface IAzureClusterSpec {
  location: string;
  networkSpec?: INetworkSpec;
  resourceGroup?: string;
  subscriptionID?: string;
  controlPlaneEndpoint?: capiv1alpha3.IApiEndpoint;
  additionalTags?: Tags;
  identityRef?: corev1.IObjectReference;
}

export interface IAzureClusterStatus {
  failureDomains: capiv1alpha3.FailureDomains;
  ready: boolean;
  conditions: capiv1alpha3.ICondition[];
}

export interface IAzureCluster {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3';
  kind: typeof AzureCluster;
  metadata: metav1.IObjectMeta;
  spec: IAzureClusterSpec;
  status?: capiv1alpha3.IClusterStatus;
}

export interface IAzureClusterList extends metav1.IList<IAzureCluster> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3';
  kind: typeof AzureClusterList;
}

export const AzureCluster = 'AzureCluster';
export const AzureClusterList = 'AzureClusterList';

export interface IImageSharedGallery {
  subscriptionID: string;
  resourceGroup: string;
  gallery: string;
  name: string;
  version: string;
}

export interface IImageMarketplace {
  publisher: string;
  offer: string;
  sku: string;
  version: string;
  thirdPartyImage: boolean;
}

export interface IImage {
  id?: string;
  sharedGallery?: IImageSharedGallery;
  marketplace?: IImageMarketplace;
}

export interface IOSDiskManagedDiskEncryptionSet {
  id?: string;
}

export interface IManagedDisk {
  storageAccountType: string;
  diskEncryptionSet?: IOSDiskManagedDiskEncryptionSet;
}

export interface IOSDiskDiffDiskSettings {
  option: string;
}

export interface IOSDisk {
  osType: string;
  diskSizeGB: number;
  managedDisk: IManagedDisk;
  diffDiskSettings?: IOSDiskDiffDiskSettings;
  cachingType?: string;
}

export interface IDataDisk {
  nameSuffix: string;
  diskSizeGB: number;
  managedDisk?: IManagedDisk;
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

export interface IAzureMachineSpec {
  vmSize: string;
  osDisk: IOSDisk;
  sshPublicKey: string;
  /**
   * @deprecated
   *  */
  location: string;
  providerID?: string;
  failureDomain?: string;
  image?: IImage;
  identity?: string;
  roleAssignmentName?: string;
  dataDisks?: IDataDisk[];
  additionalTags?: Tags;
  allocatePublicIP?: boolean;
  enableIPForwarding?: boolean;
  acceleratedNetworking?: boolean;
  userAssignedIdentities?: IUserAssignedIdentity[];
  spotVMOptions?: ISpotVMOptions;
  securityProfile?: ISecurityProfile;
}

export interface IAzureMachineStatus {
  ready?: boolean;
  addresses?: corev1.INodeAddress[];
  vmState?: string;
  failureReason?: string;
  failureMessage?: string;
  conditions?: capiv1alpha3.ICondition[];
}

export const AzureMachine = 'AzureMachine';

export interface IAzureMachine {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3';
  kind: typeof AzureMachine;
  metadata: metav1.IObjectMeta;
  spec?: IAzureMachineSpec;
  status?: IAzureMachineStatus;
}

export const AzureMachineList = 'AzureMachineList';

export interface IAzureMachineList extends metav1.IList<IAzureMachine> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3';
  kind: typeof AzureMachineList;
}
