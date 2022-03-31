import * as capiv1beta1 from '../capiv1beta1';
import * as corev1 from '../corev1';
import * as metav1 from '../metav1';

export const ApiVersion = 'infrastructure.cluster.x-k8s.io/v1beta1';
export type Tags = Record<string, string>;

export interface IPeerings {
  /**
   * RemoteVnetName defines name of the remote virtual network.
   */
  remoteVnetName: string;
  /**
   * ResourceGroup is the resource group name of the remote virtual network.
   */
  resourceGroup?: string;
}
export interface IVnetSpec {
  /**
   * CIDRBlocks defines the virtual network's address space, specified as one or more address prefixes in CIDR notation.
   */
  cidrBlocks?: string[];
  /**
   * ID is the Azure resource ID of the virtual network. READ-ONLY
   */
  id?: string;
  /**
   * Name defines a name for the virtual network resource.
   */
  name: string;
  /**
   * Peerings defines a list of peerings of the newly created virtual network with existing virtual networks.
   */
  peerings?: IPeerings[];
  /**
   * ResourceGroup is the name of the resource group of the existing virtual network or the resource group where a managed virtual network should be created.
   */
  resourceGroup?: string;
  /**
   * Tags is a collection of tags describing the resource.
   */
  tags?: Record<string, string>;
}

export interface ISecurityRule {
  /**
   * A description for this rule. Restricted to 140 chars.
   */
  description: string;
  /**
   * Destination is the destination address prefix. CIDR or destination IP range. Asterix '\*' can also be used to match all source IPs. Default tags such as 'VirtualNetwork', 'AzureLoadBalancer' and 'Internet' can also be used.
   */
  destination?: string;
  /**
   * DestinationPorts specifies the destination port or range. Integer or range between 0 and 65535. Asterix '\*' can also be used to match all ports.
   */
  destinationPorts?: string;
  /**
   * Direction indicates whether the rule applies to inbound, or outbound traffic. "Inbound" or "Outbound".
   */
  direction: 'Inbound' | 'Outbound';
  /**
   * Name is a unique name within the network security group.
   */
  name: string;
  /**
   * Priority is a number between 100 and 4096. Each rule should have a unique value for priority. Rules are processed in priority order, with lower numbers processed before higher numbers. Once traffic matches a rule, processing stops.
   */
  priority?: number;
  /**
   * Protocol specifies the protocol type. "Tcp", "Udp", "Icmp", or "\*".
   */
  protocol: 'Tcp' | 'Udp' | 'Icmp' | '*';
  /**
   * Source specifies the CIDR or source IP range. Asterix '\*' can also be used to match all source IPs. Default tags such as 'VirtualNetwork', 'AzureLoadBalancer' and 'Internet' can also be used. If this is an ingress rule, specifies where network traffic originates from.
   */
  source?: string;
  /**
   * SourcePorts specifies source port or range. Integer or range between 0 and 65535. Asterix '\*' can also be used to match all ports.
   */
  sourcePorts?: string;
}

export interface ISecurityGroup {
  /**
   * ID is the Azure resource ID of the security group. READ-ONLY
   */
  id?: string;
  name?: string;
  /**
   * SecurityRules is a slice of Azure security rules for security groups.
   */
  securityRules?: ISecurityRule[];
  /**
   * Tags defines a map of tags.
   */
  tags?: Tags;
}

export interface IRouteTable {
  /**
   * ID is the Azure resource ID of the route table. READ-ONLY
   */
  id?: string;
  name?: string;
}

export interface ISubnet {
  /**
   * CIDRBlocks defines the subnet's address space, specified as one or more address prefixes in CIDR notation.
   */
  cidrBlocks?: string[];
  /**
   * ID is the Azure resource ID of the subnet. READ-ONLY
   */
  id?: string;
  /**
   * Name defines a name for the subnet resource.
   */
  name: string;
  /**
   * Role defines the subnet role (eg. Node, ControlPlane)
   */
  /**
   * NatGateway associated with this subnet.
   */
  natGateway?: {
    /**
     * ID is the Azure resource ID of the nat gateway. READ-ONLY
     */
    id?: string;
    /**
     * PublicIPSpec defines the inputs to create an Azure public IP address.
     */
    ip?: IPublicIPSpec;
    name: string;
  };
  role: string;
  /**
   * RouteTable defines the route table that should be attached to this subnet.
   */
  routeTable?: IRouteTable;
  /**
   * SecurityGroup defines the NSG (network security group) that should be attached to this subnet.
   */
  securityGroup?: ISecurityGroup;
}

