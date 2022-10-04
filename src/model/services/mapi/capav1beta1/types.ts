import * as capiv1beta1 from '../capiv1beta1';
import * as metav1 from '../metav1';

export const ApiVersion = 'infrastructure.cluster.x-k8s.io/v1beta1';

export const AWSCluster = 'AWSCluster';

/**
 * AWSCluster is the schema for Amazon EC2 based Kubernetes Cluster API.
 */
export interface IAWSCluster {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSCluster;
  metadata: metav1.IObjectMeta;
  /**
   * AWSClusterSpec defines the desired state of an EC2-based Kubernetes cluster.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to AWS resources managed by the AWS provider, in addition to the ones added by default.
     */
    additionalTags?: {
      [key: string]: string;
    };
    /**
     * Bastion contains options to configure the bastion host.
     */
    bastion?: {
      /**
       * AllowedCIDRBlocks is a list of CIDR blocks allowed to access the bastion host. They are set as ingress rules for the Bastion host's Security Group (defaults to 0.0.0.0/0).
       */
      allowedCIDRBlocks?: Array<string>;
      /**
       * AMI will use the specified AMI to boot the bastion. If not specified, the AMI will default to one picked out in public space.
       */
      ami?: string;
      /**
       * DisableIngressRules will ensure there are no Ingress rules in the bastion host's security group. Requires AllowedCIDRBlocks to be empty.
       */
      disableIngressRules?: boolean;
      /**
       * Enabled allows this provider to create a bastion host instance with a public ip to access the VPC private network.
       */
      enabled?: boolean;
      /**
       * InstanceType will use the specified instance type for the bastion. If not specified, Cluster API Provider AWS will use t3.micro for all regions except us-east-1, where t2.micro will be the default.
       */
      instanceType?: string;
    };
    /**
     * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
     */
    controlPlaneEndpoint?: capiv1beta1.IApiEndpoint;
    /**
     * ControlPlaneLoadBalancer is optional configuration for customizing control plane behavior.
     */
    controlPlaneLoadBalancer?: {
      /**
       * AdditionalSecurityGroups sets the security groups used by the load balancer. Expected to be security group IDs This is optional - if not provided new security groups will be created for the load balancer
       */
      additionalSecurityGroups?: Array<string>;
      /**
       * CrossZoneLoadBalancing enables the classic ELB cross availability zone balancing.
       *  With cross-zone load balancing, each load balancer node for your Classic Load Balancer distributes requests evenly across the registered instances in all enabled Availability Zones. If cross-zone load balancing is disabled, each load balancer node distributes requests evenly across the registered instances in its Availability Zone only.
       *  Defaults to false.
       */
      crossZoneLoadBalancing?: boolean;
      /**
       * HealthCheckProtocol sets the protocol type for classic ELB health check target default value is ClassicELBProtocolSSL
       */
      healthCheckProtocol?: string;
      /**
       * Name sets the name of the classic ELB load balancer. As per AWS, the name must be unique within your set of load balancers for the region, must have a maximum of 32 characters, must contain only alphanumeric characters or hyphens, and cannot begin or end with a hyphen. Once set, the value cannot be changed.
       */
      name?: string;
      /**
       * Scheme sets the scheme of the load balancer (defaults to internet-facing)
       */
      scheme?: 'internet-facing' | 'internal';
      /**
       * Subnets sets the subnets that should be applied to the control plane load balancer (defaults to discovered subnets for managed VPCs or an empty set for unmanaged VPCs)
       */
      subnets?: Array<string>;
    };
    /**
     * IdentityRef is a reference to a identity to be used when reconciling this cluster
     */
    identityRef?: {
      /**
       * Kind of the identity.
       */
      kind:
        | 'AWSClusterControllerIdentity'
        | 'AWSClusterRoleIdentity'
        | 'AWSClusterStaticIdentity';
      /**
       * Name of the identity.
       */
      name: string;
    };
    /**
     * ImageLookupBaseOS is the name of the base operating system used to look up machine images when a machine does not specify an AMI. When set, this will be used for all cluster machines unless a machine specifies a different ImageLookupBaseOS.
     */
    imageLookupBaseOS?: string;
    /**
     * ImageLookupFormat is the AMI naming format to look up machine images when a machine does not specify an AMI. When set, this will be used for all cluster machines unless a machine specifies a different ImageLookupOrg. Supports substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base OS and kubernetes version, respectively. The BaseOS will be the value in ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as defined by the packages produced by kubernetes/release without v as a prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-\* will end up searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-\* for a Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See also: https://golang.org/pkg/text/template/
     */
    imageLookupFormat?: string;
    /**
     * ImageLookupOrg is the AWS Organization ID to look up machine images when a machine does not specify an AMI. When set, this will be used for all cluster machines unless a machine specifies a different ImageLookupOrg.
     */
    imageLookupOrg?: string;
    /**
     * NetworkSpec encapsulates all things related to AWS network.
     */
    network?: {
      /**
       * CNI configuration
       */
      cni?: {
        /**
         * CNIIngressRules specify rules to apply to control plane and worker node security groups. The source for the rule will be set to control plane and worker security group IDs.
         */
        cniIngressRules?: Array<{
          description: string;
          fromPort: number;
          /**
           * SecurityGroupProtocol defines the protocol type for a security group rule.
           */
          protocol: string;
          toPort: number;
        }>;
      };
      /**
       * SecurityGroupOverrides is an optional set of security groups to use for cluster instances This is optional - if not provided new security groups will be created for the cluster
       */
      securityGroupOverrides?: {
        [key: string]: string;
      };
      /**
       * Subnets configuration.
       */
      subnets?: Array<{
        /**
         * AvailabilityZone defines the availability zone to use for this subnet in the cluster's region.
         */
        availabilityZone?: string;
        /**
         * CidrBlock is the CIDR block to be used when the provider creates a managed VPC.
         */
        cidrBlock?: string;
        /**
         * ID defines a unique identifier to reference this resource.
         */
        id?: string;
        /**
         * IsPublic defines the subnet as a public subnet. A subnet is public when it is associated with a route table that has a route to an internet gateway.
         */
        isPublic?: boolean;
        /**
         * NatGatewayID is the NAT gateway id associated with the subnet. Ignored unless the subnet is managed by the provider, in which case this is set on the public subnet where the NAT gateway resides. It is then used to determine routes for private subnets in the same AZ as the public subnet.
         */
        natGatewayId?: string;
        /**
         * RouteTableID is the routing table id associated with the subnet.
         */
        routeTableId?: string;
        /**
         * Tags is a collection of tags describing the resource.
         */
        tags?: {
          [key: string]: string;
        };
      }>;
      /**
       * VPC configuration.
       */
      vpc?: {
        /**
         * AvailabilityZoneSelection specifies how AZs should be selected if there are more AZs in a region than specified by AvailabilityZoneUsageLimit. There are 2 selection schemes: Ordered - selects based on alphabetical order Random - selects AZs randomly in a region Defaults to Ordered
         */
        availabilityZoneSelection?: 'Ordered' | 'Random';
        /**
         * AvailabilityZoneUsageLimit specifies the maximum number of availability zones (AZ) that should be used in a region when automatically creating subnets. If a region has more than this number of AZs then this number of AZs will be picked randomly when creating default subnets. Defaults to 3
         */
        availabilityZoneUsageLimit?: number;
        /**
         * CidrBlock is the CIDR block to be used when the provider creates a managed VPC. Defaults to 10.0.0.0/16.
         */
        cidrBlock?: string;
        /**
         * ID is the vpc-id of the VPC this provider should use to create resources.
         */
        id?: string;
        /**
         * InternetGatewayID is the id of the internet gateway associated with the VPC.
         */
        internetGatewayId?: string;
        /**
         * Tags is a collection of tags describing the resource.
         */
        tags?: {
          [key: string]: string;
        };
      };
    };
    /**
     * The AWS Region the cluster lives in.
     */
    region?: string;
    /**
     * S3Bucket contains options to configure a supporting S3 bucket for this cluster - currently used for nodes requiring Ignition (https://coreos.github.io/ignition/) for bootstrapping (requires BootstrapFormatIgnition feature flag to be enabled).
     */
    s3Bucket?: {
      /**
       * ControlPlaneIAMInstanceProfile is a name of the IAMInstanceProfile, which will be allowed to read control-plane node bootstrap data from S3 Bucket.
       */
      controlPlaneIAMInstanceProfile: string;
      /**
       * Name defines name of S3 Bucket to be created.
       */
      name: string;
      /**
       * NodesIAMInstanceProfiles is a list of IAM instance profiles, which will be allowed to read worker nodes bootstrap data from S3 Bucket.
       */
      nodesIAMInstanceProfiles: Array<string>;
    };
    /**
     * SSHKeyName is the name of the ssh key to attach to the bastion host. Valid values are empty string (do not use SSH keys), a valid SSH key name, or omitted (use the default SSH key name)
     */
    sshKeyName?: string;
  };
  /**
   * AWSClusterStatus defines the observed state of AWSCluster.
   */
  status?: {
    /**
     * Instance describes an AWS instance.
     */
    bastion?: {
      /**
       * Addresses contains the AWS instance associated addresses.
       */
      addresses?: Array<{
        /**
         * The machine address.
         */
        address: string;
        /**
         * Machine address type, one of Hostname, ExternalIP or InternalIP.
         */
        type: string;
      }>;
      /**
       * Availability zone of instance
       */
      availabilityZone?: string;
      /**
       * Indicates whether the instance is optimized for Amazon EBS I/O.
       */
      ebsOptimized?: boolean;
      /**
       * Specifies whether enhanced networking with ENA is enabled.
       */
      enaSupport?: boolean;
      /**
       * The name of the IAM instance profile associated with the instance, if applicable.
       */
      iamProfile?: string;
      id: string;
      /**
       * The ID of the AMI used to launch the instance.
       */
      imageId?: string;
      /**
       * The current state of the instance.
       */
      instanceState?: string;
      /**
       * Specifies ENIs attached to instance
       */
      networkInterfaces?: Array<string>;
      /**
       * Configuration options for the non root storage volumes.
       */
      nonRootVolumes?: Array<{
        /**
         * Device name
         */
        deviceName?: string;
        /**
         * Encrypted is whether the volume should be encrypted or not.
         */
        encrypted?: boolean;
        /**
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN. If Encrypted is set and this is omitted, the default AWS key will be used. The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device. Must be greater than the image snapshot size or 8 (whichever is greater).
         */
        size: number;
        /**
         * Throughput to provision in MiB/s supported for the volume type. Not applicable to all types.
         */
        throughput?: number;
        /**
         * Type is the type of the volume (e.g. gp2, io1, etc...).
         */
        type?: string;
      }>;
      /**
       * The private IPv4 address assigned to the instance.
       */
      privateIp?: string;
      /**
       * The public IPv4 address assigned to the instance, if applicable.
       */
      publicIp?: string;
      /**
       * Configuration options for the root storage volume.
       */
      rootVolume?: {
        /**
         * Device name
         */
        deviceName?: string;
        /**
         * Encrypted is whether the volume should be encrypted or not.
         */
        encrypted?: boolean;
        /**
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN. If Encrypted is set and this is omitted, the default AWS key will be used. The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device. Must be greater than the image snapshot size or 8 (whichever is greater).
         */
        size: number;
        /**
         * Throughput to provision in MiB/s supported for the volume type. Not applicable to all types.
         */
        throughput?: number;
        /**
         * Type is the type of the volume (e.g. gp2, io1, etc...).
         */
        type?: string;
      };
      /**
       * SecurityGroupIDs are one or more security group IDs this instance belongs to.
       */
      securityGroupIds?: Array<string>;
      /**
       * SpotMarketOptions option for configuring instances to be run using AWS Spot instances.
       */
      spotMarketOptions?: {
        /**
         * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
         */
        maxPrice?: string;
      };
      /**
       * The name of the SSH key pair.
       */
      sshKeyName?: string;
      /**
       * The ID of the subnet of the instance.
       */
      subnetId?: string;
      /**
       * The tags associated with the instance.
       */
      tags?: {
        [key: string]: string;
      };
      /**
       * Tenancy indicates if instance should run on shared or single-tenant hardware.
       */
      tenancy?: string;
      /**
       * The instance type.
       */
      type?: string;
      /**
       * UserData is the raw data script passed to the instance which is run upon bootstrap. This field must not be base64 encoded and should only be used when running a new instance.
       */
      userData?: string;
      /**
       * IDs of the instance's volumes
       */
      volumeIDs?: Array<string>;
    };
    /**
     * Conditions provide observations of the operational state of a Cluster API resource.
     */
    conditions?: capiv1beta1.ICondition[];
    /**
     * FailureDomains is a slice of FailureDomains.
     */
    failureDomains?: capiv1beta1.FailureDomains;
    /**
     * NetworkStatus encapsulates AWS networking resources.
     */
    networkStatus?: {
      /**
       * APIServerELB is the Kubernetes api server classic load balancer.
       */
      apiServerElb?: {
        /**
         * Attributes defines extra attributes associated with the load balancer.
         */
        attributes?: {
          /**
           * CrossZoneLoadBalancing enables the classic load balancer load balancing.
           */
          crossZoneLoadBalancing?: boolean;
          /**
           * IdleTimeout is time that the connection is allowed to be idle (no data has been sent over the connection) before it is closed by the load balancer.
           */
          idleTimeout?: number;
        };
        /**
         * AvailabilityZones is an array of availability zones in the VPC attached to the load balancer.
         */
        availabilityZones?: Array<string>;
        /**
         * DNSName is the dns name of the load balancer.
         */
        dnsName?: string;
        /**
         * HealthCheck is the classic elb health check associated with the load balancer.
         */
        healthChecks?: {
          healthyThreshold: number;
          /**
           * A Duration represents the elapsed time between two instants as an int64 nanosecond count. The representation limits the largest representable duration to approximately 290 years.
           */
          interval: number;
          target: string;
          /**
           * A Duration represents the elapsed time between two instants as an int64 nanosecond count. The representation limits the largest representable duration to approximately 290 years.
           */
          timeout: number;
          unhealthyThreshold: number;
        };
        /**
         * Listeners is an array of classic elb listeners associated with the load balancer. There must be at least one.
         */
        listeners?: Array<{
          instancePort: number;
          /**
           * ClassicELBProtocol defines listener protocols for a classic load balancer.
           */
          instanceProtocol: string;
          port: number;
          /**
           * ClassicELBProtocol defines listener protocols for a classic load balancer.
           */
          protocol: string;
        }>;
        /**
         * The name of the load balancer. It must be unique within the set of load balancers defined in the region. It also serves as identifier.
         */
        name?: string;
        /**
         * Scheme is the load balancer scheme, either internet-facing or private.
         */
        scheme?: string;
        /**
         * SecurityGroupIDs is an array of security groups assigned to the load balancer.
         */
        securityGroupIds?: Array<string>;
        /**
         * SubnetIDs is an array of subnets in the VPC attached to the load balancer.
         */
        subnetIds?: Array<string>;
        /**
         * Tags is a map of tags associated with the load balancer.
         */
        tags?: {
          [key: string]: string;
        };
      };
      /**
       * SecurityGroups is a map from the role/kind of the security group to its unique name, if any.
       */
      securityGroups?: {
        [key: string]: {
          /**
           * ID is a unique identifier.
           */
          id: string;
          /**
           * IngressRules is the inbound rules associated with the security group.
           */
          ingressRule?: Array<{
            /**
             * List of CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
             */
            cidrBlocks?: Array<string>;
            description: string;
            fromPort: number;
            /**
             * SecurityGroupProtocol defines the protocol type for a security group rule.
             */
            protocol: string;
            /**
             * The security group id to allow access from. Cannot be specified with CidrBlocks.
             */
            sourceSecurityGroupIds?: Array<string>;
            toPort: number;
          }>;
          /**
           * Name is the security group name.
           */
          name: string;
          /**
           * Tags is a map of tags associated with the security group.
           */
          tags?: {
            [key: string]: string;
          };
        };
      };
    };
    ready: boolean;
  };
}

