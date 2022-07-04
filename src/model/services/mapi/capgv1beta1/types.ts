import * as capiv1beta1 from '../capiv1beta1';
import * as metav1 from '../metav1';

export const ApiVersion = 'infrastructure.cluster.x-k8s.io/v1beta1';

export type Labels = Record<string, string>;

/**
 * Subnets configuration.
 */
export interface ISubnetSpec {
  /**
   * CidrBlock is the range of internal addresses that are owned by this subnetwork. Provide this property when you create the subnetwork. For example, 10.0.0.0/8 or 192.168.0.0/16. Ranges must be unique and non-overlapping within a network. Only IPv4 is supported. This field can be set only at resource creation time.
   */
  cidrBlock?: string;
  /**
   * Description is an optional description associated with the resource.
   */
  description?: string;
  /**
   * Name defines a unique identifier to reference this resource.
   */
  name?: string;
  /**
   * PrivateGoogleAccess defines whether VMs in this subnet can access Google services without assigning external IP addresses
   */
  privateGoogleAccess?: boolean;
  /**
   * Region is the name of the region where the Subnetwork resides.
   */
  region?: string;
  /**
   * EnableFlowLogs: Whether to enable flow logging for this subnetwork. If this field is not explicitly set, it will not appear in get listings. If not set the default behavior is to disable flow logging.
   */
  routeTableId?: boolean;
  /**
   * SecondaryCidrBlocks defines secondary CIDR ranges, from which secondary IP ranges of a VM may be allocated
   */
  secondaryCidrBlocks?: Record<string, string>;
}

/**
 * NetworkSpec encapsulates all things related to GCP network.
 */
export interface INetworkSpec {
  /**
   * AutoCreateSubnetworks: When set to true, the VPC network is created in "auto" mode. When set to false, the VPC network is created in "custom" mode.
   *  An auto mode VPC network starts with one subnet per region. Each subnet has a predetermined range as described in Auto mode VPC network IP ranges.
   *  Defaults to true.
   */
  autoCreateSubnetworks?: boolean;
  /**
   * Allow for configuration of load balancer backend (useful for changing apiserver port)
   */
  loadBalancerBackendPort?: number;
  /**
   * Name is the name of the network to be used.
   */
  name?: string;
  subnets?: ISubnetSpec[];
}

export interface IGCPClusterSpec {
  /**
   * AdditionalLabels is an optional set of tags to add to GCP resources managed by the GCP provider, in addition to the ones added by default.
   */
  additionalLabels?: Labels;
  /**
   * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
   */
  controlPlaneEndpoint?: capiv1beta1.IApiEndpoint;
  /**
   * FailureDomains is an optional field which is used to assign selected availability zones to a cluster FailureDomains if empty, defaults to all the zones in the selected region and if specified would override the default zones.
   */
  failureDomains?: string[];
  network?: INetworkSpec;
  /**
   * Project is the name of the project to deploy the cluster to.
   */
  project: string;
  /**
   * The GCP Region the cluster lives in.
   */
  region: string;
}

export interface INetwork {
  /**
   * APIServerBackendService is the full reference to the backend service created for the API Server.
   */
  apiServerBackendService?: string;
  /**
   * APIServerForwardingRule is the full reference to the forwarding rule created for the API Server.
   */
  apiServerForwardingRule?: string;
  /**
   * APIServerHealthCheck is the full reference to the health check created for the API Server.
   */
  apiServerHealthCheck?: string;
  /**
   * APIServerInstanceGroups is a map from zone to the full reference to the instance groups created for the control plane nodes created in the same zone.
   */
  apiServerInstanceGroups?: Record<string, string>;
  /**
   * APIServerAddress is the IPV4 global address assigned to the load balancer created for the API Server.
   */
  apiServerIpAddress?: string;
  /**
   * APIServerTargetProxy is the full reference to the target proxy created for the API Server.
   */
  apiServerTargetProxy?: string;
  /**
   * FirewallRules is a map from the name of the rule to its full reference.
   */
  firewallRules?: Record<string, string>;
  /**
   * Router is the full reference to the router created within the network it'll contain the cloud nat gateway
   */
  router?: string;
  /**
   * SelfLink is the link to the Network used for this cluster.
   */
  selfLink?: string;
}

/**
 * GCPClusterStatus defines the observed state of GCPCluster.
 */
export interface IGCPClusterStatus {
  /**
   * FailureDomains is a slice of FailureDomains.
   */
  failureDomains?: capiv1beta1.FailureDomains;
  /**
   * Network encapsulates GCP networking resources.
   */
  network?: INetwork;
  /**
   * Bastion Instance `json:"bastion,omitempty"`
   */
  ready: boolean;
}