export interface IPublicIPSpec {
  name: string;
  dnsName?: string;
}

export interface IFrontendIP {
  name: string;
  privateIP?: string;
  /**
   * PublicIPSpec defines the inputs to create an Azure public IP address.
   */
  publicIP?: IPublicIPSpec;
}

export interface ILoadBalancerSpec {
  frontendIPs?: IFrontendIP[];
  /**
   * FrontendIPsCount specifies the number of frontend IP addresses for the load balancer.
   */
  frontendIPsCount?: number;
  /**
   * ID is the Azure resource ID of the load balancer. READ-ONLY
   */
  id?: string;
  /**
   * IdleTimeoutInMinutes specifies the timeout for the TCP idle connection.
   */
  idleTimeoutInMinutes?: number;
  name?: string;
  /**
   * SKU defines an Azure load balancer SKU.
   */
  sku?: string;
  /**
   * LBType defines an Azure load balancer Type.
   */
  type?: string;
}

export interface INetworkSpec {
  /**
   * APIServerLB is the configuration for the control-plane load balancer.
   */
  apiServerLB?: ILoadBalancerSpec;
  /**
   * ControlPlaneOutboundLB is the configuration for the control-plane outbound load balancer. This is different from APIServerLB, and is used only in private clusters (optionally) for enabling outbound traffic.
   */
  controlPlaneOutboundLB?: {
    frontendIPs?: IFrontendIP[];
    /**
     * FrontendIPsCount specifies the number of frontend IP addresses for the load balancer.
     */
    frontendIPsCount?: number;
    /**
     * ID is the Azure resource ID of the load balancer. READ-ONLY
     */
    id?: string;
    /**
     * IdleTimeoutInMinutes specifies the timeout for the TCP idle connection.
     */
    idleTimeoutInMinutes?: number;
    name?: string;
    /**
     * SKU defines an Azure load balancer SKU.
     */
    sku?: string;
    /**
     * LBType defines an Azure load balancer Type.
     */
    type?: string;
  };
  /**
   * NodeOutboundLB is the configuration for the node outbound load balancer.
   */
  nodeOutboundLB?: {
    frontendIPs?: IFrontendIP[];
    /**
     * FrontendIPsCount specifies the number of frontend IP addresses for the load balancer.
     */
    frontendIPsCount?: number;
    /**
     * ID is the Azure resource ID of the load balancer. READ-ONLY
     */
    id?: string;
    /**
     * IdleTimeoutInMinutes specifies the timeout for the TCP idle connection.
     */
    idleTimeoutInMinutes?: number;
    name?: string;
    /**
     * SKU defines an Azure load balancer SKU.
     */
    sku?: string;
    /**
     * LBType defines an Azure load balancer Type.
     */
    type?: string;
  };
  /**
   * PrivateDNSZoneName defines the zone name for the Azure Private DNS.
   */
  privateDNSZoneName?: string;
  /**
   * Subnets is the configuration for the control-plane subnet and the node subnet.
   */
  subnets?: ISubnet[];
  /**
   * Vnet is the configuration for the Azure virtual network.
   */
  vnet?: IVnetSpec;
}

export interface IBastionSpec {
  /**
   * AzureBastion specifies how the Azure Bastion cloud component should be configured.
   */
  azureBastion?: {
    name?: string;
    /**
     * PublicIPSpec defines the inputs to create an Azure public IP address.
     */
    publicIP?: IPublicIPSpec;
    /**
     * SubnetSpec configures an Azure subnet.
     */
    subnet?: ISubnet;
  };
}