export const AWSClusterList = 'AWSClusterList';

export interface IAWSClusterList extends metav1.IList<IAWSCluster> {
  apiVersion: typeof ApiVersion;
  kind: typeof AWSClusterList;
}

export const AWSMachineTemplate = 'AWSMachineTemplate';

/**
 * AWSMachineTemplate is the schema for the Amazon EC2 Machine Templates API.
 */
export interface IAWSMachineTemplate {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSMachineTemplate;
  metadata: metav1.IObjectMeta;
  /**
   * AWSMachineTemplateSpec defines the desired state of AWSMachineTemplate.
   */
  spec?: {
    /**
     * AWSMachineTemplateResource describes the data needed to create am AWSMachine from a template.
     */
    template: {
      /**
       * Standard object's metadata. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
       */
      metadata?: {
        /**
         * Annotations is an unstructured key value map stored with a resource that may be set by external tools to store and retrieve arbitrary metadata. They are not queryable and should be preserved when modifying objects. More info: http://kubernetes.io/docs/user-guide/annotations
         */
        annotations?: {
          [key: string]: string;
        };
        /**
         * Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. More info: http://kubernetes.io/docs/user-guide/labels
         */
        labels?: {
          [key: string]: string;
        };
      };
      /**
       * Spec is the specification of the desired behavior of the machine.
       */
      spec: {
        /**
         * AdditionalSecurityGroups is an array of references to security groups that should be applied to the instance. These security groups would be set in addition to any security groups defined at the cluster level or in the actuator. It is possible to specify either IDs of Filters. Using Filters will cause additional requests to AWS API and if tags change the attached security groups might change too.
         */
        additionalSecurityGroups?: Array<{
          /**
           * ARN of resource. Deprecated: This field has no function and is going to be removed in the next release.
           */
          arn?: string;
          /**
           * Filters is a set of key/value pairs used to identify a resource They are applied according to the rules defined by the AWS API: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
           */
          filters?: Array<{
            /**
             * Name of the filter. Filter names are case-sensitive.
             */
            name: string;
            /**
             * Values includes one or more filter values. Filter values are case-sensitive.
             */
            values: Array<string>;
          }>;
          /**
           * ID of resource
           */
          id?: string;
        }>;
        /**
         * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the AWS provider. If both the AWSCluster and the AWSMachine specify the same tag name with different values, the AWSMachine's value takes precedence.
         */
        additionalTags?: {
          [key: string]: string;
        };
        /**
         * AMI is the reference to the AMI from which to create the machine instance.
         */
        ami?: {
          /**
           * EKSOptimizedLookupType If specified, will look up an EKS Optimized image in SSM Parameter store
           */
          eksLookupType?: 'AmazonLinux' | 'AmazonLinuxGPU';
          /**
           * ID of resource
           */
          id?: string;
        };
        /**
         * CloudInit defines options related to the bootstrapping systems where CloudInit is used.
         */
        cloudInit?: {
          /**
           * InsecureSkipSecretsManager, when set to true will not use AWS Secrets Manager or AWS Systems Manager Parameter Store to ensure privacy of userdata. By default, a cloud-init boothook shell script is prepended to download the userdata from Secrets Manager and additionally delete the secret.
           */
          insecureSkipSecretsManager?: boolean;
          /**
           * SecretCount is the number of secrets used to form the complete secret
           */
          secretCount?: number;
          /**
           * SecretPrefix is the prefix for the secret name. This is stored temporarily, and deleted when the machine registers as a node against the workload cluster.
           */
          secretPrefix?: string;
          /**
           * SecureSecretsBackend, when set to parameter-store will utilize the AWS Systems Manager Parameter Storage to distribute secrets. By default or with the value of secrets-manager, will use AWS Secrets Manager instead.
           */
          secureSecretsBackend?: 'secrets-manager' | 'ssm-parameter-store';
        };
        /**
         * FailureDomain is the failure domain unique identifier this Machine should be attached to, as defined in Cluster API. For this infrastructure provider, the ID is equivalent to an AWS Availability Zone. If multiple subnets are matched for the availability zone, the first one returned is picked.
         */
        failureDomain?: string;
        /**
         * IAMInstanceProfile is a name of an IAM instance profile to assign to the instance
         */
        iamInstanceProfile?: string;
        /**
         * Ignition defined options related to the bootstrapping systems where Ignition is used.
         */
        ignition?: {
          /**
           * Version defines which version of Ignition will be used to generate bootstrap data.
           */
          version?: '2.3';
        };
        /**
         * ImageLookupBaseOS is the name of the base operating system to use for image lookup the AMI is not set.
         */
        imageLookupBaseOS?: string;
        /**
         * ImageLookupFormat is the AMI naming format to look up the image for this machine It will be ignored if an explicit AMI is set. Supports substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base OS and kubernetes version, respectively. The BaseOS will be the value in ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as defined by the packages produced by kubernetes/release without v as a prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-\* will end up searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-\* for a Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See also: https://golang.org/pkg/text/template/
         */
        imageLookupFormat?: string;
        /**
         * ImageLookupOrg is the AWS Organization ID to use for image lookup if AMI is not set.
         */
        imageLookupOrg?: string;
        /**
         * InstanceID is the EC2 instance ID for this machine.
         */
        instanceID?: string;
        /**
         * InstanceType is the type of instance to create. Example: m4.xlarge
         */
        instanceType: string;
        /**
         * NetworkInterfaces is a list of ENIs to associate with the instance. A maximum of 2 may be specified.
         */
        networkInterfaces?: Array<string>;
        /**
         * Configuration options for the non root storage volumes.
         */
        nonRootVolumes?: Array<{
          /**
           * Device name
           */
          deviceName?: string;
          /**
           * Encrypted is whether the volume should be encrypted or not.
           */
          encrypted?: boolean;
          /**
           * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN. If Encrypted is set and this is omitted, the default AWS key will be used. The key must already exist and be accessible by the controller.
           */
          encryptionKey?: string;
          /**
           * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
           */
          iops?: number;
          /**
           * Size specifies size (in Gi) of the storage device. Must be greater than the image snapshot size or 8 (whichever is greater).
           */
          size: number;
          /**
           * Throughput to provision in MiB/s supported for the volume type. Not applicable to all types.
           */
          throughput?: number;
          /**
           * Type is the type of the volume (e.g. gp2, io1, etc...).
           */
          type?: string;
        }>;
        /**
         * ProviderID is the unique identifier as specified by the cloud provider.
         */
        providerID?: string;
        /**
         * PublicIP specifies whether the instance should get a public IP. Precedence for this setting is as follows: 1. This field if set 2. Cluster/flavor setting 3. Subnet default
         */
        publicIP?: boolean;
        /**
         * RootVolume encapsulates the configuration options for the root volume
         */
        rootVolume?: {
          /**
           * Device name
           */
          deviceName?: string;
          /**
           * Encrypted is whether the volume should be encrypted or not.
           */
          encrypted?: boolean;
          /**
           * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN. If Encrypted is set and this is omitted, the default AWS key will be used. The key must already exist and be accessible by the controller.
           */
          encryptionKey?: string;
          /**
           * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
           */
          iops?: number;
          /**
           * Size specifies size (in Gi) of the storage device. Must be greater than the image snapshot size or 8 (whichever is greater).
           */
          size: number;
          /**
           * Throughput to provision in MiB/s supported for the volume type. Not applicable to all types.
           */
          throughput?: number;
          /**
           * Type is the type of the volume (e.g. gp2, io1, etc...).
           */
          type?: string;
        };
        /**
         * SpotMarketOptions allows users to configure instances to be run using AWS Spot instances.
         */
        spotMarketOptions?: {
          /**
           * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
           */
          maxPrice?: string;
        };
        /**
         * SSHKeyName is the name of the ssh key to attach to the instance. Valid values are empty string (do not use SSH keys), a valid SSH key name, or omitted (use the default SSH key name)
         */
        sshKeyName?: string;
        /**
         * Subnet is a reference to the subnet to use for this instance. If not specified, the cluster subnet will be used.
         */
        subnet?: {
          /**
           * ARN of resource. Deprecated: This field has no function and is going to be removed in the next release.
           */
          arn?: string;
          /**
           * Filters is a set of key/value pairs used to identify a resource They are applied according to the rules defined by the AWS API: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
           */
          filters?: Array<{
            /**
             * Name of the filter. Filter names are case-sensitive.
             */
            name: string;
            /**
             * Values includes one or more filter values. Filter values are case-sensitive.
             */
            values: Array<string>;
          }>;
          /**
           * ID of resource
           */
          id?: string;
        };
        /**
         * Tenancy indicates if instance should run on shared or single-tenant hardware.
         */
        tenancy?: 'default' | 'dedicated' | 'host';
        /**
         * UncompressedUserData specify whether the user data is gzip-compressed before it is sent to ec2 instance. cloud-init has built-in support for gzip-compressed user data user data stored in aws secret manager is always gzip-compressed.
         */
        uncompressedUserData?: boolean;
      };
    };
  };
}