export const GCPCluster = 'GCPCluster';

export interface IGCPCluster {
  apiVersion: typeof ApiVersion;
  kind: typeof GCPCluster;
  metadata?: metav1.IObjectMeta;
  spec?: IGCPClusterSpec;
  status?: IGCPClusterStatus;
}

export interface IMetadataItem {
  key: string;
  value?: string;
}

export interface IAttachedDiskSpec {
  /**
   * DeviceType is a device type of the attached disk. Supported types of non-root attached volumes: 1. "pd-standard" - Standard (HDD) persistent disk 2. "pd-ssd" - SSD persistent disk 3. "local-ssd" - Local SSD disk (https://cloud.google.com/compute/docs/disks/local-ssd). Default is "pd-standard".
   */
  deviceType?: 'pd-standard' | 'pd-ssd' | 'local-ssd';
  /**
   * Size is the size of the disk in GBs. Defaults to 30GB. For "local-ssd" size is always 375GB.
   */
  size?: number;
}

export interface IServiceAccount {
  /**
   * Email: Email address of the service account.
   */
  email?: string;
  /**
   * Scopes: The list of scopes to be made available for this service account.
   */
  scopes?: string[];
}

/**
 * Spec is the specification of the desired behavior of the machine.
 */
export interface IGCPMachineSpec {
  /**
   * AdditionalDisks are optional non-boot attached disks.
   */
  additionalDisks?: IAttachedDiskSpec[];
  /**
   * AdditionalLabels is an optional set of tags to add to an instance, in addition to the ones added by default by the GCP provider. If both the GCPCluster and the GCPMachine specify the same tag name with different values, the GCPMachine's value takes precedence.
   */
  additionalLabels?: Labels;
  /**
   * AdditionalMetadata is an optional set of metadata to add to an instance, in addition to the ones added by default by the GCP provider.
   */
  additionalMetadata?: IMetadataItem[];
  /**
   * AdditionalNetworkTags is a list of network tags that should be applied to the instance. These tags are set in addition to any network tags defined at the cluster level or in the actuator.
   */
  additionalNetworkTags?: string[];
  /**
   * Image is the full reference to a valid image to be used for this machine. Takes precedence over ImageFamily.
   */
  image?: string;
  /**
   * ImageFamily is the full reference to a valid image family to be used for this machine.
   */
  imageFamily?: string;
  /**
   * InstanceType is the type of instance to create. Example: n1.standard-2
   */
  instanceType: string;
  /**
   * Preemptible defines if instance is preemptible
   */
  preemptible?: boolean;
  /**
   * ProviderID is the unique identifier as specified by the cloud provider.
   */
  providerID?: string;
  /**
   * PublicIP specifies whether the instance should get a public IP. Set this to true if you don't have a NAT instances or Cloud Nat setup.
   */
  publicIP?: boolean;
  /**
   * RootDeviceSize is the size of the root volume in GB. Defaults to 30.
   */
  rootDeviceSize?: number;
  /**
   * RootDeviceType is the type of the root volume. Supported types of root volumes: 1. "pd-standard" - Standard (HDD) persistent disk 2. "pd-ssd" - SSD persistent disk Default is "pd-standard".
   */
  rootDeviceType?: 'pd-standard' | 'pd-ssd';
  /**
   * ServiceAccount specifies the service account email and which scopes to assign to the machine. Defaults to: email: "default", scope: []{compute.CloudPlatformScope}
   */
  serviceAccounts?: IServiceAccount;
  /**
   * Subnet is a reference to the subnetwork to use for this instance. If not specified, the first subnetwork retrieved from the Cluster Region and Network is picked.
   */
  subnet?: string;
}

/**
 * GCPMachineTemplateResource describes the data needed to create am GCPMachine from a template.
 */
export interface IGCPMachineTemplateResource {
  spec: IGCPMachineSpec;
}

/**
 * GCPMachineTemplateSpec defines the desired state of GCPMachineTemplate.
 */
export interface IGCPMachineTemplateSpec {
  template: IGCPMachineTemplateResource;
}

export const GCPMachineTemplate = 'GCPMachineTemplate';

export interface IGCPMachineTemplate {
  apiVersion: typeof ApiVersion;
  kind: typeof GCPMachineTemplate;
  metadata?: metav1.IObjectMeta;
  spec?: IGCPMachineTemplateSpec;
}

export const GCPMachineTemplateList = 'GCPMachineTemplateList';

export interface IGCPMachineTemplateList
  extends metav1.IList<IGCPMachineTemplate> {
  apiVersion: typeof ApiVersion;
  kind: typeof GCPMachineTemplateList;
}