export interface IRateLimits {
  /**
   * RateLimitConfig indicates the rate limit config options.
   */
  config?: {
    cloudProviderRateLimit?: boolean;
    cloudProviderRateLimitBucket?: number;
    cloudProviderRateLimitBucketWrite?: number;
    cloudProviderRateLimitQPS?: number;
    cloudProviderRateLimitQPSWrite?: number;
  };
  /**
   * Name is the name of the rate limit spec.
   */
  name:
    | 'defaultRateLimit'
    | 'routeRateLimit'
    | 'subnetsRateLimit'
    | 'interfaceRateLimit'
    | 'routeTableRateLimit'
    | 'loadBalancerRateLimit'
    | 'publicIPAddressRateLimit'
    | 'securityGroupRateLimit'
    | 'virtualMachineRateLimit'
    | 'storageAccountRateLimit'
    | 'diskRateLimit'
    | 'snapshotRateLimit'
    | 'virtualMachineScaleSetRateLimit'
    | 'virtualMachineSizesRateLimit'
    | 'availabilitySetRateLimit';
}

/**
 * IAzureClusterSpec defines the desired state of AzureCluster.
 */
export interface IAzureClusterSpec {
  /**
   * AdditionalTags is an optional set of tags to add to Azure resources managed by the Azure provider, in addition to the ones added by default.
   */
  additionalTags?: Tags;
  /**
   * AzureEnvironment is the name of the AzureCloud to be used. The default value that would be used by most users is "AzurePublicCloud", other values are: - ChinaCloud: "AzureChinaCloud" - GermanCloud: "AzureGermanCloud" - PublicCloud: "AzurePublicCloud" - USGovernmentCloud: "AzureUSGovernmentCloud"
   */
  azureEnvironment?: string;
  /**
   * BastionSpec encapsulates all things related to the Bastions in the cluster.
   */
  bastionSpec?: IBastionSpec;
  /**
   * CloudProviderConfigOverrides is an optional set of configuration values that can be overridden in azure cloud provider config. This is only a subset of options that are available in azure cloud provider config. Some values for the cloud provider config are inferred from other parts of cluster api provider azure spec, and may not be available for overrides. See: https://kubernetes-sigs.github.io/cloud-provider-azure/install/configs Note: All cloud provider config values can be customized by creating the secret beforehand. CloudProviderConfigOverrides is only used when the secret is managed by the Azure Provider.
   */
  cloudProviderConfigOverrides?: {
    /**
     * BackOffConfig indicates the back-off config options.
     */
    backOffs?: {
      cloudProviderBackoff?: boolean;
      cloudProviderBackoffDuration?: number;
      cloudProviderBackoffExponent?: number;
      cloudProviderBackoffJitter?: number;
      cloudProviderBackoffRetries?: number;
    };
    rateLimits?: IRateLimits[];
  };
  /**
   * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
   */
  controlPlaneEndpoint?: capiv1beta1.IApiEndpoint;
  /**
   * IdentityRef is a reference to an AzureIdentity to be used when reconciling this cluster
   */
  identityRef?: corev1.IObjectReference;
  location: string;
  /**
   * NetworkSpec encapsulates all things related to Azure network.
   */
  networkSpec?: INetworkSpec;
  resourceGroup?: string;
  subscriptionID?: string;
}

export interface ILongRunningOperationStates {
  /**
   * Data is the base64 url encoded json Azure AutoRest Future.
   */
  data: string;
  /**
   * Name is the name of the Azure resource. Together with the service name, this forms the unique identifier for the future.
   */
  name: string;
  /**
   * ResourceGroup is the Azure resource group for the resource.
   */
  resourceGroup?: string;
  /**
   * ServiceName is the name of the Azure service. Together with the name of the resource, this forms the unique identifier for the future.
   */
  serviceName: string;
  /**
   * Type describes the type of future, such as update, create, delete, etc.
   */
  type: string;
}

export interface IAzureClusterStatus {
  conditions: capiv1beta1.ICondition[];
  failureDomains: capiv1beta1.FailureDomains;
  /**
   * LongRunningOperationStates saves the states for Azure long-running operations so they can be continued on the next reconciliation loop.
   */
  longRunningOperationStates?: ILongRunningOperationStates[];
  /**
   * Ready is true when the provider resource is ready.
   */
  ready: boolean;
}