export const AWSMachineTemplateList = 'AWSMachineTemplateList';

export interface IAWSMachineTemplateList
  extends metav1.IList<IAWSMachineTemplate> {
  apiVersion: typeof ApiVersion;
  kind: typeof AWSMachineTemplateList;
}

export const AWSMachinePool = 'AWSMachinePool';

/**
 * AWSMachinePool is the Schema for the awsmachinepools API.
 */
export interface IAWSMachinePool {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSMachinePool;
  metadata: metav1.IObjectMeta;
  /**
   * AWSMachinePoolSpec defines the desired state of AWSMachinePool.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the AWS provider.
     */
    additionalTags?: {
      [key: string]: string;
    };
    /**
     * AvailabilityZones is an array of availability zones instances can run in
     */
    availabilityZones?: Array<string>;
    /**
     * AWSLaunchTemplate specifies the launch template and version to use when an instance is launched.
     */
    awsLaunchTemplate: {
      /**
       * AdditionalSecurityGroups is an array of references to security groups that should be applied to the instances. These security groups would be set in addition to any security groups defined at the cluster level or in the actuator.
       */
      additionalSecurityGroups?: Array<{
        /**
         * ARN of resource. Deprecated: This field has no function and is going to be removed in the next release.
         */
        arn?: string;
        /**
         * Filters is a set of key/value pairs used to identify a resource They are applied according to the rules defined by the AWS API: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
         */
        filters?: Array<{
          /**
           * Name of the filter. Filter names are case-sensitive.
           */
          name: string;
          /**
           * Values includes one or more filter values. Filter values are case-sensitive.
           */
          values: Array<string>;
        }>;
        /**
         * ID of resource
         */
        id?: string;
      }>;
      /**
       * AMI is the reference to the AMI from which to create the machine instance.
       */
      ami?: {
        /**
         * EKSOptimizedLookupType If specified, will look up an EKS Optimized image in SSM Parameter store
         */
        eksLookupType?: 'AmazonLinux' | 'AmazonLinuxGPU';
        /**
         * ID of resource
         */
        id?: string;
      };
      /**
       * The name or the Amazon Resource Name (ARN) of the instance profile associated with the IAM role for the instance. The instance profile contains the IAM role.
       */
      iamInstanceProfile?: string;
      /**
       * ImageLookupBaseOS is the name of the base operating system to use for image lookup the AMI is not set.
       */
      imageLookupBaseOS?: string;
      /**
       * ImageLookupFormat is the AMI naming format to look up the image for this machine It will be ignored if an explicit AMI is set. Supports substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base OS and kubernetes version, respectively. The BaseOS will be the value in ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as defined by the packages produced by kubernetes/release without v as a prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-\* will end up searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-\* for a Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See also: https://golang.org/pkg/text/template/
       */
      imageLookupFormat?: string;
      /**
       * ImageLookupOrg is the AWS Organization ID to use for image lookup if AMI is not set.
       */
      imageLookupOrg?: string;
      /**
       * InstanceType is the type of instance to create. Example: m4.xlarge
       */
      instanceType?: string;
      /**
       * The name of the launch template.
       */
      name?: string;
      /**
       * RootVolume encapsulates the configuration options for the root volume
       */
      rootVolume?: {
        /**
         * Device name
         */
        deviceName?: string;
        /**
         * Encrypted is whether the volume should be encrypted or not.
         */
        encrypted?: boolean;
        /**
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN. If Encrypted is set and this is omitted, the default AWS key will be used. The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device. Must be greater than the image snapshot size or 8 (whichever is greater).
         */
        size: number;
        /**
         * Throughput to provision in MiB/s supported for the volume type. Not applicable to all types.
         */
        throughput?: number;
        /**
         * Type is the type of the volume (e.g. gp2, io1, etc...).
         */
        type?: string;
      };
      /**
       * SSHKeyName is the name of the ssh key to attach to the instance. Valid values are empty string (do not use SSH keys), a valid SSH key name, or omitted (use the default SSH key name)
       */
      sshKeyName?: string;
      /**
       * VersionNumber is the version of the launch template that is applied. Typically a new version is created when at least one of the following happens: 1) A new launch template spec is applied. 2) One or more parameters in an existing template is changed. 3) A new AMI is discovered.
       */
      versionNumber?: number;
    };
    /**
     * Enable or disable the capacity rebalance autoscaling group feature
     */
    capacityRebalance?: boolean;
    /**
     * The amount of time, in seconds, after a scaling activity completes before another scaling activity can start. If no value is supplied by user a default value of 300 seconds is set
     */
    defaultCoolDown?: string;
    /**
     * MaxSize defines the maximum size of the group.
     */
    maxSize: number;
    /**
     * MinSize defines the minimum size of the group.
     */
    minSize: number;
    /**
     * MixedInstancesPolicy describes how multiple instance types will be used by the ASG.
     */
    mixedInstancesPolicy?: {
      /**
       * InstancesDistribution to configure distribution of On-Demand Instances and Spot Instances.
       */
      instancesDistribution?: {
        /**
         * OnDemandAllocationStrategy indicates how to allocate instance types to fulfill On-Demand capacity.
         */
        onDemandAllocationStrategy?: 'prioritized';
        onDemandBaseCapacity?: number;
        onDemandPercentageAboveBaseCapacity?: number;
        /**
         * SpotAllocationStrategy indicates how to allocate instances across Spot Instance pools.
         */
        spotAllocationStrategy?: 'lowest-price' | 'capacity-optimized';
      };
      overrides?: Array<{
        instanceType: string;
      }>;
    };
    /**
     * ProviderID is the ARN of the associated ASG
     */
    providerID?: string;
    /**
     * ProviderIDList are the identification IDs of machine instances provided by the provider. This field must match the provider IDs as seen on the node objects corresponding to a machine pool's machine instances.
     */
    providerIDList?: Array<string>;
    /**
     * RefreshPreferences describes set of preferences associated with the instance refresh request.
     */
    refreshPreferences?: {
      /**
       * The number of seconds until a newly launched instance is configured and ready to use. During this time, the next replacement will not be initiated. The default is to use the value for the health check grace period defined for the group.
       */
      instanceWarmup?: number;
      /**
       * The amount of capacity as a percentage in ASG that must remain healthy during an instance refresh. The default is 90.
       */
      minHealthyPercentage?: number;
      /**
       * The strategy to use for the instance refresh. The only valid value is Rolling. A rolling update is an update that is applied to all instances in an Auto Scaling group until all instances have been updated.
       */
      strategy?: string;
    };
    /**
     * Subnets is an array of subnet configurations
     */
    subnets?: Array<{
      /**
       * ARN of resource. Deprecated: This field has no function and is going to be removed in the next release.
       */
      arn?: string;
      /**
       * Filters is a set of key/value pairs used to identify a resource They are applied according to the rules defined by the AWS API: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
       */
      filters?: Array<{
        /**
         * Name of the filter. Filter names are case-sensitive.
         */
        name: string;
        /**
         * Values includes one or more filter values. Filter values are case-sensitive.
         */
        values: Array<string>;
      }>;
      /**
       * ID of resource
       */
      id?: string;
    }>;
  };
  /**
   * AWSMachinePoolStatus defines the observed state of AWSMachinePool.
   */
  status?: {
    /**
     * ASGStatus is a status string returned by the autoscaling API.
     */
    asgStatus?: string;
    /**
     * Conditions defines current service state of the AWSMachinePool.
     */
    conditions?: capiv1beta1.ICondition[];
    /**
     * FailureMessage will be set in the event that there is a terminal problem reconciling the Machine and will contain a more verbose string suitable for logging and human consumption.
     *  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the Machine's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured.
     *  Any transient errors that occur during the reconciliation of Machines can be added as events to the Machine object and/or logged in the controller's output.
     */
    failureMessage?: string;
    /**
     * FailureReason will be set in the event that there is a terminal problem reconciling the Machine and will contain a succinct value suitable for machine interpretation.
     *  This field should not be set for transitive errors that a controller faces that are expected to be fixed automatically over time (like service outages), but instead indicate that something is fundamentally wrong with the Machine's spec or the configuration of the controller, and that manual intervention is required. Examples of terminal errors would be invalid combinations of settings in the spec, values that are unsupported by the controller, or the responsible controller itself being critically misconfigured.
     *  Any transient errors that occur during the reconciliation of Machines can be added as events to the Machine object and/or logged in the controller's output.
     */
    failureReason?: string;
    /**
     * Instances contains the status for each instance in the pool
     */
    instances?: Array<{
      /**
       * InstanceID is the identification of the Machine Instance within ASG
       */
      instanceID?: string;
      /**
       * Version defines the Kubernetes version for the Machine Instance
       */
      version?: string;
    }>;
    /**
     * The ID of the launch template
     */
    launchTemplateID?: string;
    /**
     * Ready is true when the provider resource is ready.
     */
    ready?: boolean;
    /**
     * Replicas is the most recently observed number of replicas
     */
    replicas?: number;
  };
}

export const AWSMachinePoolList = 'AWSMachinePoolList';

export interface IAWSMachinePoolList extends metav1.IList<IAWSMachinePool> {
  apiVersion: typeof ApiVersion;
  kind: typeof AWSMachinePoolList;
}