/**
 * IAzureCluster is the Schema for the azureclusters API.
 */
export interface IAzureCluster {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureCluster;
  metadata: metav1.IObjectMeta;
  spec: IAzureClusterSpec;
  /**
   * AzureClusterStatus defines the observed state of AzureCluster.
   */
  status?: capiv1beta1.IClusterStatus;
}

export interface IAzureClusterList extends metav1.IList<IAzureCluster> {
  apiVersion: typeof ApiVersion;
  kind: typeof AzureClusterList;
}

export const AzureCluster = 'AzureCluster';
export const AzureClusterList = 'AzureClusterList';

export interface IImageSharedGallery {
  /**
   * Gallery specifies the name of the shared image gallery that contains the image
   */
  gallery: string;
  /**
   * Name is the name of the image
   */
  name: string;
  /**
   * Offer specifies the name of a group of related images created by the publisher. For example, UbuntuServer, WindowsServer This value will be used to add a `Plan` in the API request when creating the VM/VMSS resource. This is needed when the source image from which this SIG image was built requires the `Plan` to be used.
   */
  offer?: string;
  /**
   * Publisher is the name of the organization that created the image. This value will be used to add a `Plan` in the API request when creating the VM/VMSS resource. This is needed when the source image from which this SIG image was built requires the `Plan` to be used.
   */
  publisher?: string;
  /**
   * ResourceGroup specifies the resource group containing the shared image gallery
   */
  resourceGroup: string;
  /**
   * SKU specifies an instance of an offer, such as a major release of a distribution. For example, 18.04-LTS, 2019-Datacenter This value will be used to add a `Plan` in the API request when creating the VM/VMSS resource. This is needed when the source image from which this SIG image was built requires the `Plan` to be used.
   */
  sku?: string;
  /**
   * SubscriptionID is the identifier of the subscription that contains the shared image gallery
   */
  subscriptionID: string;
  /**
   * Version specifies the version of the marketplace image. The allowed formats are Major.Minor.Build or 'latest'. Major, Minor, and Build are decimal numbers. Specify 'latest' to use the latest version of an image available at deploy time. Even if you use 'latest', the VM image will not automatically update after deploy time even if a new version becomes available.
   */
  version: string;
}

export interface IImageMarketplace {
  /**
   * Offer specifies the name of a group of related images created by the publisher. For example, UbuntuServer, WindowsServer
   */
  offer: string;
  /**
   * Publisher is the name of the organization that created the image
   */
  publisher: string;
  /**
   * SKU specifies an instance of an offer, such as a major release of a distribution. For example, 18.04-LTS, 2019-Datacenter
   */
  sku: string;
  /**
   * ThirdPartyImage indicates the image is published by a third party publisher and a Plan will be generated for it.
   */
  thirdPartyImage?: boolean;
  /**
   * Version specifies the version of an image sku. The allowed formats are Major.Minor.Build or 'latest'. Major, Minor, and Build are decimal numbers. Specify 'latest' to use the latest version of an image available at deploy time. Even if you use 'latest', the VM image will not automatically update after deploy time even if a new version becomes available.
   */
  version: string;
}

export interface IImage {
  /**
   * ID specifies an image to use by ID
   */
  id?: string;
  /**
   * Marketplace specifies an image to use from the Azure Marketplace
   */
  marketplace?: IImageMarketplace;
  /**
   * SharedGallery specifies an image to use from an Azure Shared Image Gallery
   */
  sharedGallery?: IImageSharedGallery;
}

export interface IOSDiskManagedDiskEncryptionSet {
  /**
   * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
   */
  id?: string;
}

export interface IManagedDisk {
  /**
   * DiskEncryptionSetParameters defines disk encryption options.
   */
  diskEncryptionSet?: IOSDiskManagedDiskEncryptionSet;
  storageAccountType?: string;
}

export interface IOSDiskDiffDiskSettings {
  /**
   * Option enables ephemeral OS when set to "Local" See https://docs.microsoft.com/en-us/azure/virtual-machines/ephemeral-os-disks for full details
   */
  option: 'Local';
}

export interface IOSDisk {
  /**
   * CachingType specifies the caching requirements.
   */
  cachingType?: 'None' | 'ReadOnly' | 'ReadWrite';
  /**
   * DiffDiskSettings describe ephemeral disk settings for the os disk.
   */
  diffDiskSettings?: IOSDiskDiffDiskSettings;
  /**
   * DiskSizeGB is the size in GB to assign to the OS disk. Will have a default of 30GB if not provided
   */
  diskSizeGB?: number;
  /**
   * ManagedDisk specifies the Managed Disk parameters for the OS disk.
   */
  managedDisk: IManagedDisk;
  osType: string;
}

export interface IDataDisk {
  /**
   * CachingType specifies the caching requirements.
   */
  cachingType?: 'None' | 'ReadOnly' | 'ReadWrite';
  /**
   * DiskSizeGB is the size in GB to assign to the data disk.
   */
  diskSizeGB: number;
  /**
   * Lun Specifies the logical unit number of the data disk. This value is used to identify data disks within the VM and therefore must be unique for each data disk attached to a VM. The value must be between 0 and 63.
   */
  lun?: number;
  /**
   * ManagedDisk specifies the Managed Disk parameters for the data disk.
   */
  managedDisk?: IManagedDisk;
  /**
   * NameSuffix is the suffix to be appended to the machine name to generate the disk name. Each disk name will be in format <machineName>_<nameSuffix>.
   */
  nameSuffix: string;
}

export interface IUserAssignedIdentity {
  /**
   * ProviderID is the identification ID of the user-assigned Identity, the format of an identity is: 'azure:///subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}'
   */
  providerID: string;
}

export interface ISpotVMOptions {
  /**
   * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
   */
  maxPrice?: metav1.Quantity;
}

export interface ISecurityProfile {
  /**
   * This field indicates whether Host Encryption should be enabled or disabled for a virtual machine or virtual machine scale set. Default is disabled.
   */
  encryptionAtHost?: boolean;
}

/**
 * IAzureMachineSpec defines the desired state of AzureMachine.
 */
export interface IAzureMachineSpec {
  /**
   * AcceleratedNetworking enables or disables Azure accelerated networking. If omitted, it will be set based on whether the requested VMSize supports accelerated networking. If AcceleratedNetworking is set to true with a VMSize that does not support it, Azure will return an error.
   */
  acceleratedNetworking?: boolean;
  /**
   * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the Azure provider. If both the AzureCluster and the AzureMachine specify the same tag name with different values, the AzureMachine's value takes precedence.
   */
  additionalTags?: Tags;
  /**
   * AllocatePublicIP allows the ability to create dynamic public ips for machines where this value is true.
   */
  allocatePublicIP?: boolean;
  /**
   * DataDisk specifies the parameters that are used to add one or more data disks to the machine
   */
  dataDisks?: IDataDisk[];
  /**
   * EnableIPForwarding enables IP Forwarding in Azure which is required for some CNI's to send traffic from a pods on one machine to another. This is required for IpV6 with Calico in combination with User Defined Routes (set by the Azure Cloud Controller manager). Default is false for disabled.
   */
  enableIPForwarding?: boolean;
  /**
   * FailureDomain is the failure domain unique identifier this Machine should be attached to, as defined in Cluster API. This relates to an Azure Availability Zone
   */
  failureDomain?: string;
  /**
   * Identity is the type of identity used for the virtual machine. The type 'SystemAssigned' is an implicitly created identity. The generated identity will be assigned a Subscription contributor role. The type 'UserAssigned' is a standalone Azure resource provided by the user and assigned to the VM
   */
  identity?: 'None' | 'SystemAssigned' | 'UserAssigned';
  /**
   * Image is used to provide details of an image to use during VM creation. If image details are omitted the image will default the Azure Marketplace "capi" offer, which is based on Ubuntu.
   */
  image?: IImage;
  /**
   * OSDisk specifies the parameters for the operating system disk of the machine
   */
  osDisk: IOSDisk;
  /**
   * ProviderID is the unique identifier as specified by the cloud provider.
   */
  providerID?: string;
  /**
   * RoleAssignmentName is the name of the role assignment to create for a system assigned identity. It can be any valid GUID. If not specified, a random GUID will be generated.
   */
  roleAssignmentName?: string;
  /**
   * SecurityProfile specifies the Security profile settings for a virtual machine.
   */
  securityProfile?: ISecurityProfile;
  /**
   * SpotVMOptions allows the ability to specify the Machine should use a Spot VM
   */
  spotVMOptions?: ISpotVMOptions;
  sshPublicKey: string;
  /**
   * SubnetName selects the Subnet where the VM will be placed
   */
  subnetName?: string;
  /**
   * UserAssignedIdentities is a list of standalone Azure identities provided by the user The lifecycle of a user-assigned identity is managed separately from the lifecycle of the AzureMachine. See https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/how-to-manage-ua-identity-cli
   */
  userAssignedIdentities?: IUserAssignedIdentity[];
  vmSize: string;
}

/**
 * AzureMachineStatus defines the observed state of AzureMachine.
 */
export interface IAzureMachineStatus {
  /**
   * Addresses contains the Azure instance associated addresses.
   */
  addresses?: corev1.INodeAddress[];
  /**
   * Conditions defines current service state of the AzureMachine.
   */
  conditions?: capiv1beta1.ICondition[];
  /**
   * ErrorMessage will be set in the event that there is a terminal problem reconciling the Machine and will contain a more verbose string suitable for logging and human consumption.
   *  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the Machine's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured.
   *  Any transient errors that occur during the reconciliation of Machines can be added as events to the Machine object and/or logged in the controller's output.
   */
  failureMessage?: string;
  /**
   * ErrorReason will be set in the event that there is a terminal problem reconciling the Machine and will contain a succinct value suitable for machine interpretation.
   *  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the Machine's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured.
   *  Any transient errors that occur during the reconciliation of Machines can be added as events to the Machine object and/or logged in the controller's output.
   */
  failureReason?: string;
  /**
   * LongRunningOperationStates saves the states for Azure long-running operations so they can be continued on the next reconciliation loop.
   */
  longRunningOperationStates: ILongRunningOperationStates;
  /**
   * Ready is true when the provider resource is ready.
   */
  ready?: boolean;
  /**
   * VMState is the provisioning state of the Azure virtual machine.
   */
  vmState?: string;
}

export const AzureMachine = 'AzureMachine';

/**
 * IAzureMachine is the Schema for the azuremachines API.
 */
export interface IAzureMachine {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureMachine;
  metadata: metav1.IObjectMeta;
  spec?: IAzureMachineSpec;
  status?: IAzureMachineStatus;
}

export const AzureMachineList = 'AzureMachineList';

export interface IAzureMachineList extends metav1.IList<IAzureMachine> {
  apiVersion: typeof ApiVersion;
  kind: typeof AzureMachineList;
}

export interface IFuture {
  /**
   * Data is the base64 url encoded json Azure AutoRest Future.
   */
  data: string;
  /**
   * Name is the name of the Azure resource. Together with the service name, this forms the unique identifier for the future.
   */
  name: string;
  /**
   * ResourceGroup is the Azure resource group for the resource.
   */
  resourceGroup?: string;
  /**
   * ServiceName is the name of the Azure service. Together with the name of the resource, this forms the unique identifier for the future.
   */
  serviceName: string;
  /**
   * Type describes the type of future, such as update, create, delete, etc.
   */
  type: string;
}

export interface IAzureMachinePoolMachineTemplate {
  /**
   * AcceleratedNetworking enables or disables Azure accelerated networking. If omitted, it will be set based on whether the requested VMSize supports accelerated networking. If AcceleratedNetworking is set to true with a VMSize that does not support it, Azure will return an error.
   */
  acceleratedNetworking?: boolean;
  /**
   * DataDisks specifies the list of data disks to be created for a Virtual Machine
   */
  dataDisks?: IDataDisk[];
  /**
   * Image is used to provide details of an image to use during VM creation. If image details are omitted the image will default the Azure Marketplace "capi" offer, which is based on Ubuntu.
   */
  image?: IImage;
  /**
   * OSDisk contains the operating system disk information for a Virtual Machine
   */
  osDisk: IOSDisk;
  /**
   * SecurityProfile specifies the Security profile settings for a virtual machine.
   */
  securityProfile?: ISecurityProfile;
  /**
   * SpotVMOptions allows the ability to specify the Machine should use a Spot VM
   */
  spotVMOptions?: ISpotVMOptions;
  /**
   * SSHPublicKey is the SSH public key string base64 encoded to add to a Virtual Machine
   */
  sshPublicKey?: string;
  /**
   * SubnetName selects the Subnet where the VMSS will be placed
   */
  subnetName?: string;
  /**
   * TerminateNotificationTimeout enables or disables VMSS scheduled events termination notification with specified timeout allowed values are between 5 and 15 (mins)
   */
  terminateNotificationTimeout?: number;
  /**
   * VMSize is the size of the Virtual Machine to build. See https://docs.microsoft.com/en-us/rest/api/compute/virtualmachines/createorupdate#virtualmachinesizetypes
   */
  vmSize: string;
}

export interface IAzureMachinePoolDeploymentStrategyRollingUpdate {
  /**
   * DeletePolicy defines the policy used by the MachineDeployment to identify nodes to delete when downscaling. Valid values are "Random, "Newest", "Oldest" When no value is supplied, the default is Oldest
   */
  deletePolicy?: 'Random' | 'Newest' | 'Oldest';
  /**
   * The maximum number of machines that can be scheduled above the desired number of machines. Value can be an absolute number (ex: 5) or a percentage of desired machines (ex: 10%). This can not be 0 if MaxUnavailable is 0. Absolute number is calculated from percentage by rounding up. Defaults to 1. Example: when this is set to 30%, the new MachineSet can be scaled up immediately when the rolling update starts, such that the total number of old and new machines do not exceed 130% of desired machines. Once old machines have been killed, new MachineSet can be scaled up further, ensuring that total number of machines running at any time during the update is at most 130% of desired machines.
   */
  maxSurge?: number | string;
  /**
   * The maximum number of machines that can be unavailable during the update. Value can be an absolute number (ex: 5) or a percentage of desired machines (ex: 10%). Absolute number is calculated from percentage by rounding down. This can not be 0 if MaxSurge is 0. Defaults to 0. Example: when this is set to 30%, the old MachineSet can be scaled down to 70% of desired machines immediately when the rolling update starts. Once new machines are ready, old MachineSet can be scaled down further, followed by scaling up the new MachineSet, ensuring that the total number of machines available at all times during the update is at least 70% of desired machines.
   */
  maxUnavailable?: number | string;
}

export interface IAzureMachinePoolDeploymentStrategy {
  /**
   * Rolling update config params. Present only if MachineDeploymentStrategyType = RollingUpdate.
   */
  rollingUpdate?: IAzureMachinePoolDeploymentStrategyRollingUpdate;
  /**
   * Type of deployment. Currently the only supported strategy is RollingUpdate
   */
  type?: 'RollingUpdate';
}

/**
 * IAzureMachinePoolSpec defines the desired state of AzureMachinePool.
 */
export interface IAzureMachinePoolSpec {
  /**
   * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the Azure provider. If both the AzureCluster and the AzureMachine specify the same tag name with different values, the AzureMachine's value takes precedence.
   */
  additionalTags?: Tags;
  /**
   * Identity is the type of identity used for the Virtual Machine Scale Set. The type 'SystemAssigned' is an implicitly created identity. The generated identity will be assigned a Subscription contributor role. The type 'UserAssigned' is a standalone Azure resource provided by the user and assigned to the VM
   */
  identity?: 'None' | 'SystemAssigned' | 'UserAssigned';
  /**
   * Location is the Azure region location e.g. westus2
   */
  location: string;
  /**
   * NodeDrainTimeout is the total amount of time that the controller will spend on draining a node. The default value is 0, meaning that the node can be drained without any time limitations. NOTE: NodeDrainTimeout is different from `kubectl drain --timeout`
   */
  nodeDrainTimeout?: string;
  /**
   * ProviderID is the identification ID of the Virtual Machine Scale Set
   */
  providerID?: string;
  /**
   * ProviderIDList are the identification IDs of machine instances provided by the provider. This field must match the provider IDs as seen on the node objects corresponding to a machine pool's machine instances.
   */
  providerIDList?: string[];
  /**
   * RoleAssignmentName is the name of the role assignment to create for a system assigned identity. It can be any valid GUID. If not specified, a random GUID will be generated.
   */
  roleAssignmentName?: string;
  /**
   * The deployment strategy to use to replace existing AzureMachinePoolMachines with new ones.
   */
  strategy?: IAzureMachinePoolDeploymentStrategy;
  /**
   * Template contains the details used to build a replica virtual machine within the Machine Pool
   */
  template: IAzureMachinePoolMachineTemplate;
  /**
   * UserAssignedIdentities is a list of standalone Azure identities provided by the user The lifecycle of a user-assigned identity is managed separately from the lifecycle of the AzureMachinePool. See https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/how-to-manage-ua-identity-cli
   */
  userAssignedIdentities?: IUserAssignedIdentity[];
}

export interface IAzureMachinePoolInstanceStatus {
  /**
   * InstanceID is the identification of the Machine Instance within the VMSS
   */
  instanceID?: string;
  /**
   * InstanceName is the name of the Machine Instance within the VMSS
   */
  instanceName?: string;
  /**
   * LatestModelApplied indicates the instance is running the most up-to-date VMSS model. A VMSS model describes the image version the VM is running. If the instance is not running the latest model, it means the instance may not be running the version of Kubernetes the Machine Pool has specified and needs to be updated.
   */
  latestModelApplied: boolean;
  /**
   * ProviderID is the provider identification of the VMSS Instance
   */
  providerID?: string;
  /**
   * ProvisioningState is the provisioning state of the Azure virtual machine instance.
   */
  provisioningState?: string;
  /**
   * Version defines the Kubernetes version for the VM Instance
   */
  version?: string;
}

/**
 * IAzureMachinePoolStatus defines the observed state of AzureMachinePool.
 */
export interface IAzureMachinePoolStatus {
  /**
   * Conditions defines current service state of the AzureMachinePool.
   */
  conditions?: capiv1beta1.ICondition[];
  /**
   * FailureMessage will be set in the event that there is a terminal problem reconciling the MachinePool and will contain a more verbose string suitable for logging and human consumption.
   *  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the MachinePool's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured.
   *  Any transient errors that occur during the reconciliation of MachinePools can be added as events to the MachinePool object and/or logged in the controller's output.
   */
  failureMessage?: string;
  /**
   * FailureReason will be set in the event that there is a terminal problem reconciling the MachinePool and will contain a succinct value suitable for machine interpretation.
   *  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the MachinePool's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured.
   *  Any transient errors that occur during the reconciliation of MachinePools can be added as events to the MachinePool object and/or logged in the controller's output.
   */
  failureReason?: string;
  /**
   * Image is the current image used in the AzureMachinePool. When the spec image is nil, this image is populated with the details of the defaulted Azure Marketplace "capi" offer.
   */
  image?: IImage;
  /**
   * Instances is the VM instance status for each VM in the VMSS
   */
  instances?: IAzureMachinePoolInstanceStatus[];
  /**
   * LongRunningOperationStates saves the state for Azure long-running operations so they can be continued on the next reconciliation loop.
   */
  longRunningOperationState?: IFuture;
  /**
   * ProvisioningState is the provisioning state of the Azure virtual machine.
   */
  provisioningState?: string;
  /**
   * Ready is true when the provider resource is ready.
   */
  ready?: boolean;
  /**
   * Replicas is the most recently observed number of replicas.
   */
  replicas?: number;
  /**
   * Version is the Kubernetes version for the current VMSS model
   */
  version?: string;
}

export const AzureMachinePool = 'AzureMachinePool';

export interface IAzureMachinePool {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureMachinePool;
  metadata: metav1.IObjectMeta;
  spec?: IAzureMachinePoolSpec;
  status?: IAzureMachinePoolStatus;
}

export const AzureMachinePoolList = 'AzureMachinePoolList';

export interface IAzureMachinePoolList extends metav1.IList<IAzureMachinePool> {
  apiVersion: typeof ApiVersion;
  kind: typeof AzureMachinePoolList;
}
