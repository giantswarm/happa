/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import * as metav1 from 'model/services/mapi/metav1';

export const ApiGroup = 'infrastructure.cluster.x-k8s.io';

export const ApiVersion = 'infrastructure.cluster.x-k8s.io/v1beta2';

export const AWSCluster = 'AWSCluster';

/**
 * AWSCluster is the schema for Amazon EC2 based Kubernetes Cluster API.
 */
export interface IAWSCluster {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSCluster;
  metadata: metav1.IObjectMeta;
  /**
   * AWSClusterSpec defines the desired state of an EC2-based Kubernetes cluster.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to AWS resources managed by the AWS provider, in addition to the
     * ones added by default.
     */
    additionalTags?: {
      [k: string]: string;
    };
    /**
     * Bastion contains options to configure the bastion host.
     */
    bastion?: {
      /**
       * AllowedCIDRBlocks is a list of CIDR blocks allowed to access the bastion host.
       * They are set as ingress rules for the Bastion host's Security Group (defaults to 0.0.0.0/0).
       */
      allowedCIDRBlocks?: string[];
      /**
       * AMI will use the specified AMI to boot the bastion. If not specified,
       * the AMI will default to one picked out in public space.
       */
      ami?: string;
      /**
       * DisableIngressRules will ensure there are no Ingress rules in the bastion host's security group.
       * Requires AllowedCIDRBlocks to be empty.
       */
      disableIngressRules?: boolean;
      /**
       * Enabled allows this provider to create a bastion host instance
       * with a public ip to access the VPC private network.
       */
      enabled?: boolean;
      /**
       * InstanceType will use the specified instance type for the bastion. If not specified,
       * Cluster API Provider AWS will use t3.micro for all regions except us-east-1, where t2.micro
       * will be the default.
       */
      instanceType?: string;
    };
    /**
     * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
     */
    controlPlaneEndpoint?: {
      /**
       * The hostname on which the API server is serving.
       */
      host: string;
      /**
       * The port on which the API server is serving.
       */
      port: number;
    };
    /**
     * ControlPlaneLoadBalancer is optional configuration for customizing control plane behavior.
     */
    controlPlaneLoadBalancer?: {
      /**
       * AdditionalListeners sets the additional listeners for the control plane load balancer.
       * This is only applicable to Network Load Balancer (NLB) types for the time being.
       */
      additionalListeners?: {
        /**
         * HealthCheck sets the optional custom health check configuration to the API target group.
         */
        healthCheck?: {
          /**
           * The approximate amount of time, in seconds, between health checks of an individual
           * target.
           */
          intervalSeconds?: number;
          /**
           * The destination for health checks on the targets when using the protocol HTTP or HTTPS,
           * otherwise the path will be ignored.
           */
          path?: string;
          /**
           * The port the load balancer uses when performing health checks for additional target groups. When
           * not specified this value will be set for the same of listener port.
           */
          port?: string;
          /**
           * The protocol to use to health check connect with the target. When not specified the Protocol
           * will be the same of the listener.
           */
          protocol?: 'TCP' | 'HTTP' | 'HTTPS';
          /**
           * The number of consecutive health check successes required before considering
           * a target healthy.
           */
          thresholdCount?: number;
          /**
           * The amount of time, in seconds, during which no response from a target means
           * a failed health check.
           */
          timeoutSeconds?: number;
          /**
           * The number of consecutive health check failures required before considering
           * a target unhealthy.
           */
          unhealthyThresholdCount?: number;
        };
        /**
         * Port sets the port for the additional listener.
         */
        port: number;
        /**
         * Protocol sets the protocol for the additional listener.
         * Currently only TCP is supported.
         */
        protocol?: 'TCP';
      }[];
      /**
       * AdditionalSecurityGroups sets the security groups used by the load balancer. Expected to be security group IDs
       * This is optional - if not provided new security groups will be created for the load balancer
       */
      additionalSecurityGroups?: string[];
      /**
       * CrossZoneLoadBalancing enables the classic ELB cross availability zone balancing.
       *
       *
       * With cross-zone load balancing, each load balancer node for your Classic Load Balancer
       * distributes requests evenly across the registered instances in all enabled Availability Zones.
       * If cross-zone load balancing is disabled, each load balancer node distributes requests evenly across
       * the registered instances in its Availability Zone only.
       *
       *
       * Defaults to false.
       */
      crossZoneLoadBalancing?: boolean;
      /**
       * DisableHostsRewrite disabled the hair pinning issue solution that adds the NLB's address as 127.0.0.1 to the hosts
       * file of each instance. This is by default, false.
       */
      disableHostsRewrite?: boolean;
      /**
       * HealthCheck sets custom health check configuration to the API target group.
       */
      healthCheck?: {
        /**
         * The approximate amount of time, in seconds, between health checks of an individual
         * target.
         */
        intervalSeconds?: number;
        /**
         * The number of consecutive health check successes required before considering
         * a target healthy.
         */
        thresholdCount?: number;
        /**
         * The amount of time, in seconds, during which no response from a target means
         * a failed health check.
         */
        timeoutSeconds?: number;
        /**
         * The number of consecutive health check failures required before considering
         * a target unhealthy.
         */
        unhealthyThresholdCount?: number;
      };
      /**
       * HealthCheckProtocol sets the protocol type for ELB health check target
       * default value is ELBProtocolSSL
       */
      healthCheckProtocol?: 'TCP' | 'SSL' | 'HTTP' | 'HTTPS' | 'TLS' | 'UDP';
      /**
       * IngressRules sets the ingress rules for the control plane load balancer.
       */
      ingressRules?: {
        /**
         * List of CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        cidrBlocks?: string[];
        /**
         * Description provides extended information about the ingress rule.
         */
        description: string;
        /**
         * FromPort is the start of port range.
         */
        fromPort: number;
        /**
         * List of IPv6 CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        ipv6CidrBlocks?: string[];
        /**
         * NatGatewaysIPsSource use the NAT gateways IPs as the source for the ingress rule.
         */
        natGatewaysIPsSource?: boolean;
        /**
         * Protocol is the protocol for the ingress rule. Accepted values are "-1" (all), "4" (IP in IP),"tcp", "udp", "icmp", and "58" (ICMPv6), "50" (ESP).
         */
        protocol: '-1' | '4' | 'tcp' | 'udp' | 'icmp' | '58' | '50';
        /**
         * The security group id to allow access from. Cannot be specified with CidrBlocks.
         */
        sourceSecurityGroupIds?: string[];
        /**
         * The security group role to allow access from. Cannot be specified with CidrBlocks.
         * The field will be combined with source security group IDs if specified.
         */
        sourceSecurityGroupRoles?: (
          | 'bastion'
          | 'node'
          | 'controlplane'
          | 'apiserver-lb'
          | 'lb'
          | 'node-eks-additional'
        )[];
        /**
         * ToPort is the end of port range.
         */
        toPort: number;
      }[];
      /**
       * LoadBalancerType sets the type for a load balancer. The default type is classic.
       */
      loadBalancerType?: 'classic' | 'elb' | 'alb' | 'nlb' | 'disabled';
      /**
       * Name sets the name of the classic ELB load balancer. As per AWS, the name must be unique
       * within your set of load balancers for the region, must have a maximum of 32 characters, must
       * contain only alphanumeric characters or hyphens, and cannot begin or end with a hyphen. Once
       * set, the value cannot be changed.
       */
      name?: string;
      /**
       * PreserveClientIP lets the user control if preservation of client ips must be retained or not.
       * If this is enabled 6443 will be opened to 0.0.0.0/0.
       */
      preserveClientIP?: boolean;
      /**
       * Scheme sets the scheme of the load balancer (defaults to internet-facing)
       */
      scheme?: 'internet-facing' | 'internal';
      /**
       * Subnets sets the subnets that should be applied to the control plane load balancer (defaults to discovered subnets for managed VPCs or an empty set for unmanaged VPCs)
       */
      subnets?: string[];
    };
    /**
     * IdentityRef is a reference to an identity to be used when reconciling the managed control plane.
     * If no identity is specified, the default identity for this controller will be used.
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
     * ImageLookupBaseOS is the name of the base operating system used to look
     * up machine images when a machine does not specify an AMI. When set, this
     * will be used for all cluster machines unless a machine specifies a
     * different ImageLookupBaseOS.
     */
    imageLookupBaseOS?: string;
    /**
     * ImageLookupFormat is the AMI naming format to look up machine images when
     * a machine does not specify an AMI. When set, this will be used for all
     * cluster machines unless a machine specifies a different ImageLookupOrg.
     * Supports substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base
     * OS and kubernetes version, respectively. The BaseOS will be the value in
     * ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as
     * defined by the packages produced by kubernetes/release without v as a
     * prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default
     * image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-* will end up
     * searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-* for a
     * Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See
     * also: https://golang.org/pkg/text/template/
     */
    imageLookupFormat?: string;
    /**
     * ImageLookupOrg is the AWS Organization ID to look up machine images when a
     * machine does not specify an AMI. When set, this will be used for all
     * cluster machines unless a machine specifies a different ImageLookupOrg.
     */
    imageLookupOrg?: string;
    /**
     * NetworkSpec encapsulates all things related to AWS network.
     */
    network?: {
      /**
       * AdditionalControlPlaneIngressRules is an optional set of ingress rules to add to the control plane
       */
      additionalControlPlaneIngressRules?: {
        /**
         * List of CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        cidrBlocks?: string[];
        /**
         * Description provides extended information about the ingress rule.
         */
        description: string;
        /**
         * FromPort is the start of port range.
         */
        fromPort: number;
        /**
         * List of IPv6 CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        ipv6CidrBlocks?: string[];
        /**
         * NatGatewaysIPsSource use the NAT gateways IPs as the source for the ingress rule.
         */
        natGatewaysIPsSource?: boolean;
        /**
         * Protocol is the protocol for the ingress rule. Accepted values are "-1" (all), "4" (IP in IP),"tcp", "udp", "icmp", and "58" (ICMPv6), "50" (ESP).
         */
        protocol: '-1' | '4' | 'tcp' | 'udp' | 'icmp' | '58' | '50';
        /**
         * The security group id to allow access from. Cannot be specified with CidrBlocks.
         */
        sourceSecurityGroupIds?: string[];
        /**
         * The security group role to allow access from. Cannot be specified with CidrBlocks.
         * The field will be combined with source security group IDs if specified.
         */
        sourceSecurityGroupRoles?: (
          | 'bastion'
          | 'node'
          | 'controlplane'
          | 'apiserver-lb'
          | 'lb'
          | 'node-eks-additional'
        )[];
        /**
         * ToPort is the end of port range.
         */
        toPort: number;
      }[];
      /**
       * CNI configuration
       */
      cni?: {
        /**
         * CNIIngressRules specify rules to apply to control plane and worker node security groups.
         * The source for the rule will be set to control plane and worker security group IDs.
         */
        cniIngressRules?: {
          description: string;
          fromPort: number;
          /**
           * SecurityGroupProtocol defines the protocol type for a security group rule.
           */
          protocol: string;
          toPort: number;
        }[];
      };
      /**
       * SecurityGroupOverrides is an optional set of security groups to use for cluster instances
       * This is optional - if not provided new security groups will be created for the cluster
       */
      securityGroupOverrides?: {
        [k: string]: string;
      };
      /**
       * Subnets configuration.
       */
      subnets?: {
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
         * If you're bringing your subnet, set the AWS subnet-id here, it must start with `subnet-`.
         *
         *
         * When the VPC is managed by CAPA, and you'd like the provider to create a subnet for you,
         * the id can be set to any placeholder value that does not start with `subnet-`;
         * upon creation, the subnet AWS identifier will be populated in the `ResourceID` field and
         * the `id` field is going to be used as the subnet name. If you specify a tag
         * called `Name`, it takes precedence.
         */
        id: string;
        /**
         * IPv6CidrBlock is the IPv6 CIDR block to be used when the provider creates a managed VPC.
         * A subnet can have an IPv4 and an IPv6 address.
         * IPv6 is only supported in managed clusters, this field cannot be set on AWSCluster object.
         */
        ipv6CidrBlock?: string;
        /**
         * IsIPv6 defines the subnet as an IPv6 subnet. A subnet is IPv6 when it is associated with a VPC that has IPv6 enabled.
         * IPv6 is only supported in managed clusters, this field cannot be set on AWSCluster object.
         */
        isIpv6?: boolean;
        /**
         * IsPublic defines the subnet as a public subnet. A subnet is public when it is associated with a route table that has a route to an internet gateway.
         */
        isPublic?: boolean;
        /**
         * NatGatewayID is the NAT gateway id associated with the subnet.
         * Ignored unless the subnet is managed by the provider, in which case this is set on the public subnet where the NAT gateway resides. It is then used to determine routes for private subnets in the same AZ as the public subnet.
         */
        natGatewayId?: string;
        /**
         * ParentZoneName is the zone name where the current subnet's zone is tied when
         * the zone is a Local Zone.
         *
         *
         * The subnets in Local Zone or Wavelength Zone locations consume the ParentZoneName
         * to select the correct private route table to egress traffic to the internet.
         */
        parentZoneName?: string;
        /**
         * ResourceID is the subnet identifier from AWS, READ ONLY.
         * This field is populated when the provider manages the subnet.
         */
        resourceID?: string;
        /**
         * RouteTableID is the routing table id associated with the subnet.
         */
        routeTableId?: string;
        /**
         * Tags is a collection of tags describing the resource.
         */
        tags?: {
          [k: string]: string;
        };
        /**
         * ZoneType defines the type of the zone where the subnet is created.
         *
         *
         * The valid values are availability-zone, local-zone, and wavelength-zone.
         *
         *
         * Subnet with zone type availability-zone (regular) is always selected to create cluster
         * resources, like Load Balancers, NAT Gateways, Contol Plane nodes, etc.
         *
         *
         * Subnet with zone type local-zone or wavelength-zone is not eligible to automatically create
         * regular cluster resources.
         *
         *
         * The public subnet in availability-zone or local-zone is associated with regular public
         * route table with default route entry to a Internet Gateway.
         *
         *
         * The public subnet in wavelength-zone is associated with a carrier public
         * route table with default route entry to a Carrier Gateway.
         *
         *
         * The private subnet in the availability-zone is associated with a private route table with
         * the default route entry to a NAT Gateway created in that zone.
         *
         *
         * The private subnet in the local-zone or wavelength-zone is associated with a private route table with
         * the default route entry re-using the NAT Gateway in the Region (preferred from the
         * parent zone, the zone type availability-zone in the region, or first table available).
         */
        zoneType?: 'availability-zone' | 'local-zone' | 'wavelength-zone';
      }[];
      /**
       * VPC configuration.
       */
      vpc?: {
        /**
         * AvailabilityZoneSelection specifies how AZs should be selected if there are more AZs
         * in a region than specified by AvailabilityZoneUsageLimit. There are 2 selection schemes:
         * Ordered - selects based on alphabetical order
         * Random - selects AZs randomly in a region
         * Defaults to Ordered
         */
        availabilityZoneSelection?: 'Ordered' | 'Random';
        /**
         * AvailabilityZoneUsageLimit specifies the maximum number of availability zones (AZ) that
         * should be used in a region when automatically creating subnets. If a region has more
         * than this number of AZs then this number of AZs will be picked randomly when creating
         * default subnets. Defaults to 3
         */
        availabilityZoneUsageLimit?: number;
        /**
         * CarrierGatewayID is the id of the internet gateway associated with the VPC,
         * for carrier network (Wavelength Zones).
         */
        carrierGatewayId?: string;
        /**
         * CidrBlock is the CIDR block to be used when the provider creates a managed VPC.
         * Defaults to 10.0.0.0/16.
         * Mutually exclusive with IPAMPool.
         */
        cidrBlock?: string;
        /**
         * ElasticIPPool contains specific configuration to allocate Public IPv4 address (Elastic IP) from user-defined pool
         * brought to AWS for core infrastructure resources, like NAT Gateways and Public Network Load Balancers for
         * the API Server.
         */
        elasticIpPool?: {
          /**
           * PublicIpv4Pool sets a custom Public IPv4 Pool used to create Elastic IP address for resources
           * created in public IPv4 subnets. Every IPv4 address, Elastic IP, will be allocated from the custom
           * Public IPv4 pool that you brought to AWS, instead of Amazon-provided pool. The public IPv4 pool
           * resource ID starts with 'ipv4pool-ec2'.
           */
          publicIpv4Pool?: string;
          /**
           * PublicIpv4PoolFallBackOrder defines the fallback action when the Public IPv4 Pool has been exhausted,
           * no more IPv4 address available in the pool.
           *
           *
           * When set to 'amazon-pool', the controller check if the pool has available IPv4 address, when pool has reached the
           * IPv4 limit, the address will be claimed from Amazon-pool (default).
           *
           *
           * When set to 'none', the controller will fail the Elastic IP allocation when the publicIpv4Pool is exhausted.
           */
          publicIpv4PoolFallbackOrder?: 'amazon-pool' | 'none';
        };
        /**
         * EmptyRoutesDefaultVPCSecurityGroup specifies whether the default VPC security group ingress
         * and egress rules should be removed.
         *
         *
         * By default, when creating a VPC, AWS creates a security group called `default` with ingress and egress
         * rules that allow traffic from anywhere. The group could be used as a potential surface attack and
         * it's generally suggested that the group rules are removed or modified appropriately.
         *
         *
         * NOTE: This only applies when the VPC is managed by the Cluster API AWS controller.
         */
        emptyRoutesDefaultVPCSecurityGroup?: boolean;
        /**
         * ID is the vpc-id of the VPC this provider should use to create resources.
         */
        id?: string;
        /**
         * InternetGatewayID is the id of the internet gateway associated with the VPC.
         */
        internetGatewayId?: string;
        /**
         * IPAMPool defines the IPAMv4 pool to be used for VPC.
         * Mutually exclusive with CidrBlock.
         */
        ipamPool?: {
          /**
           * ID is the ID of the IPAM pool this provider should use to create VPC.
           */
          id?: string;
          /**
           * Name is the name of the IPAM pool this provider should use to create VPC.
           */
          name?: string;
          /**
           * The netmask length of the IPv4 CIDR you want to allocate to VPC from
           * an Amazon VPC IP Address Manager (IPAM) pool.
           * Defaults to /16 for IPv4 if not specified.
           */
          netmaskLength?: number;
        };
        /**
         * IPv6 contains ipv6 specific settings for the network. Supported only in managed clusters.
         * This field cannot be set on AWSCluster object.
         */
        ipv6?: {
          /**
           * CidrBlock is the CIDR block provided by Amazon when VPC has enabled IPv6.
           * Mutually exclusive with IPAMPool.
           */
          cidrBlock?: string;
          /**
           * EgressOnlyInternetGatewayID is the id of the egress only internet gateway associated with an IPv6 enabled VPC.
           */
          egressOnlyInternetGatewayId?: string;
          /**
           * IPAMPool defines the IPAMv6 pool to be used for VPC.
           * Mutually exclusive with CidrBlock.
           */
          ipamPool?: {
            /**
             * ID is the ID of the IPAM pool this provider should use to create VPC.
             */
            id?: string;
            /**
             * Name is the name of the IPAM pool this provider should use to create VPC.
             */
            name?: string;
            /**
             * The netmask length of the IPv4 CIDR you want to allocate to VPC from
             * an Amazon VPC IP Address Manager (IPAM) pool.
             * Defaults to /16 for IPv4 if not specified.
             */
            netmaskLength?: number;
          };
          /**
           * PoolID is the IP pool which must be defined in case of BYO IP is defined.
           * Must be specified if CidrBlock is set.
           * Mutually exclusive with IPAMPool.
           */
          poolId?: string;
        };
        /**
         * PrivateDNSHostnameTypeOnLaunch is the type of hostname to assign to instances in the subnet at launch.
         * For IPv4-only and dual-stack (IPv4 and IPv6) subnets, an instance DNS name can be based on the instance IPv4 address (ip-name)
         * or the instance ID (resource-name). For IPv6 only subnets, an instance DNS name must be based on the instance ID (resource-name).
         */
        privateDnsHostnameTypeOnLaunch?: 'ip-name' | 'resource-name';
        /**
         * SecondaryCidrBlocks are additional CIDR blocks to be associated when the provider creates a managed VPC.
         * Defaults to none. Mutually exclusive with IPAMPool. This makes sense to use if, for example, you want to use
         * a separate IP range for pods (e.g. Cilium ENI mode).
         */
        secondaryCidrBlocks?: {
          /**
           * IPv4CidrBlock is the IPv4 CIDR block to associate with the managed VPC.
           */
          ipv4CidrBlock: string;
        }[];
        /**
         * SubnetSchema specifies how CidrBlock should be divided on subnets in the VPC depending on the number of AZs.
         * PreferPrivate - one private subnet for each AZ plus one other subnet that will be further sub-divided for the public subnets.
         * PreferPublic - have the reverse logic of PreferPrivate, one public subnet for each AZ plus one other subnet
         * that will be further sub-divided for the private subnets.
         * Defaults to PreferPrivate
         */
        subnetSchema?: 'PreferPrivate' | 'PreferPublic';
        /**
         * Tags is a collection of tags describing the resource.
         */
        tags?: {
          [k: string]: string;
        };
      };
    };
    /**
     * Partition is the AWS security partition being used. Defaults to "aws"
     */
    partition?: string;
    /**
     * The AWS Region the cluster lives in.
     */
    region?: string;
    /**
     * S3Bucket contains options to configure a supporting S3 bucket for this
     * cluster - currently used for nodes requiring Ignition
     * (https://coreos.github.io/ignition/) for bootstrapping (requires
     * BootstrapFormatIgnition feature flag to be enabled).
     */
    s3Bucket?: {
      /**
       * BestEffortDeleteObjects defines whether access/permission errors during object deletion should be ignored.
       */
      bestEffortDeleteObjects?: boolean;
      /**
       * ControlPlaneIAMInstanceProfile is a name of the IAMInstanceProfile, which will be allowed
       * to read control-plane node bootstrap data from S3 Bucket.
       */
      controlPlaneIAMInstanceProfile?: string;
      /**
       * Name defines name of S3 Bucket to be created.
       */
      name: string;
      /**
       * NodesIAMInstanceProfiles is a list of IAM instance profiles, which will be allowed to read
       * worker nodes bootstrap data from S3 Bucket.
       */
      nodesIAMInstanceProfiles?: string[];
      /**
       * PresignedURLDuration defines the duration for which presigned URLs are valid.
       *
       *
       * This is used to generate presigned URLs for S3 Bucket objects, which are used by
       * control-plane and worker nodes to fetch bootstrap data.
       *
       *
       * When enabled, the IAM instance profiles specified are not used.
       */
      presignedURLDuration?: string;
    };
    /**
     * SecondaryControlPlaneLoadBalancer is an additional load balancer that can be used for the control plane.
     *
     *
     * An example use case is to have a separate internal load balancer for internal traffic,
     * and a separate external load balancer for external traffic.
     */
    secondaryControlPlaneLoadBalancer?: {
      /**
       * AdditionalListeners sets the additional listeners for the control plane load balancer.
       * This is only applicable to Network Load Balancer (NLB) types for the time being.
       */
      additionalListeners?: {
        /**
         * HealthCheck sets the optional custom health check configuration to the API target group.
         */
        healthCheck?: {
          /**
           * The approximate amount of time, in seconds, between health checks of an individual
           * target.
           */
          intervalSeconds?: number;
          /**
           * The destination for health checks on the targets when using the protocol HTTP or HTTPS,
           * otherwise the path will be ignored.
           */
          path?: string;
          /**
           * The port the load balancer uses when performing health checks for additional target groups. When
           * not specified this value will be set for the same of listener port.
           */
          port?: string;
          /**
           * The protocol to use to health check connect with the target. When not specified the Protocol
           * will be the same of the listener.
           */
          protocol?: 'TCP' | 'HTTP' | 'HTTPS';
          /**
           * The number of consecutive health check successes required before considering
           * a target healthy.
           */
          thresholdCount?: number;
          /**
           * The amount of time, in seconds, during which no response from a target means
           * a failed health check.
           */
          timeoutSeconds?: number;
          /**
           * The number of consecutive health check failures required before considering
           * a target unhealthy.
           */
          unhealthyThresholdCount?: number;
        };
        /**
         * Port sets the port for the additional listener.
         */
        port: number;
        /**
         * Protocol sets the protocol for the additional listener.
         * Currently only TCP is supported.
         */
        protocol?: 'TCP';
      }[];
      /**
       * AdditionalSecurityGroups sets the security groups used by the load balancer. Expected to be security group IDs
       * This is optional - if not provided new security groups will be created for the load balancer
       */
      additionalSecurityGroups?: string[];
      /**
       * CrossZoneLoadBalancing enables the classic ELB cross availability zone balancing.
       *
       *
       * With cross-zone load balancing, each load balancer node for your Classic Load Balancer
       * distributes requests evenly across the registered instances in all enabled Availability Zones.
       * If cross-zone load balancing is disabled, each load balancer node distributes requests evenly across
       * the registered instances in its Availability Zone only.
       *
       *
       * Defaults to false.
       */
      crossZoneLoadBalancing?: boolean;
      /**
       * DisableHostsRewrite disabled the hair pinning issue solution that adds the NLB's address as 127.0.0.1 to the hosts
       * file of each instance. This is by default, false.
       */
      disableHostsRewrite?: boolean;
      /**
       * HealthCheck sets custom health check configuration to the API target group.
       */
      healthCheck?: {
        /**
         * The approximate amount of time, in seconds, between health checks of an individual
         * target.
         */
        intervalSeconds?: number;
        /**
         * The number of consecutive health check successes required before considering
         * a target healthy.
         */
        thresholdCount?: number;
        /**
         * The amount of time, in seconds, during which no response from a target means
         * a failed health check.
         */
        timeoutSeconds?: number;
        /**
         * The number of consecutive health check failures required before considering
         * a target unhealthy.
         */
        unhealthyThresholdCount?: number;
      };
      /**
       * HealthCheckProtocol sets the protocol type for ELB health check target
       * default value is ELBProtocolSSL
       */
      healthCheckProtocol?: 'TCP' | 'SSL' | 'HTTP' | 'HTTPS' | 'TLS' | 'UDP';
      /**
       * IngressRules sets the ingress rules for the control plane load balancer.
       */
      ingressRules?: {
        /**
         * List of CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        cidrBlocks?: string[];
        /**
         * Description provides extended information about the ingress rule.
         */
        description: string;
        /**
         * FromPort is the start of port range.
         */
        fromPort: number;
        /**
         * List of IPv6 CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        ipv6CidrBlocks?: string[];
        /**
         * NatGatewaysIPsSource use the NAT gateways IPs as the source for the ingress rule.
         */
        natGatewaysIPsSource?: boolean;
        /**
         * Protocol is the protocol for the ingress rule. Accepted values are "-1" (all), "4" (IP in IP),"tcp", "udp", "icmp", and "58" (ICMPv6), "50" (ESP).
         */
        protocol: '-1' | '4' | 'tcp' | 'udp' | 'icmp' | '58' | '50';
        /**
         * The security group id to allow access from. Cannot be specified with CidrBlocks.
         */
        sourceSecurityGroupIds?: string[];
        /**
         * The security group role to allow access from. Cannot be specified with CidrBlocks.
         * The field will be combined with source security group IDs if specified.
         */
        sourceSecurityGroupRoles?: (
          | 'bastion'
          | 'node'
          | 'controlplane'
          | 'apiserver-lb'
          | 'lb'
          | 'node-eks-additional'
        )[];
        /**
         * ToPort is the end of port range.
         */
        toPort: number;
      }[];
      /**
       * LoadBalancerType sets the type for a load balancer. The default type is classic.
       */
      loadBalancerType?: 'classic' | 'elb' | 'alb' | 'nlb' | 'disabled';
      /**
       * Name sets the name of the classic ELB load balancer. As per AWS, the name must be unique
       * within your set of load balancers for the region, must have a maximum of 32 characters, must
       * contain only alphanumeric characters or hyphens, and cannot begin or end with a hyphen. Once
       * set, the value cannot be changed.
       */
      name?: string;
      /**
       * PreserveClientIP lets the user control if preservation of client ips must be retained or not.
       * If this is enabled 6443 will be opened to 0.0.0.0/0.
       */
      preserveClientIP?: boolean;
      /**
       * Scheme sets the scheme of the load balancer (defaults to internet-facing)
       */
      scheme?: 'internet-facing' | 'internal';
      /**
       * Subnets sets the subnets that should be applied to the control plane load balancer (defaults to discovered subnets for managed VPCs or an empty set for unmanaged VPCs)
       */
      subnets?: string[];
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
      addresses?: {
        /**
         * The machine address.
         */
        address: string;
        /**
         * Machine address type, one of Hostname, ExternalIP, InternalIP, ExternalDNS or InternalDNS.
         */
        type: string;
      }[];
      /**
       * Availability zone of instance
       */
      availabilityZone?: string;
      /**
       * CapacityReservationID specifies the target Capacity Reservation into which the instance should be launched.
       */
      capacityReservationId?: string;
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
       * InstanceMetadataOptions is the metadata options for the EC2 instance.
       */
      instanceMetadataOptions?: {
        /**
         * Enables or disables the HTTP metadata endpoint on your instances.
         *
         *
         * If you specify a value of disabled, you cannot access your instance metadata.
         *
         *
         * Default: enabled
         */
        httpEndpoint?: 'enabled' | 'disabled';
        /**
         * The desired HTTP PUT response hop limit for instance metadata requests. The
         * larger the number, the further instance metadata requests can travel.
         *
         *
         * Default: 1
         */
        httpPutResponseHopLimit?: number;
        /**
         * The state of token usage for your instance metadata requests.
         *
         *
         * If the state is optional, you can choose to retrieve instance metadata with
         * or without a session token on your request. If you retrieve the IAM role
         * credentials without a token, the version 1.0 role credentials are returned.
         * If you retrieve the IAM role credentials using a valid session token, the
         * version 2.0 role credentials are returned.
         *
         *
         * If the state is required, you must send a session token with any instance
         * metadata retrieval requests. In this state, retrieving the IAM role credentials
         * always returns the version 2.0 credentials; the version 1.0 credentials are
         * not available.
         *
         *
         * Default: optional
         */
        httpTokens?: 'optional' | 'required';
        /**
         * Set to enabled to allow access to instance tags from the instance metadata.
         * Set to disabled to turn off access to instance tags from the instance metadata.
         * For more information, see Work with instance tags using the instance metadata
         * (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Tags.html#work-with-tags-in-IMDS).
         *
         *
         * Default: disabled
         */
        instanceMetadataTags?: 'enabled' | 'disabled';
      };
      /**
       * The current state of the instance.
       */
      instanceState?: string;
      /**
       * Specifies ENIs attached to instance
       */
      networkInterfaces?: string[];
      /**
       * Configuration options for the non root storage volumes.
       */
      nonRootVolumes?: {
        /**
         * Device name
         */
        deviceName?: string;
        /**
         * Encrypted is whether the volume should be encrypted or not.
         */
        encrypted?: boolean;
        /**
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
      }[];
      /**
       * PlacementGroupName specifies the name of the placement group in which to launch the instance.
       */
      placementGroupName?: string;
      /**
       * PlacementGroupPartition is the partition number within the placement group in which to launch the instance.
       * This value is only valid if the placement group, referred in `PlacementGroupName`, was created with
       * strategy set to partition.
       */
      placementGroupPartition?: number;
      /**
       * PrivateDNSName is the options for the instance hostname.
       */
      privateDnsName?: {
        /**
         * EnableResourceNameDNSAAAARecord indicates whether to respond to DNS queries for instance hostnames with DNS AAAA records.
         */
        enableResourceNameDnsAAAARecord?: boolean;
        /**
         * EnableResourceNameDNSARecord indicates whether to respond to DNS queries for instance hostnames with DNS A records.
         */
        enableResourceNameDnsARecord?: boolean;
        /**
         * The type of hostname to assign to an instance.
         */
        hostnameType?: 'ip-name' | 'resource-name';
      };
      /**
       * The private IPv4 address assigned to the instance.
       */
      privateIp?: string;
      /**
       * PublicIPOnLaunch is the option to associate a public IP on instance launch
       */
      publicIPOnLaunch?: boolean;
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
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
      securityGroupIds?: string[];
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
        [k: string]: string;
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
       * UserData is the raw data script passed to the instance which is run upon bootstrap.
       * This field must not be base64 encoded and should only be used when running a new instance.
       */
      userData?: string;
      /**
       * IDs of the instance's volumes
       */
      volumeIDs?: string[];
    };
    /**
     * Conditions provide observations of the operational state of a Cluster API resource.
     */
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another.
       * This should be when the underlying condition changed. If that is not known, then using the time when
       * the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition.
       * This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase.
       * The specific API may choose whether or not this field is considered a guaranteed API.
       * This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately
       * understand the current situation and act accordingly.
       * The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase.
       * Many .condition.type values are consistent across resources like Available, but because arbitrary conditions
       * can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
    /**
     * FailureDomains is a slice of FailureDomains.
     */
    failureDomains?: {
      /**
       * FailureDomainSpec is the Schema for Cluster API failure domains.
       * It allows controllers to understand how many failure domains a cluster can optionally span across.
       */
      [k: string]: {
        /**
         * Attributes is a free form map of attributes an infrastructure provider might use or require.
         */
        attributes?: {
          [k: string]: string;
        };
        /**
         * ControlPlane determines if this failure domain is suitable for use by control plane machines.
         */
        controlPlane?: boolean;
      };
    };
    /**
     * NetworkStatus encapsulates AWS networking resources.
     */
    networkStatus?: {
      /**
       * APIServerELB is the Kubernetes api server load balancer.
       */
      apiServerElb?: {
        /**
         * ARN of the load balancer. Unlike the ClassicLB, ARN is used mostly
         * to define and get it.
         */
        arn?: string;
        /**
         * ClassicElbAttributes defines extra attributes associated with the load balancer.
         */
        attributes?: {
          /**
           * CrossZoneLoadBalancing enables the classic load balancer load balancing.
           */
          crossZoneLoadBalancing?: boolean;
          /**
           * IdleTimeout is time that the connection is allowed to be idle (no data
           * has been sent over the connection) before it is closed by the load balancer.
           */
          idleTimeout?: number;
        };
        /**
         * AvailabilityZones is an array of availability zones in the VPC attached to the load balancer.
         */
        availabilityZones?: string[];
        /**
         * DNSName is the dns name of the load balancer.
         */
        dnsName?: string;
        /**
         * ELBAttributes defines extra attributes associated with v2 load balancers.
         */
        elbAttributes?: {
          [k: string]: string;
        };
        /**
         * ELBListeners is an array of listeners associated with the load balancer. There must be at least one.
         */
        elbListeners?: {
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
          /**
           * TargetGroupSpec specifies target group settings for a given listener.
           * This is created first, and the ARN is then passed to the listener.
           */
          targetGroup: {
            /**
             * Name of the TargetGroup. Must be unique over the same group of listeners.
             */
            name: string;
            /**
             * Port is the exposed port
             */
            port: number;
            /**
             * ELBProtocol defines listener protocols for a load balancer.
             */
            protocol: 'tcp' | 'tls' | 'udp' | 'TCP' | 'TLS' | 'UDP';
            /**
             * HealthCheck is the elb health check associated with the load balancer.
             */
            targetGroupHealthCheck?: {
              intervalSeconds?: number;
              path?: string;
              port?: string;
              protocol?: string;
              thresholdCount?: number;
              timeoutSeconds?: number;
              unhealthyThresholdCount?: number;
            };
            vpcId: string;
          };
        }[];
        /**
         * HealthCheck is the classic elb health check associated with the load balancer.
         */
        healthChecks?: {
          healthyThreshold: number;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          interval: number;
          target: string;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          timeout: number;
          unhealthyThreshold: number;
        };
        /**
         * ClassicELBListeners is an array of classic elb listeners associated with the load balancer. There must be at least one.
         */
        listeners?: {
          instancePort: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          instanceProtocol: string;
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
        }[];
        /**
         * LoadBalancerType sets the type for a load balancer. The default type is classic.
         */
        loadBalancerType?: 'classic' | 'elb' | 'alb' | 'nlb';
        /**
         * The name of the load balancer. It must be unique within the set of load balancers
         * defined in the region. It also serves as identifier.
         */
        name?: string;
        /**
         * Scheme is the load balancer scheme, either internet-facing or private.
         */
        scheme?: string;
        /**
         * SecurityGroupIDs is an array of security groups assigned to the load balancer.
         */
        securityGroupIds?: string[];
        /**
         * SubnetIDs is an array of subnets in the VPC attached to the load balancer.
         */
        subnetIds?: string[];
        /**
         * Tags is a map of tags associated with the load balancer.
         */
        tags?: {
          [k: string]: string;
        };
      };
      /**
       * NatGatewaysIPs contains the public IPs of the NAT Gateways
       */
      natGatewaysIPs?: string[];
      /**
       * SecondaryAPIServerELB is the secondary Kubernetes api server load balancer.
       */
      secondaryAPIServerELB?: {
        /**
         * ARN of the load balancer. Unlike the ClassicLB, ARN is used mostly
         * to define and get it.
         */
        arn?: string;
        /**
         * ClassicElbAttributes defines extra attributes associated with the load balancer.
         */
        attributes?: {
          /**
           * CrossZoneLoadBalancing enables the classic load balancer load balancing.
           */
          crossZoneLoadBalancing?: boolean;
          /**
           * IdleTimeout is time that the connection is allowed to be idle (no data
           * has been sent over the connection) before it is closed by the load balancer.
           */
          idleTimeout?: number;
        };
        /**
         * AvailabilityZones is an array of availability zones in the VPC attached to the load balancer.
         */
        availabilityZones?: string[];
        /**
         * DNSName is the dns name of the load balancer.
         */
        dnsName?: string;
        /**
         * ELBAttributes defines extra attributes associated with v2 load balancers.
         */
        elbAttributes?: {
          [k: string]: string;
        };
        /**
         * ELBListeners is an array of listeners associated with the load balancer. There must be at least one.
         */
        elbListeners?: {
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
          /**
           * TargetGroupSpec specifies target group settings for a given listener.
           * This is created first, and the ARN is then passed to the listener.
           */
          targetGroup: {
            /**
             * Name of the TargetGroup. Must be unique over the same group of listeners.
             */
            name: string;
            /**
             * Port is the exposed port
             */
            port: number;
            /**
             * ELBProtocol defines listener protocols for a load balancer.
             */
            protocol: 'tcp' | 'tls' | 'udp' | 'TCP' | 'TLS' | 'UDP';
            /**
             * HealthCheck is the elb health check associated with the load balancer.
             */
            targetGroupHealthCheck?: {
              intervalSeconds?: number;
              path?: string;
              port?: string;
              protocol?: string;
              thresholdCount?: number;
              timeoutSeconds?: number;
              unhealthyThresholdCount?: number;
            };
            vpcId: string;
          };
        }[];
        /**
         * HealthCheck is the classic elb health check associated with the load balancer.
         */
        healthChecks?: {
          healthyThreshold: number;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          interval: number;
          target: string;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          timeout: number;
          unhealthyThreshold: number;
        };
        /**
         * ClassicELBListeners is an array of classic elb listeners associated with the load balancer. There must be at least one.
         */
        listeners?: {
          instancePort: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          instanceProtocol: string;
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
        }[];
        /**
         * LoadBalancerType sets the type for a load balancer. The default type is classic.
         */
        loadBalancerType?: 'classic' | 'elb' | 'alb' | 'nlb';
        /**
         * The name of the load balancer. It must be unique within the set of load balancers
         * defined in the region. It also serves as identifier.
         */
        name?: string;
        /**
         * Scheme is the load balancer scheme, either internet-facing or private.
         */
        scheme?: string;
        /**
         * SecurityGroupIDs is an array of security groups assigned to the load balancer.
         */
        securityGroupIds?: string[];
        /**
         * SubnetIDs is an array of subnets in the VPC attached to the load balancer.
         */
        subnetIds?: string[];
        /**
         * Tags is a map of tags associated with the load balancer.
         */
        tags?: {
          [k: string]: string;
        };
      };
      /**
       * SecurityGroups is a map from the role/kind of the security group to its unique name, if any.
       */
      securityGroups?: {
        /**
         * SecurityGroup defines an AWS security group.
         */
        [k: string]: {
          /**
           * ID is a unique identifier.
           */
          id: string;
          /**
           * IngressRules is the inbound rules associated with the security group.
           */
          ingressRule?: {
            /**
             * List of CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
             */
            cidrBlocks?: string[];
            /**
             * Description provides extended information about the ingress rule.
             */
            description: string;
            /**
             * FromPort is the start of port range.
             */
            fromPort: number;
            /**
             * List of IPv6 CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
             */
            ipv6CidrBlocks?: string[];
            /**
             * NatGatewaysIPsSource use the NAT gateways IPs as the source for the ingress rule.
             */
            natGatewaysIPsSource?: boolean;
            /**
             * Protocol is the protocol for the ingress rule. Accepted values are "-1" (all), "4" (IP in IP),"tcp", "udp", "icmp", and "58" (ICMPv6), "50" (ESP).
             */
            protocol: '-1' | '4' | 'tcp' | 'udp' | 'icmp' | '58' | '50';
            /**
             * The security group id to allow access from. Cannot be specified with CidrBlocks.
             */
            sourceSecurityGroupIds?: string[];
            /**
             * The security group role to allow access from. Cannot be specified with CidrBlocks.
             * The field will be combined with source security group IDs if specified.
             */
            sourceSecurityGroupRoles?: (
              | 'bastion'
              | 'node'
              | 'controlplane'
              | 'apiserver-lb'
              | 'lb'
              | 'node-eks-additional'
            )[];
            /**
             * ToPort is the end of port range.
             */
            toPort: number;
          }[];
          /**
           * Name is the security group name.
           */
          name: string;
          /**
           * Tags is a map of tags associated with the security group.
           */
          tags?: {
            [k: string]: string;
          };
        };
      };
    };
    ready: boolean;
  };
}

export const AWSClusterList = 'AWSClusterList';

export interface IAWSClusterList extends metav1.IList<IAWSCluster> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  kind: typeof AWSClusterList;
}

export const AWSMachinePool = 'AWSMachinePool';

/**
 * AWSMachinePool is the Schema for the awsmachinepools API.
 */
export interface IAWSMachinePool {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSMachinePool;
  metadata: metav1.IObjectMeta;
  /**
   * AWSMachinePoolSpec defines the desired state of AWSMachinePool.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the
     * AWS provider.
     */
    additionalTags?: {
      [k: string]: string;
    };
    /**
     * AvailabilityZoneSubnetType specifies which type of subnets to use when an availability zone is specified.
     */
    availabilityZoneSubnetType?: 'public' | 'private' | 'all';
    /**
     * AvailabilityZones is an array of availability zones instances can run in
     */
    availabilityZones?: string[];
    /**
     * AWSLaunchTemplate specifies the launch template and version to use when an instance is launched.
     */
    awsLaunchTemplate: {
      /**
       * AdditionalSecurityGroups is an array of references to security groups that should be applied to the
       * instances. These security groups would be set in addition to any security groups defined
       * at the cluster level or in the actuator.
       */
      additionalSecurityGroups?: {
        /**
         * Filters is a set of key/value pairs used to identify a resource
         * They are applied according to the rules defined by the AWS API:
         * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
         */
        filters?: {
          /**
           * Name of the filter. Filter names are case-sensitive.
           */
          name: string;
          /**
           * Values includes one or more filter values. Filter values are case-sensitive.
           */
          values: string[];
        }[];
        /**
         * ID of resource
         */
        id?: string;
      }[];
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
       * The name or the Amazon Resource Name (ARN) of the instance profile associated
       * with the IAM role for the instance. The instance profile contains the IAM
       * role.
       */
      iamInstanceProfile?: string;
      /**
       * ImageLookupBaseOS is the name of the base operating system to use for
       * image lookup the AMI is not set.
       */
      imageLookupBaseOS?: string;
      /**
       * ImageLookupFormat is the AMI naming format to look up the image for this
       * machine It will be ignored if an explicit AMI is set. Supports
       * substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base OS and
       * kubernetes version, respectively. The BaseOS will be the value in
       * ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as
       * defined by the packages produced by kubernetes/release without v as a
       * prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default
       * image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-* will end up
       * searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-* for a
       * Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See
       * also: https://golang.org/pkg/text/template/
       */
      imageLookupFormat?: string;
      /**
       * ImageLookupOrg is the AWS Organization ID to use for image lookup if AMI is not set.
       */
      imageLookupOrg?: string;
      /**
       * InstanceMetadataOptions defines the behavior for applying metadata to instances.
       */
      instanceMetadataOptions?: {
        /**
         * Enables or disables the HTTP metadata endpoint on your instances.
         *
         *
         * If you specify a value of disabled, you cannot access your instance metadata.
         *
         *
         * Default: enabled
         */
        httpEndpoint?: 'enabled' | 'disabled';
        /**
         * The desired HTTP PUT response hop limit for instance metadata requests. The
         * larger the number, the further instance metadata requests can travel.
         *
         *
         * Default: 1
         */
        httpPutResponseHopLimit?: number;
        /**
         * The state of token usage for your instance metadata requests.
         *
         *
         * If the state is optional, you can choose to retrieve instance metadata with
         * or without a session token on your request. If you retrieve the IAM role
         * credentials without a token, the version 1.0 role credentials are returned.
         * If you retrieve the IAM role credentials using a valid session token, the
         * version 2.0 role credentials are returned.
         *
         *
         * If the state is required, you must send a session token with any instance
         * metadata retrieval requests. In this state, retrieving the IAM role credentials
         * always returns the version 2.0 credentials; the version 1.0 credentials are
         * not available.
         *
         *
         * Default: optional
         */
        httpTokens?: 'optional' | 'required';
        /**
         * Set to enabled to allow access to instance tags from the instance metadata.
         * Set to disabled to turn off access to instance tags from the instance metadata.
         * For more information, see Work with instance tags using the instance metadata
         * (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Tags.html#work-with-tags-in-IMDS).
         *
         *
         * Default: disabled
         */
        instanceMetadataTags?: 'enabled' | 'disabled';
      };
      /**
       * InstanceType is the type of instance to create. Example: m4.xlarge
       */
      instanceType?: string;
      /**
       * The name of the launch template.
       */
      name?: string;
      /**
       * Configuration options for the non root storage volumes.
       */
      nonRootVolumes?: {
        /**
         * Device name
         */
        deviceName?: string;
        /**
         * Encrypted is whether the volume should be encrypted or not.
         */
        encrypted?: boolean;
        /**
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
      }[];
      /**
       * PrivateDNSName is the options for the instance hostname.
       */
      privateDnsName?: {
        /**
         * EnableResourceNameDNSAAAARecord indicates whether to respond to DNS queries for instance hostnames with DNS AAAA records.
         */
        enableResourceNameDnsAAAARecord?: boolean;
        /**
         * EnableResourceNameDNSARecord indicates whether to respond to DNS queries for instance hostnames with DNS A records.
         */
        enableResourceNameDnsARecord?: boolean;
        /**
         * The type of hostname to assign to an instance.
         */
        hostnameType?: 'ip-name' | 'resource-name';
      };
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
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
       * SpotMarketOptions are options for configuring AWSMachinePool instances to be run using AWS Spot instances.
       */
      spotMarketOptions?: {
        /**
         * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
         */
        maxPrice?: string;
      };
      /**
       * SSHKeyName is the name of the ssh key to attach to the instance. Valid values are empty string
       * (do not use SSH keys), a valid SSH key name, or omitted (use the default SSH key name)
       */
      sshKeyName?: string;
      /**
       * VersionNumber is the version of the launch template that is applied.
       * Typically a new version is created when at least one of the following happens:
       * 1) A new launch template spec is applied.
       * 2) One or more parameters in an existing template is changed.
       * 3) A new AMI is discovered.
       */
      versionNumber?: number;
    };
    /**
     * Enable or disable the capacity rebalance autoscaling group feature
     */
    capacityRebalance?: boolean;
    /**
     * The amount of time, in seconds, after a scaling activity completes before another scaling activity can start.
     * If no value is supplied by user a default value of 300 seconds is set
     */
    defaultCoolDown?: string;
    /**
     * The amount of time, in seconds, until a new instance is considered to
     * have finished initializing and resource consumption to become stable
     * after it enters the InService state.
     * If no value is supplied by user a default value of 300 seconds is set
     */
    defaultInstanceWarmup?: string;
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
        onDemandAllocationStrategy?: 'prioritized' | 'lowest-price';
        onDemandBaseCapacity?: number;
        onDemandPercentageAboveBaseCapacity?: number;
        /**
         * SpotAllocationStrategy indicates how to allocate instances across Spot Instance pools.
         */
        spotAllocationStrategy?:
          | 'lowest-price'
          | 'capacity-optimized'
          | 'capacity-optimized-prioritized'
          | 'price-capacity-optimized';
      };
      overrides?: {
        instanceType: string;
      }[];
    };
    /**
     * ProviderID is the ARN of the associated ASG
     */
    providerID?: string;
    /**
     * ProviderIDList are the identification IDs of machine instances provided by the provider.
     * This field must match the provider IDs as seen on the node objects corresponding to a machine pool's machine instances.
     */
    providerIDList?: string[];
    /**
     * RefreshPreferences describes set of preferences associated with the instance refresh request.
     */
    refreshPreferences?: {
      /**
       * Disable, if true, disables instance refresh from triggering when new launch templates are detected.
       * This is useful in scenarios where ASG nodes are externally managed.
       */
      disable?: boolean;
      /**
       * The number of seconds until a newly launched instance is configured and ready
       * to use. During this time, the next replacement will not be initiated.
       * The default is to use the value for the health check grace period defined for the group.
       */
      instanceWarmup?: number;
      /**
       * The amount of capacity as a percentage in ASG that must remain healthy
       * during an instance refresh. The default is 90.
       */
      minHealthyPercentage?: number;
      /**
       * The strategy to use for the instance refresh. The only valid value is Rolling.
       * A rolling update is an update that is applied to all instances in an Auto
       * Scaling group until all instances have been updated.
       */
      strategy?: string;
    };
    /**
     * Subnets is an array of subnet configurations
     */
    subnets?: {
      /**
       * Filters is a set of key/value pairs used to identify a resource
       * They are applied according to the rules defined by the AWS API:
       * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
       */
      filters?: {
        /**
         * Name of the filter. Filter names are case-sensitive.
         */
        name: string;
        /**
         * Values includes one or more filter values. Filter values are case-sensitive.
         */
        values: string[];
      }[];
      /**
       * ID of resource
       */
      id?: string;
    }[];
    /**
     * SuspendProcesses defines a list of processes to suspend for the given ASG. This is constantly reconciled.
     * If a process is removed from this list it will automatically be resumed.
     */
    suspendProcesses?: {
      all?: boolean;
      /**
       * Processes defines the processes which can be enabled or disabled individually.
       */
      processes?: {
        addToLoadBalancer?: boolean;
        alarmNotification?: boolean;
        azRebalance?: boolean;
        healthCheck?: boolean;
        instanceRefresh?: boolean;
        launch?: boolean;
        replaceUnhealthy?: boolean;
        scheduledActions?: boolean;
        terminate?: boolean;
      };
    };
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
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another.
       * This should be when the underlying condition changed. If that is not known, then using the time when
       * the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition.
       * This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase.
       * The specific API may choose whether or not this field is considered a guaranteed API.
       * This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately
       * understand the current situation and act accordingly.
       * The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase.
       * Many .condition.type values are consistent across resources like Available, but because arbitrary conditions
       * can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
    /**
     * FailureMessage will be set in the event that there is a terminal problem
     * reconciling the Machine and will contain a more verbose string suitable
     * for logging and human consumption.
     *
     *
     * This field should not be set for transitive errors that a controller
     * faces that are expected to be fixed automatically over
     * time (like service outages), but instead indicate that something is
     * fundamentally wrong with the Machine's spec or the configuration of
     * the controller, and that manual intervention is required. Examples
     * of terminal errors would be invalid combinations of settings in the
     * spec, values that are unsupported by the controller, or the
     * responsible controller itself being critically misconfigured.
     *
     *
     * Any transient errors that occur during the reconciliation of Machines
     * can be added as events to the Machine object and/or logged in the
     * controller's output.
     */
    failureMessage?: string;
    /**
     * FailureReason will be set in the event that there is a terminal problem
     * reconciling the Machine and will contain a succinct value suitable
     * for machine interpretation.
     *
     *
     * This field should not be set for transitive errors that a controller
     * faces that are expected to be fixed automatically over
     * time (like service outages), but instead indicate that something is
     * fundamentally wrong with the Machine's spec or the configuration of
     * the controller, and that manual intervention is required. Examples
     * of terminal errors would be invalid combinations of settings in the
     * spec, values that are unsupported by the controller, or the
     * responsible controller itself being critically misconfigured.
     *
     *
     * Any transient errors that occur during the reconciliation of Machines
     * can be added as events to the Machine object and/or logged in the
     * controller's output.
     */
    failureReason?: string;
    /**
     * Instances contains the status for each instance in the pool
     */
    instances?: {
      /**
       * InstanceID is the identification of the Machine Instance within ASG
       */
      instanceID?: string;
      /**
       * Version defines the Kubernetes version for the Machine Instance
       */
      version?: string;
    }[];
    /**
     * The ID of the launch template
     */
    launchTemplateID?: string;
    /**
     * The version of the launch template
     */
    launchTemplateVersion?: string;
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
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  kind: typeof AWSMachinePoolList;
}

export const AWSMachineTemplate = 'AWSMachineTemplate';

/**
 * AWSMachineTemplate is the schema for the Amazon EC2 Machine Templates API.
 */
export interface IAWSMachineTemplate {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
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
       * Standard object's metadata.
       * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata
       */
      metadata?: {
        /**
         * Annotations is an unstructured key value map stored with a resource that may be
         * set by external tools to store and retrieve arbitrary metadata. They are not
         * queryable and should be preserved when modifying objects.
         * More info: http://kubernetes.io/docs/user-guide/annotations
         */
        annotations?: {
          [k: string]: string;
        };
        /**
         * Map of string keys and values that can be used to organize and categorize
         * (scope and select) objects. May match selectors of replication controllers
         * and services.
         * More info: http://kubernetes.io/docs/user-guide/labels
         */
        labels?: {
          [k: string]: string;
        };
      };
      /**
       * Spec is the specification of the desired behavior of the machine.
       */
      spec: {
        /**
         * AdditionalSecurityGroups is an array of references to security groups that should be applied to the
         * instance. These security groups would be set in addition to any security groups defined
         * at the cluster level or in the actuator. It is possible to specify either IDs of Filters. Using Filters
         * will cause additional requests to AWS API and if tags change the attached security groups might change too.
         */
        additionalSecurityGroups?: {
          /**
           * Filters is a set of key/value pairs used to identify a resource
           * They are applied according to the rules defined by the AWS API:
           * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
           */
          filters?: {
            /**
             * Name of the filter. Filter names are case-sensitive.
             */
            name: string;
            /**
             * Values includes one or more filter values. Filter values are case-sensitive.
             */
            values: string[];
          }[];
          /**
           * ID of resource
           */
          id?: string;
        }[];
        /**
         * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the
         * AWS provider. If both the AWSCluster and the AWSMachine specify the same tag name with different values, the
         * AWSMachine's value takes precedence.
         */
        additionalTags?: {
          [k: string]: string;
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
         * CapacityReservationID specifies the target Capacity Reservation into which the instance should be launched.
         */
        capacityReservationId?: string;
        /**
         * CloudInit defines options related to the bootstrapping systems where
         * CloudInit is used.
         */
        cloudInit?: {
          /**
           * InsecureSkipSecretsManager, when set to true will not use AWS Secrets Manager
           * or AWS Systems Manager Parameter Store to ensure privacy of userdata.
           * By default, a cloud-init boothook shell script is prepended to download
           * the userdata from Secrets Manager and additionally delete the secret.
           */
          insecureSkipSecretsManager?: boolean;
          /**
           * SecretCount is the number of secrets used to form the complete secret
           */
          secretCount?: number;
          /**
           * SecretPrefix is the prefix for the secret name. This is stored
           * temporarily, and deleted when the machine registers as a node against
           * the workload cluster.
           */
          secretPrefix?: string;
          /**
           * SecureSecretsBackend, when set to parameter-store will utilize the AWS Systems Manager
           * Parameter Storage to distribute secrets. By default or with the value of secrets-manager,
           * will use AWS Secrets Manager instead.
           */
          secureSecretsBackend?: 'secrets-manager' | 'ssm-parameter-store';
        };
        /**
         * ElasticIPPool is the configuration to allocate Public IPv4 address (Elastic IP/EIP) from user-defined pool.
         */
        elasticIpPool?: {
          /**
           * PublicIpv4Pool sets a custom Public IPv4 Pool used to create Elastic IP address for resources
           * created in public IPv4 subnets. Every IPv4 address, Elastic IP, will be allocated from the custom
           * Public IPv4 pool that you brought to AWS, instead of Amazon-provided pool. The public IPv4 pool
           * resource ID starts with 'ipv4pool-ec2'.
           */
          publicIpv4Pool?: string;
          /**
           * PublicIpv4PoolFallBackOrder defines the fallback action when the Public IPv4 Pool has been exhausted,
           * no more IPv4 address available in the pool.
           *
           *
           * When set to 'amazon-pool', the controller check if the pool has available IPv4 address, when pool has reached the
           * IPv4 limit, the address will be claimed from Amazon-pool (default).
           *
           *
           * When set to 'none', the controller will fail the Elastic IP allocation when the publicIpv4Pool is exhausted.
           */
          publicIpv4PoolFallbackOrder?: 'amazon-pool' | 'none';
        };
        /**
         * IAMInstanceProfile is a name of an IAM instance profile to assign to the instance
         */
        iamInstanceProfile?: string;
        /**
         * Ignition defined options related to the bootstrapping systems where Ignition is used.
         */
        ignition?: {
          /**
           * Proxy defines proxy settings for Ignition.
           * Only valid for Ignition versions 3.1 and above.
           */
          proxy?: {
            /**
             * HTTPProxy is the HTTP proxy to use for Ignition.
             * A single URL that specifies the proxy server to use for HTTP and HTTPS requests,
             * unless overridden by the HTTPSProxy or NoProxy options.
             */
            httpProxy?: string;
            /**
             * HTTPSProxy is the HTTPS proxy to use for Ignition.
             * A single URL that specifies the proxy server to use for HTTPS requests,
             * unless overridden by the NoProxy option.
             */
            httpsProxy?: string;
            /**
             * NoProxy is the list of domains to not proxy for Ignition.
             * Specifies a list of strings to hosts that should be excluded from proxying.
             *
             *
             * Each value is represented by:
             * - An IP address prefix (1.2.3.4)
             * - An IP address prefix in CIDR notation (1.2.3.4/8)
             * - A domain name
             *   - A domain name matches that name and all subdomains
             *   - A domain name with a leading . matches subdomains only
             * - A special DNS label (*), indicates that no proxying should be done
             *
             *
             * An IP address prefix and domain name can also include a literal port number (1.2.3.4:80).
             *
             * @maxItems 64
             */
            noProxy?: string[];
          };
          /**
           * StorageType defines how to store the boostrap user data for Ignition.
           * This can be used to instruct Ignition from where to fetch the user data to bootstrap an instance.
           *
           *
           * When omitted, the storage option will default to ClusterObjectStore.
           *
           *
           * When set to "ClusterObjectStore", if the capability is available and a Cluster ObjectStore configuration
           * is correctly provided in the Cluster object (under .spec.s3Bucket),
           * an object store will be used to store bootstrap user data.
           *
           *
           * When set to "UnencryptedUserData", EC2 Instance User Data will be used to store the machine bootstrap user data, unencrypted.
           * This option is considered less secure than others as user data may contain sensitive informations (keys, certificates, etc.)
           * and users with ec2:DescribeInstances permission or users running pods
           * that can access the ec2 metadata service have access to this sensitive information.
           * So this is only to be used at ones own risk, and only when other more secure options are not viable.
           */
          storageType?: 'ClusterObjectStore' | 'UnencryptedUserData';
          /**
           * TLS defines TLS settings for Ignition.
           * Only valid for Ignition versions 3.1 and above.
           */
          tls?: {
            /**
             * CASources defines the list of certificate authorities to use for Ignition.
             * The value is the certificate bundle (in PEM format). The bundle can contain multiple concatenated certificates.
             * Supported schemes are http, https, tftp, s3, arn, gs, and `data` (RFC 2397) URL scheme.
             *
             * @maxItems 64
             */
            certificateAuthorities?: string[];
          };
          /**
           * Version defines which version of Ignition will be used to generate bootstrap data.
           */
          version?: '2.3' | '3.0' | '3.1' | '3.2' | '3.3' | '3.4';
        };
        /**
         * ImageLookupBaseOS is the name of the base operating system to use for
         * image lookup the AMI is not set.
         */
        imageLookupBaseOS?: string;
        /**
         * ImageLookupFormat is the AMI naming format to look up the image for this
         * machine It will be ignored if an explicit AMI is set. Supports
         * substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base OS and
         * kubernetes version, respectively. The BaseOS will be the value in
         * ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as
         * defined by the packages produced by kubernetes/release without v as a
         * prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default
         * image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-* will end up
         * searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-* for a
         * Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See
         * also: https://golang.org/pkg/text/template/
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
         * InstanceMetadataOptions is the metadata options for the EC2 instance.
         */
        instanceMetadataOptions?: {
          /**
           * Enables or disables the HTTP metadata endpoint on your instances.
           *
           *
           * If you specify a value of disabled, you cannot access your instance metadata.
           *
           *
           * Default: enabled
           */
          httpEndpoint?: 'enabled' | 'disabled';
          /**
           * The desired HTTP PUT response hop limit for instance metadata requests. The
           * larger the number, the further instance metadata requests can travel.
           *
           *
           * Default: 1
           */
          httpPutResponseHopLimit?: number;
          /**
           * The state of token usage for your instance metadata requests.
           *
           *
           * If the state is optional, you can choose to retrieve instance metadata with
           * or without a session token on your request. If you retrieve the IAM role
           * credentials without a token, the version 1.0 role credentials are returned.
           * If you retrieve the IAM role credentials using a valid session token, the
           * version 2.0 role credentials are returned.
           *
           *
           * If the state is required, you must send a session token with any instance
           * metadata retrieval requests. In this state, retrieving the IAM role credentials
           * always returns the version 2.0 credentials; the version 1.0 credentials are
           * not available.
           *
           *
           * Default: optional
           */
          httpTokens?: 'optional' | 'required';
          /**
           * Set to enabled to allow access to instance tags from the instance metadata.
           * Set to disabled to turn off access to instance tags from the instance metadata.
           * For more information, see Work with instance tags using the instance metadata
           * (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Tags.html#work-with-tags-in-IMDS).
           *
           *
           * Default: disabled
           */
          instanceMetadataTags?: 'enabled' | 'disabled';
        };
        /**
         * InstanceType is the type of instance to create. Example: m4.xlarge
         */
        instanceType: string;
        /**
         * NetworkInterfaces is a list of ENIs to associate with the instance.
         * A maximum of 2 may be specified.
         *
         * @maxItems 2
         */
        networkInterfaces?: [] | [string] | [string, string];
        /**
         * Configuration options for the non root storage volumes.
         */
        nonRootVolumes?: {
          /**
           * Device name
           */
          deviceName?: string;
          /**
           * Encrypted is whether the volume should be encrypted or not.
           */
          encrypted?: boolean;
          /**
           * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
           * If Encrypted is set and this is omitted, the default AWS key will be used.
           * The key must already exist and be accessible by the controller.
           */
          encryptionKey?: string;
          /**
           * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
           */
          iops?: number;
          /**
           * Size specifies size (in Gi) of the storage device.
           * Must be greater than the image snapshot size or 8 (whichever is greater).
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
        }[];
        /**
         * PlacementGroupName specifies the name of the placement group in which to launch the instance.
         */
        placementGroupName?: string;
        /**
         * PlacementGroupPartition is the partition number within the placement group in which to launch the instance.
         * This value is only valid if the placement group, referred in `PlacementGroupName`, was created with
         * strategy set to partition.
         */
        placementGroupPartition?: number;
        /**
         * PrivateDNSName is the options for the instance hostname.
         */
        privateDnsName?: {
          /**
           * EnableResourceNameDNSAAAARecord indicates whether to respond to DNS queries for instance hostnames with DNS AAAA records.
           */
          enableResourceNameDnsAAAARecord?: boolean;
          /**
           * EnableResourceNameDNSARecord indicates whether to respond to DNS queries for instance hostnames with DNS A records.
           */
          enableResourceNameDnsARecord?: boolean;
          /**
           * The type of hostname to assign to an instance.
           */
          hostnameType?: 'ip-name' | 'resource-name';
        };
        /**
         * ProviderID is the unique identifier as specified by the cloud provider.
         */
        providerID?: string;
        /**
         * PublicIP specifies whether the instance should get a public IP.
         * Precedence for this setting is as follows:
         * 1. This field if set
         * 2. Cluster/flavor setting
         * 3. Subnet default
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
           * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
           * If Encrypted is set and this is omitted, the default AWS key will be used.
           * The key must already exist and be accessible by the controller.
           */
          encryptionKey?: string;
          /**
           * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
           */
          iops?: number;
          /**
           * Size specifies size (in Gi) of the storage device.
           * Must be greater than the image snapshot size or 8 (whichever is greater).
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
         * SecurityGroupOverrides is an optional set of security groups to use for the node.
         * This is optional - if not provided security groups from the cluster will be used.
         */
        securityGroupOverrides?: {
          [k: string]: string;
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
         * Subnet is a reference to the subnet to use for this instance. If not specified,
         * the cluster subnet will be used.
         */
        subnet?: {
          /**
           * Filters is a set of key/value pairs used to identify a resource
           * They are applied according to the rules defined by the AWS API:
           * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
           */
          filters?: {
            /**
             * Name of the filter. Filter names are case-sensitive.
             */
            name: string;
            /**
             * Values includes one or more filter values. Filter values are case-sensitive.
             */
            values: string[];
          }[];
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
         * UncompressedUserData specify whether the user data is gzip-compressed before it is sent to ec2 instance.
         * cloud-init has built-in support for gzip-compressed user data
         * user data stored in aws secret manager is always gzip-compressed.
         */
        uncompressedUserData?: boolean;
      };
    };
  };
  /**
   * AWSMachineTemplateStatus defines a status for an AWSMachineTemplate.
   */
  status?: {
    /**
     * Capacity defines the resource capacity for this machine.
     * This value is used for autoscaling from zero operations as defined in:
     * https://github.com/kubernetes-sigs/cluster-api/blob/main/docs/proposals/20210310-opt-in-autoscaling-from-zero.md
     */
    capacity?: {
      [k: string]: number | string;
    };
  };
}

export const AWSMachineTemplateList = 'AWSMachineTemplateList';

export interface IAWSMachineTemplateList
  extends metav1.IList<IAWSMachineTemplate> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  kind: typeof AWSMachineTemplateList;
}

export const AWSManagedCluster = 'AWSManagedCluster';

/**
 * AWSManagedCluster is the Schema for the awsmanagedclusters API
 */
export interface IAWSManagedCluster {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSManagedCluster;
  metadata: metav1.IObjectMeta;
  /**
   * AWSManagedClusterSpec defines the desired state of AWSManagedCluster
   */
  spec?: {
    /**
     * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
     */
    controlPlaneEndpoint?: {
      /**
       * The hostname on which the API server is serving.
       */
      host: string;
      /**
       * The port on which the API server is serving.
       */
      port: number;
    };
  };
  /**
   * AWSManagedClusterStatus defines the observed state of AWSManagedCluster
   */
  status?: {
    /**
     * FailureDomains specifies a list fo available availability zones that can be used
     */
    failureDomains?: {
      /**
       * FailureDomainSpec is the Schema for Cluster API failure domains.
       * It allows controllers to understand how many failure domains a cluster can optionally span across.
       */
      [k: string]: {
        /**
         * Attributes is a free form map of attributes an infrastructure provider might use or require.
         */
        attributes?: {
          [k: string]: string;
        };
        /**
         * ControlPlane determines if this failure domain is suitable for use by control plane machines.
         */
        controlPlane?: boolean;
      };
    };
    /**
     * Ready is when the AWSManagedControlPlane has a API server URL.
     */
    ready?: boolean;
  };
}

export const AWSManagedClusterList = 'AWSManagedClusterList';

export interface IAWSManagedClusterList
  extends metav1.IList<IAWSManagedCluster> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  kind: typeof AWSManagedClusterList;
}

export const AWSManagedMachinePool = 'AWSManagedMachinePool';

/**
 * AWSManagedMachinePool is the Schema for the awsmanagedmachinepools API.
 */
export interface IAWSManagedMachinePool {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSManagedMachinePool;
  metadata: metav1.IObjectMeta;
  /**
   * AWSManagedMachinePoolSpec defines the desired state of AWSManagedMachinePool.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to AWS resources managed by the AWS provider, in addition to the
     * ones added by default.
     */
    additionalTags?: {
      [k: string]: string;
    };
    /**
     * AMIType defines the AMI type
     */
    amiType?:
      | 'AL2_x86_64'
      | 'AL2_x86_64_GPU'
      | 'AL2_ARM_64'
      | 'AL2023_x86_64_STANDARD'
      | 'AL2023_ARM_64_STANDARD'
      | 'CUSTOM';
    /**
     * AMIVersion defines the desired AMI release version. If no version number
     * is supplied then the latest version for the Kubernetes version
     * will be used
     */
    amiVersion?: string;
    /**
     * AvailabilityZoneSubnetType specifies which type of subnets to use when an availability zone is specified.
     */
    availabilityZoneSubnetType?: 'public' | 'private' | 'all';
    /**
     * AvailabilityZones is an array of availability zones instances can run in
     */
    availabilityZones?: string[];
    /**
     * AWSLaunchTemplate specifies the launch template to use to create the managed node group.
     * If AWSLaunchTemplate is specified, certain node group configuraions outside of launch template
     * are prohibited (https://docs.aws.amazon.com/eks/latest/userguide/launch-templates.html).
     */
    awsLaunchTemplate?: {
      /**
       * AdditionalSecurityGroups is an array of references to security groups that should be applied to the
       * instances. These security groups would be set in addition to any security groups defined
       * at the cluster level or in the actuator.
       */
      additionalSecurityGroups?: {
        /**
         * Filters is a set of key/value pairs used to identify a resource
         * They are applied according to the rules defined by the AWS API:
         * https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Filtering.html
         */
        filters?: {
          /**
           * Name of the filter. Filter names are case-sensitive.
           */
          name: string;
          /**
           * Values includes one or more filter values. Filter values are case-sensitive.
           */
          values: string[];
        }[];
        /**
         * ID of resource
         */
        id?: string;
      }[];
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
       * The name or the Amazon Resource Name (ARN) of the instance profile associated
       * with the IAM role for the instance. The instance profile contains the IAM
       * role.
       */
      iamInstanceProfile?: string;
      /**
       * ImageLookupBaseOS is the name of the base operating system to use for
       * image lookup the AMI is not set.
       */
      imageLookupBaseOS?: string;
      /**
       * ImageLookupFormat is the AMI naming format to look up the image for this
       * machine It will be ignored if an explicit AMI is set. Supports
       * substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base OS and
       * kubernetes version, respectively. The BaseOS will be the value in
       * ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as
       * defined by the packages produced by kubernetes/release without v as a
       * prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default
       * image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-* will end up
       * searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-* for a
       * Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See
       * also: https://golang.org/pkg/text/template/
       */
      imageLookupFormat?: string;
      /**
       * ImageLookupOrg is the AWS Organization ID to use for image lookup if AMI is not set.
       */
      imageLookupOrg?: string;
      /**
       * InstanceMetadataOptions defines the behavior for applying metadata to instances.
       */
      instanceMetadataOptions?: {
        /**
         * Enables or disables the HTTP metadata endpoint on your instances.
         *
         *
         * If you specify a value of disabled, you cannot access your instance metadata.
         *
         *
         * Default: enabled
         */
        httpEndpoint?: 'enabled' | 'disabled';
        /**
         * The desired HTTP PUT response hop limit for instance metadata requests. The
         * larger the number, the further instance metadata requests can travel.
         *
         *
         * Default: 1
         */
        httpPutResponseHopLimit?: number;
        /**
         * The state of token usage for your instance metadata requests.
         *
         *
         * If the state is optional, you can choose to retrieve instance metadata with
         * or without a session token on your request. If you retrieve the IAM role
         * credentials without a token, the version 1.0 role credentials are returned.
         * If you retrieve the IAM role credentials using a valid session token, the
         * version 2.0 role credentials are returned.
         *
         *
         * If the state is required, you must send a session token with any instance
         * metadata retrieval requests. In this state, retrieving the IAM role credentials
         * always returns the version 2.0 credentials; the version 1.0 credentials are
         * not available.
         *
         *
         * Default: optional
         */
        httpTokens?: 'optional' | 'required';
        /**
         * Set to enabled to allow access to instance tags from the instance metadata.
         * Set to disabled to turn off access to instance tags from the instance metadata.
         * For more information, see Work with instance tags using the instance metadata
         * (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Tags.html#work-with-tags-in-IMDS).
         *
         *
         * Default: disabled
         */
        instanceMetadataTags?: 'enabled' | 'disabled';
      };
      /**
       * InstanceType is the type of instance to create. Example: m4.xlarge
       */
      instanceType?: string;
      /**
       * The name of the launch template.
       */
      name?: string;
      /**
       * Configuration options for the non root storage volumes.
       */
      nonRootVolumes?: {
        /**
         * Device name
         */
        deviceName?: string;
        /**
         * Encrypted is whether the volume should be encrypted or not.
         */
        encrypted?: boolean;
        /**
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
      }[];
      /**
       * PrivateDNSName is the options for the instance hostname.
       */
      privateDnsName?: {
        /**
         * EnableResourceNameDNSAAAARecord indicates whether to respond to DNS queries for instance hostnames with DNS AAAA records.
         */
        enableResourceNameDnsAAAARecord?: boolean;
        /**
         * EnableResourceNameDNSARecord indicates whether to respond to DNS queries for instance hostnames with DNS A records.
         */
        enableResourceNameDnsARecord?: boolean;
        /**
         * The type of hostname to assign to an instance.
         */
        hostnameType?: 'ip-name' | 'resource-name';
      };
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
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
       * SpotMarketOptions are options for configuring AWSMachinePool instances to be run using AWS Spot instances.
       */
      spotMarketOptions?: {
        /**
         * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
         */
        maxPrice?: string;
      };
      /**
       * SSHKeyName is the name of the ssh key to attach to the instance. Valid values are empty string
       * (do not use SSH keys), a valid SSH key name, or omitted (use the default SSH key name)
       */
      sshKeyName?: string;
      /**
       * VersionNumber is the version of the launch template that is applied.
       * Typically a new version is created when at least one of the following happens:
       * 1) A new launch template spec is applied.
       * 2) One or more parameters in an existing template is changed.
       * 3) A new AMI is discovered.
       */
      versionNumber?: number;
    };
    /**
     * CapacityType specifies the capacity type for the ASG behind this pool
     */
    capacityType?: 'onDemand' | 'spot';
    /**
     * DiskSize specifies the root disk size
     */
    diskSize?: number;
    /**
     * EKSNodegroupName specifies the name of the nodegroup in AWS
     * corresponding to this MachinePool. If you don't specify a name
     * then a default name will be created based on the namespace and
     * name of the managed machine pool.
     */
    eksNodegroupName?: string;
    /**
     * InstanceType specifies the AWS instance type
     */
    instanceType?: string;
    /**
     * Labels specifies labels for the Kubernetes node objects
     */
    labels?: {
      [k: string]: string;
    };
    /**
     * ProviderIDList are the provider IDs of instances in the
     * autoscaling group corresponding to the nodegroup represented by this
     * machine pool
     */
    providerIDList?: string[];
    /**
     * RemoteAccess specifies how machines can be accessed remotely
     */
    remoteAccess?: {
      /**
       * Public specifies whether to open port 22 to the public internet
       */
      public?: boolean;
      /**
       * SourceSecurityGroups specifies which security groups are allowed access
       */
      sourceSecurityGroups?: string[];
      /**
       * SSHKeyName specifies which EC2 SSH key can be used to access machines.
       * If left empty, the key from the control plane is used.
       */
      sshKeyName?: string;
    };
    /**
     * RoleAdditionalPolicies allows you to attach additional polices to
     * the node group role. You must enable the EKSAllowAddRoles
     * feature flag to incorporate these into the created role.
     */
    roleAdditionalPolicies?: string[];
    /**
     * RoleName specifies the name of IAM role for the node group.
     * If the role is pre-existing we will treat it as unmanaged
     * and not delete it on deletion. If the EKSEnableIAM feature
     * flag is true and no name is supplied then a role is created.
     */
    roleName?: string;
    /**
     * Scaling specifies scaling for the ASG behind this pool
     */
    scaling?: {
      maxSize?: number;
      minSize?: number;
    };
    /**
     * SubnetIDs specifies which subnets are used for the
     * auto scaling group of this nodegroup
     */
    subnetIDs?: string[];
    /**
     * Taints specifies the taints to apply to the nodes of the machine pool
     */
    taints?: {
      /**
       * Effect specifies the effect for the taint
       */
      effect: 'no-schedule' | 'no-execute' | 'prefer-no-schedule';
      /**
       * Key is the key of the taint
       */
      key: string;
      /**
       * Value is the value of the taint
       */
      value: string;
    }[];
    /**
     * UpdateConfig holds the optional config to control the behaviour of the update
     * to the nodegroup.
     */
    updateConfig?: {
      /**
       * MaxUnavailable is the maximum number of nodes unavailable at once during a version update.
       * Nodes will be updated in parallel. The maximum number is 100.
       */
      maxUnavailable?: number;
      /**
       * MaxUnavailablePercentage is the maximum percentage of nodes unavailable during a version update. This
       * percentage of nodes will be updated in parallel, up to 100 nodes at once.
       */
      maxUnavailablePercentage?: number;
    };
  };
  /**
   * AWSManagedMachinePoolStatus defines the observed state of AWSManagedMachinePool.
   */
  status?: {
    /**
     * Conditions defines current service state of the managed machine pool
     */
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another.
       * This should be when the underlying condition changed. If that is not known, then using the time when
       * the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition.
       * This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase.
       * The specific API may choose whether or not this field is considered a guaranteed API.
       * This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately
       * understand the current situation and act accordingly.
       * The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase.
       * Many .condition.type values are consistent across resources like Available, but because arbitrary conditions
       * can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
    /**
     * FailureMessage will be set in the event that there is a terminal problem
     * reconciling the MachinePool and will contain a more verbose string suitable
     * for logging and human consumption.
     *
     *
     * This field should not be set for transitive errors that a controller
     * faces that are expected to be fixed automatically over
     * time (like service outages), but instead indicate that something is
     * fundamentally wrong with the MachinePool's spec or the configuration of
     * the controller, and that manual intervention is required. Examples
     * of terminal errors would be invalid combinations of settings in the
     * spec, values that are unsupported by the controller, or the
     * responsible controller itself being critically misconfigured.
     *
     *
     * Any transient errors that occur during the reconciliation of MachinePools
     * can be added as events to the MachinePool object and/or logged in the
     * controller's output.
     */
    failureMessage?: string;
    /**
     * FailureReason will be set in the event that there is a terminal problem
     * reconciling the MachinePool and will contain a succinct value suitable
     * for machine interpretation.
     *
     *
     * This field should not be set for transitive errors that a controller
     * faces that are expected to be fixed automatically over
     * time (like service outages), but instead indicate that something is
     * fundamentally wrong with the Machine's spec or the configuration of
     * the controller, and that manual intervention is required. Examples
     * of terminal errors would be invalid combinations of settings in the
     * spec, values that are unsupported by the controller, or the
     * responsible controller itself being critically misconfigured.
     *
     *
     * Any transient errors that occur during the reconciliation of MachinePools
     * can be added as events to the MachinePool object and/or logged in the
     * controller's output.
     */
    failureReason?: string;
    /**
     * The ID of the launch template
     */
    launchTemplateID?: string;
    /**
     * The version of the launch template
     */
    launchTemplateVersion?: string;
    /**
     * Ready denotes that the AWSManagedMachinePool nodegroup has joined
     * the cluster
     */
    ready: boolean;
    /**
     * Replicas is the most recently observed number of replicas.
     */
    replicas?: number;
  };
}

export const AWSManagedMachinePoolList = 'AWSManagedMachinePoolList';

export interface IAWSManagedMachinePoolList
  extends metav1.IList<IAWSManagedMachinePool> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  kind: typeof AWSManagedMachinePoolList;
}

export const AWSManagedControlPlane = 'AWSManagedControlPlane';

/**
 * AWSManagedControlPlane is the schema for the Amazon EKS Managed Control Plane API.
 */
export interface IAWSManagedControlPlane {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'controlplane.cluster.x-k8s.io/v1beta2';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSManagedControlPlane;
  metadata: metav1.IObjectMeta;
  /**
   * AWSManagedControlPlaneSpec defines the desired state of an Amazon EKS Cluster.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to AWS resources managed by the AWS provider, in addition to the
     * ones added by default.
     */
    additionalTags?: {
      [k: string]: string;
    };
    /**
     * Addons defines the EKS addons to enable with the EKS cluster.
     */
    addons?: {
      /**
       * Configuration of the EKS addon
       */
      configuration?: string;
      /**
       * ConflictResolution is used to declare what should happen if there
       * are parameter conflicts. Defaults to none
       */
      conflictResolution?: 'overwrite' | 'none';
      /**
       * Name is the name of the addon
       */
      name: string;
      /**
       * ServiceAccountRoleArn is the ARN of an IAM role to bind to the addons service account
       */
      serviceAccountRoleARN?: string;
      /**
       * Version is the version of the addon to use
       */
      version: string;
    }[];
    /**
     * AssociateOIDCProvider can be enabled to automatically create an identity
     * provider for the controller for use with IAM roles for service accounts
     */
    associateOIDCProvider?: boolean;
    /**
     * Bastion contains options to configure the bastion host.
     */
    bastion?: {
      /**
       * AllowedCIDRBlocks is a list of CIDR blocks allowed to access the bastion host.
       * They are set as ingress rules for the Bastion host's Security Group (defaults to 0.0.0.0/0).
       */
      allowedCIDRBlocks?: string[];
      /**
       * AMI will use the specified AMI to boot the bastion. If not specified,
       * the AMI will default to one picked out in public space.
       */
      ami?: string;
      /**
       * DisableIngressRules will ensure there are no Ingress rules in the bastion host's security group.
       * Requires AllowedCIDRBlocks to be empty.
       */
      disableIngressRules?: boolean;
      /**
       * Enabled allows this provider to create a bastion host instance
       * with a public ip to access the VPC private network.
       */
      enabled?: boolean;
      /**
       * InstanceType will use the specified instance type for the bastion. If not specified,
       * Cluster API Provider AWS will use t3.micro for all regions except us-east-1, where t2.micro
       * will be the default.
       */
      instanceType?: string;
    };
    /**
     * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
     */
    controlPlaneEndpoint?: {
      /**
       * The hostname on which the API server is serving.
       */
      host: string;
      /**
       * The port on which the API server is serving.
       */
      port: number;
    };
    /**
     * EKSClusterName allows you to specify the name of the EKS cluster in
     * AWS. If you don't specify a name then a default name will be created
     * based on the namespace and name of the managed control plane.
     */
    eksClusterName?: string;
    /**
     * EncryptionConfig specifies the encryption configuration for the cluster
     */
    encryptionConfig?: {
      /**
       * Provider specifies the ARN or alias of the CMK (in AWS KMS)
       */
      provider?: string;
      /**
       * Resources specifies the resources to be encrypted
       */
      resources?: string[];
    };
    /**
     * Endpoints specifies access to this cluster's control plane endpoints
     */
    endpointAccess?: {
      /**
       * Private points VPC-internal control plane access to the private endpoint
       */
      private?: boolean;
      /**
       * Public controls whether control plane endpoints are publicly accessible
       */
      public?: boolean;
      /**
       * PublicCIDRs specifies which blocks can access the public endpoint
       */
      publicCIDRs?: string[];
    };
    /**
     * IAMAuthenticatorConfig allows the specification of any additional user or role mappings
     * for use when generating the aws-iam-authenticator configuration. If this is nil the
     * default configuration is still generated for the cluster.
     */
    iamAuthenticatorConfig?: {
      /**
       * RoleMappings is a list of role mappings
       */
      mapRoles?: {
        /**
         * Groups is a list of kubernetes RBAC groups
         */
        groups: string[];
        /**
         * RoleARN is the AWS ARN for the role to map
         */
        rolearn: string;
        /**
         * UserName is a kubernetes RBAC user subject
         */
        username: string;
      }[];
      /**
       * UserMappings is a list of user mappings
       */
      mapUsers?: {
        /**
         * Groups is a list of kubernetes RBAC groups
         */
        groups: string[];
        /**
         * UserARN is the AWS ARN for the user to map
         */
        userarn: string;
        /**
         * UserName is a kubernetes RBAC user subject
         */
        username: string;
      }[];
    };
    /**
     * IdentityRef is a reference to an identity to be used when reconciling the managed control plane.
     * If no identity is specified, the default identity for this controller will be used.
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
     * ImageLookupBaseOS is the name of the base operating system used to look
     * up machine images when a machine does not specify an AMI. When set, this
     * will be used for all cluster machines unless a machine specifies a
     * different ImageLookupBaseOS.
     */
    imageLookupBaseOS?: string;
    /**
     * ImageLookupFormat is the AMI naming format to look up machine images when
     * a machine does not specify an AMI. When set, this will be used for all
     * cluster machines unless a machine specifies a different ImageLookupOrg.
     * Supports substitutions for {{.BaseOS}} and {{.K8sVersion}} with the base
     * OS and kubernetes version, respectively. The BaseOS will be the value in
     * ImageLookupBaseOS or ubuntu (the default), and the kubernetes version as
     * defined by the packages produced by kubernetes/release without v as a
     * prefix: 1.13.0, 1.12.5-mybuild.1, or 1.17.3. For example, the default
     * image format of capa-ami-{{.BaseOS}}-?{{.K8sVersion}}-* will end up
     * searching for AMIs that match the pattern capa-ami-ubuntu-?1.18.0-* for a
     * Machine that is targeting kubernetes v1.18.0 and the ubuntu base OS. See
     * also: https://golang.org/pkg/text/template/
     */
    imageLookupFormat?: string;
    /**
     * ImageLookupOrg is the AWS Organization ID to look up machine images when a
     * machine does not specify an AMI. When set, this will be used for all
     * cluster machines unless a machine specifies a different ImageLookupOrg.
     */
    imageLookupOrg?: string;
    /**
     * KubeProxy defines managed attributes of the kube-proxy daemonset
     */
    kubeProxy?: {
      /**
       * Disable set to true indicates that kube-proxy should be disabled. With EKS clusters
       * kube-proxy is automatically installed into the cluster. For clusters where you want
       * to use kube-proxy functionality that is provided with an alternate CNI, this option
       * provides a way to specify that the kube-proxy daemonset should be deleted. You cannot
       * set this to true if you are using the Amazon kube-proxy addon.
       */
      disable?: boolean;
    };
    /**
     * Logging specifies which EKS Cluster logs should be enabled. Entries for
     * each of the enabled logs will be sent to CloudWatch
     */
    logging?: {
      /**
       * APIServer indicates if the Kubernetes API Server log (kube-apiserver) shoulkd be enabled
       */
      apiServer: boolean;
      /**
       * Audit indicates if the Kubernetes API audit log should be enabled
       */
      audit: boolean;
      /**
       * Authenticator indicates if the iam authenticator log should be enabled
       */
      authenticator: boolean;
      /**
       * ControllerManager indicates if the controller manager (kube-controller-manager) log should be enabled
       */
      controllerManager: boolean;
      /**
       * Scheduler indicates if the Kubernetes scheduler (kube-scheduler) log should be enabled
       */
      scheduler: boolean;
    };
    /**
     * NetworkSpec encapsulates all things related to AWS network.
     */
    network?: {
      /**
       * AdditionalControlPlaneIngressRules is an optional set of ingress rules to add to the control plane
       */
      additionalControlPlaneIngressRules?: {
        /**
         * List of CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        cidrBlocks?: string[];
        /**
         * Description provides extended information about the ingress rule.
         */
        description: string;
        /**
         * FromPort is the start of port range.
         */
        fromPort: number;
        /**
         * List of IPv6 CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
         */
        ipv6CidrBlocks?: string[];
        /**
         * NatGatewaysIPsSource use the NAT gateways IPs as the source for the ingress rule.
         */
        natGatewaysIPsSource?: boolean;
        /**
         * Protocol is the protocol for the ingress rule. Accepted values are "-1" (all), "4" (IP in IP),"tcp", "udp", "icmp", and "58" (ICMPv6), "50" (ESP).
         */
        protocol: '-1' | '4' | 'tcp' | 'udp' | 'icmp' | '58' | '50';
        /**
         * The security group id to allow access from. Cannot be specified with CidrBlocks.
         */
        sourceSecurityGroupIds?: string[];
        /**
         * The security group role to allow access from. Cannot be specified with CidrBlocks.
         * The field will be combined with source security group IDs if specified.
         */
        sourceSecurityGroupRoles?: (
          | 'bastion'
          | 'node'
          | 'controlplane'
          | 'apiserver-lb'
          | 'lb'
          | 'node-eks-additional'
        )[];
        /**
         * ToPort is the end of port range.
         */
        toPort: number;
      }[];
      /**
       * CNI configuration
       */
      cni?: {
        /**
         * CNIIngressRules specify rules to apply to control plane and worker node security groups.
         * The source for the rule will be set to control plane and worker security group IDs.
         */
        cniIngressRules?: {
          description: string;
          fromPort: number;
          /**
           * SecurityGroupProtocol defines the protocol type for a security group rule.
           */
          protocol: string;
          toPort: number;
        }[];
      };
      /**
       * SecurityGroupOverrides is an optional set of security groups to use for cluster instances
       * This is optional - if not provided new security groups will be created for the cluster
       */
      securityGroupOverrides?: {
        [k: string]: string;
      };
      /**
       * Subnets configuration.
       */
      subnets?: {
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
         * If you're bringing your subnet, set the AWS subnet-id here, it must start with `subnet-`.
         *
         *
         * When the VPC is managed by CAPA, and you'd like the provider to create a subnet for you,
         * the id can be set to any placeholder value that does not start with `subnet-`;
         * upon creation, the subnet AWS identifier will be populated in the `ResourceID` field and
         * the `id` field is going to be used as the subnet name. If you specify a tag
         * called `Name`, it takes precedence.
         */
        id: string;
        /**
         * IPv6CidrBlock is the IPv6 CIDR block to be used when the provider creates a managed VPC.
         * A subnet can have an IPv4 and an IPv6 address.
         * IPv6 is only supported in managed clusters, this field cannot be set on AWSCluster object.
         */
        ipv6CidrBlock?: string;
        /**
         * IsIPv6 defines the subnet as an IPv6 subnet. A subnet is IPv6 when it is associated with a VPC that has IPv6 enabled.
         * IPv6 is only supported in managed clusters, this field cannot be set on AWSCluster object.
         */
        isIpv6?: boolean;
        /**
         * IsPublic defines the subnet as a public subnet. A subnet is public when it is associated with a route table that has a route to an internet gateway.
         */
        isPublic?: boolean;
        /**
         * NatGatewayID is the NAT gateway id associated with the subnet.
         * Ignored unless the subnet is managed by the provider, in which case this is set on the public subnet where the NAT gateway resides. It is then used to determine routes for private subnets in the same AZ as the public subnet.
         */
        natGatewayId?: string;
        /**
         * ParentZoneName is the zone name where the current subnet's zone is tied when
         * the zone is a Local Zone.
         *
         *
         * The subnets in Local Zone or Wavelength Zone locations consume the ParentZoneName
         * to select the correct private route table to egress traffic to the internet.
         */
        parentZoneName?: string;
        /**
         * ResourceID is the subnet identifier from AWS, READ ONLY.
         * This field is populated when the provider manages the subnet.
         */
        resourceID?: string;
        /**
         * RouteTableID is the routing table id associated with the subnet.
         */
        routeTableId?: string;
        /**
         * Tags is a collection of tags describing the resource.
         */
        tags?: {
          [k: string]: string;
        };
        /**
         * ZoneType defines the type of the zone where the subnet is created.
         *
         *
         * The valid values are availability-zone, local-zone, and wavelength-zone.
         *
         *
         * Subnet with zone type availability-zone (regular) is always selected to create cluster
         * resources, like Load Balancers, NAT Gateways, Contol Plane nodes, etc.
         *
         *
         * Subnet with zone type local-zone or wavelength-zone is not eligible to automatically create
         * regular cluster resources.
         *
         *
         * The public subnet in availability-zone or local-zone is associated with regular public
         * route table with default route entry to a Internet Gateway.
         *
         *
         * The public subnet in wavelength-zone is associated with a carrier public
         * route table with default route entry to a Carrier Gateway.
         *
         *
         * The private subnet in the availability-zone is associated with a private route table with
         * the default route entry to a NAT Gateway created in that zone.
         *
         *
         * The private subnet in the local-zone or wavelength-zone is associated with a private route table with
         * the default route entry re-using the NAT Gateway in the Region (preferred from the
         * parent zone, the zone type availability-zone in the region, or first table available).
         */
        zoneType?: 'availability-zone' | 'local-zone' | 'wavelength-zone';
      }[];
      /**
       * VPC configuration.
       */
      vpc?: {
        /**
         * AvailabilityZoneSelection specifies how AZs should be selected if there are more AZs
         * in a region than specified by AvailabilityZoneUsageLimit. There are 2 selection schemes:
         * Ordered - selects based on alphabetical order
         * Random - selects AZs randomly in a region
         * Defaults to Ordered
         */
        availabilityZoneSelection?: 'Ordered' | 'Random';
        /**
         * AvailabilityZoneUsageLimit specifies the maximum number of availability zones (AZ) that
         * should be used in a region when automatically creating subnets. If a region has more
         * than this number of AZs then this number of AZs will be picked randomly when creating
         * default subnets. Defaults to 3
         */
        availabilityZoneUsageLimit?: number;
        /**
         * CarrierGatewayID is the id of the internet gateway associated with the VPC,
         * for carrier network (Wavelength Zones).
         */
        carrierGatewayId?: string;
        /**
         * CidrBlock is the CIDR block to be used when the provider creates a managed VPC.
         * Defaults to 10.0.0.0/16.
         * Mutually exclusive with IPAMPool.
         */
        cidrBlock?: string;
        /**
         * ElasticIPPool contains specific configuration to allocate Public IPv4 address (Elastic IP) from user-defined pool
         * brought to AWS for core infrastructure resources, like NAT Gateways and Public Network Load Balancers for
         * the API Server.
         */
        elasticIpPool?: {
          /**
           * PublicIpv4Pool sets a custom Public IPv4 Pool used to create Elastic IP address for resources
           * created in public IPv4 subnets. Every IPv4 address, Elastic IP, will be allocated from the custom
           * Public IPv4 pool that you brought to AWS, instead of Amazon-provided pool. The public IPv4 pool
           * resource ID starts with 'ipv4pool-ec2'.
           */
          publicIpv4Pool?: string;
          /**
           * PublicIpv4PoolFallBackOrder defines the fallback action when the Public IPv4 Pool has been exhausted,
           * no more IPv4 address available in the pool.
           *
           *
           * When set to 'amazon-pool', the controller check if the pool has available IPv4 address, when pool has reached the
           * IPv4 limit, the address will be claimed from Amazon-pool (default).
           *
           *
           * When set to 'none', the controller will fail the Elastic IP allocation when the publicIpv4Pool is exhausted.
           */
          publicIpv4PoolFallbackOrder?: 'amazon-pool' | 'none';
        };
        /**
         * EmptyRoutesDefaultVPCSecurityGroup specifies whether the default VPC security group ingress
         * and egress rules should be removed.
         *
         *
         * By default, when creating a VPC, AWS creates a security group called `default` with ingress and egress
         * rules that allow traffic from anywhere. The group could be used as a potential surface attack and
         * it's generally suggested that the group rules are removed or modified appropriately.
         *
         *
         * NOTE: This only applies when the VPC is managed by the Cluster API AWS controller.
         */
        emptyRoutesDefaultVPCSecurityGroup?: boolean;
        /**
         * ID is the vpc-id of the VPC this provider should use to create resources.
         */
        id?: string;
        /**
         * InternetGatewayID is the id of the internet gateway associated with the VPC.
         */
        internetGatewayId?: string;
        /**
         * IPAMPool defines the IPAMv4 pool to be used for VPC.
         * Mutually exclusive with CidrBlock.
         */
        ipamPool?: {
          /**
           * ID is the ID of the IPAM pool this provider should use to create VPC.
           */
          id?: string;
          /**
           * Name is the name of the IPAM pool this provider should use to create VPC.
           */
          name?: string;
          /**
           * The netmask length of the IPv4 CIDR you want to allocate to VPC from
           * an Amazon VPC IP Address Manager (IPAM) pool.
           * Defaults to /16 for IPv4 if not specified.
           */
          netmaskLength?: number;
        };
        /**
         * IPv6 contains ipv6 specific settings for the network. Supported only in managed clusters.
         * This field cannot be set on AWSCluster object.
         */
        ipv6?: {
          /**
           * CidrBlock is the CIDR block provided by Amazon when VPC has enabled IPv6.
           * Mutually exclusive with IPAMPool.
           */
          cidrBlock?: string;
          /**
           * EgressOnlyInternetGatewayID is the id of the egress only internet gateway associated with an IPv6 enabled VPC.
           */
          egressOnlyInternetGatewayId?: string;
          /**
           * IPAMPool defines the IPAMv6 pool to be used for VPC.
           * Mutually exclusive with CidrBlock.
           */
          ipamPool?: {
            /**
             * ID is the ID of the IPAM pool this provider should use to create VPC.
             */
            id?: string;
            /**
             * Name is the name of the IPAM pool this provider should use to create VPC.
             */
            name?: string;
            /**
             * The netmask length of the IPv4 CIDR you want to allocate to VPC from
             * an Amazon VPC IP Address Manager (IPAM) pool.
             * Defaults to /16 for IPv4 if not specified.
             */
            netmaskLength?: number;
          };
          /**
           * PoolID is the IP pool which must be defined in case of BYO IP is defined.
           * Must be specified if CidrBlock is set.
           * Mutually exclusive with IPAMPool.
           */
          poolId?: string;
        };
        /**
         * PrivateDNSHostnameTypeOnLaunch is the type of hostname to assign to instances in the subnet at launch.
         * For IPv4-only and dual-stack (IPv4 and IPv6) subnets, an instance DNS name can be based on the instance IPv4 address (ip-name)
         * or the instance ID (resource-name). For IPv6 only subnets, an instance DNS name must be based on the instance ID (resource-name).
         */
        privateDnsHostnameTypeOnLaunch?: 'ip-name' | 'resource-name';
        /**
         * SecondaryCidrBlocks are additional CIDR blocks to be associated when the provider creates a managed VPC.
         * Defaults to none. Mutually exclusive with IPAMPool. This makes sense to use if, for example, you want to use
         * a separate IP range for pods (e.g. Cilium ENI mode).
         */
        secondaryCidrBlocks?: {
          /**
           * IPv4CidrBlock is the IPv4 CIDR block to associate with the managed VPC.
           */
          ipv4CidrBlock: string;
        }[];
        /**
         * SubnetSchema specifies how CidrBlock should be divided on subnets in the VPC depending on the number of AZs.
         * PreferPrivate - one private subnet for each AZ plus one other subnet that will be further sub-divided for the public subnets.
         * PreferPublic - have the reverse logic of PreferPrivate, one public subnet for each AZ plus one other subnet
         * that will be further sub-divided for the private subnets.
         * Defaults to PreferPrivate
         */
        subnetSchema?: 'PreferPrivate' | 'PreferPublic';
        /**
         * Tags is a collection of tags describing the resource.
         */
        tags?: {
          [k: string]: string;
        };
      };
    };
    /**
     * IdentityProviderconfig is used to specify the oidc provider config
     * to be attached with this eks cluster
     */
    oidcIdentityProviderConfig?: {
      /**
       * This is also known as audience. The ID for the client application that makes
       * authentication requests to the OpenID identity provider.
       */
      clientId?: string;
      /**
       * The JWT claim that the provider uses to return your groups.
       */
      groupsClaim?: string;
      /**
       * The prefix that is prepended to group claims to prevent clashes with existing
       * names (such as system: groups). For example, the valueoidc: will create group
       * names like oidc:engineering and oidc:infra.
       */
      groupsPrefix?: string;
      /**
       * The name of the OIDC provider configuration.
       *
       *
       * IdentityProviderConfigName is a required field
       */
      identityProviderConfigName?: string;
      /**
       * The URL of the OpenID identity provider that allows the API server to discover
       * public signing keys for verifying tokens. The URL must begin with https://
       * and should correspond to the iss claim in the provider's OIDC ID tokens.
       * Per the OIDC standard, path components are allowed but query parameters are
       * not. Typically the URL consists of only a hostname, like https://server.example.org
       * or https://example.com. This URL should point to the level below .well-known/openid-configuration
       * and must be publicly accessible over the internet.
       */
      issuerUrl?: string;
      /**
       * The key value pairs that describe required claims in the identity token.
       * If set, each claim is verified to be present in the token with a matching
       * value. For the maximum number of claims that you can require, see Amazon
       * EKS service quotas (https://docs.aws.amazon.com/eks/latest/userguide/service-quotas.html)
       * in the Amazon EKS User Guide.
       */
      requiredClaims?: {
        [k: string]: string;
      };
      /**
       * tags to apply to oidc identity provider association
       */
      tags?: {
        [k: string]: string;
      };
      /**
       * The JSON Web Token (JWT) claim to use as the username. The default is sub,
       * which is expected to be a unique identifier of the end user. You can choose
       * other claims, such as email or name, depending on the OpenID identity provider.
       * Claims other than email are prefixed with the issuer URL to prevent naming
       * clashes with other plug-ins.
       */
      usernameClaim?: string;
      /**
       * The prefix that is prepended to username claims to prevent clashes with existing
       * names. If you do not provide this field, and username is a value other than
       * email, the prefix defaults to issuerurl#. You can use the value - to disable
       * all prefixing.
       */
      usernamePrefix?: string;
    };
    /**
     * Partition is the AWS security partition being used. Defaults to "aws"
     */
    partition?: string;
    /**
     * The AWS Region the cluster lives in.
     */
    region?: string;
    /**
     * RestrictPrivateSubnets indicates that the EKS control plane should only use private subnets.
     */
    restrictPrivateSubnets?: boolean;
    /**
     * RoleAdditionalPolicies allows you to attach additional polices to
     * the control plane role. You must enable the EKSAllowAddRoles
     * feature flag to incorporate these into the created role.
     */
    roleAdditionalPolicies?: string[];
    /**
     * RoleName specifies the name of IAM role that gives EKS
     * permission to make API calls. If the role is pre-existing
     * we will treat it as unmanaged and not delete it on
     * deletion. If the EKSEnableIAM feature flag is true
     * and no name is supplied then a role is created.
     */
    roleName?: string;
    /**
     * SecondaryCidrBlock is the additional CIDR range to use for pod IPs.
     * Must be within the 100.64.0.0/10 or 198.19.0.0/16 range.
     */
    secondaryCidrBlock?: string;
    /**
     * SSHKeyName is the name of the ssh key to attach to the bastion host. Valid values are empty string (do not use SSH keys), a valid SSH key name, or omitted (use the default SSH key name)
     */
    sshKeyName?: string;
    /**
     * TokenMethod is used to specify the method for obtaining a client token for communicating with EKS
     * iam-authenticator - obtains a client token using iam-authentictor
     * aws-cli - obtains a client token using the AWS CLI
     * Defaults to iam-authenticator
     */
    tokenMethod?: 'iam-authenticator' | 'aws-cli';
    /**
     * Version defines the desired Kubernetes version. If no version number
     * is supplied then the latest version of Kubernetes that EKS supports
     * will be used.
     */
    version?: string;
    /**
     * VpcCni is used to set configuration options for the VPC CNI plugin
     */
    vpcCni?: {
      /**
       * Disable indicates that the Amazon VPC CNI should be disabled. With EKS clusters the
       * Amazon VPC CNI is automatically installed into the cluster. For clusters where you want
       * to use an alternate CNI this option provides a way to specify that the Amazon VPC CNI
       * should be deleted. You cannot set this to true if you are using the
       * Amazon VPC CNI addon.
       */
      disable?: boolean;
      /**
       * Env defines a list of environment variables to apply to the `aws-node` DaemonSet
       */
      env?: {
        /**
         * Name of the environment variable. Must be a C_IDENTIFIER.
         */
        name: string;
        /**
         * Variable references $(VAR_NAME) are expanded
         * using the previously defined environment variables in the container and
         * any service environment variables. If a variable cannot be resolved,
         * the reference in the input string will be unchanged. Double $$ are reduced
         * to a single $, which allows for escaping the $(VAR_NAME) syntax: i.e.
         * "$$(VAR_NAME)" will produce the string literal "$(VAR_NAME)".
         * Escaped references will never be expanded, regardless of whether the variable
         * exists or not.
         * Defaults to "".
         */
        value?: string;
        /**
         * Source for the environment variable's value. Cannot be used if value is not empty.
         */
        valueFrom?: {
          /**
           * Selects a key of a ConfigMap.
           */
          configMapKeyRef?: {
            /**
             * The key to select.
             */
            key: string;
            /**
             * Name of the referent.
             * More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
             * TODO: Add other useful fields. apiVersion, kind, uid?
             */
            name?: string;
            /**
             * Specify whether the ConfigMap or its key must be defined
             */
            optional?: boolean;
          };
          /**
           * Selects a field of the pod: supports metadata.name, metadata.namespace, `metadata.labels['<KEY>']`, `metadata.annotations['<KEY>']`,
           * spec.nodeName, spec.serviceAccountName, status.hostIP, status.podIP, status.podIPs.
           */
          fieldRef?: {
            /**
             * Version of the schema the FieldPath is written in terms of, defaults to "v1".
             */
            apiVersion?: string;
            /**
             * Path of the field to select in the specified API version.
             */
            fieldPath: string;
          };
          /**
           * Selects a resource of the container: only resources limits and requests
           * (limits.cpu, limits.memory, limits.ephemeral-storage, requests.cpu, requests.memory and requests.ephemeral-storage) are currently supported.
           */
          resourceFieldRef?: {
            /**
             * Container name: required for volumes, optional for env vars
             */
            containerName?: string;
            /**
             * Specifies the output format of the exposed resources, defaults to "1"
             */
            divisor?: number | string;
            /**
             * Required: resource to select
             */
            resource: string;
          };
          /**
           * Selects a key of a secret in the pod's namespace
           */
          secretKeyRef?: {
            /**
             * The key of the secret to select from.  Must be a valid secret key.
             */
            key: string;
            /**
             * Name of the referent.
             * More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
             * TODO: Add other useful fields. apiVersion, kind, uid?
             */
            name?: string;
            /**
             * Specify whether the Secret or its key must be defined
             */
            optional?: boolean;
          };
        };
      }[];
    };
  };
  /**
   * AWSManagedControlPlaneStatus defines the observed state of an Amazon EKS Cluster.
   */
  status?: {
    /**
     * Addons holds the current status of the EKS addons
     */
    addons?: {
      /**
       * ARN is the AWS ARN of the addon
       */
      arn: string;
      /**
       * CreatedAt is the date and time the addon was created at
       */
      createdAt?: string;
      /**
       * Issues is a list of issue associated with the addon
       */
      issues?: {
        /**
         * Code is the issue code
         */
        code?: string;
        /**
         * Message is the textual description of the issue
         */
        message?: string;
        /**
         * ResourceIDs is a list of resource ids for the issue
         */
        resourceIds?: string[];
      }[];
      /**
       * ModifiedAt is the date and time the addon was last modified
       */
      modifiedAt?: string;
      /**
       * Name is the name of the addon
       */
      name: string;
      /**
       * ServiceAccountRoleArn is the ARN of the IAM role used for the service account
       */
      serviceAccountRoleARN?: string;
      /**
       * Status is the status of the addon
       */
      status?: string;
      /**
       * Version is the version of the addon to use
       */
      version: string;
    }[];
    /**
     * Bastion holds details of the instance that is used as a bastion jump box
     */
    bastion?: {
      /**
       * Addresses contains the AWS instance associated addresses.
       */
      addresses?: {
        /**
         * The machine address.
         */
        address: string;
        /**
         * Machine address type, one of Hostname, ExternalIP, InternalIP, ExternalDNS or InternalDNS.
         */
        type: string;
      }[];
      /**
       * Availability zone of instance
       */
      availabilityZone?: string;
      /**
       * CapacityReservationID specifies the target Capacity Reservation into which the instance should be launched.
       */
      capacityReservationId?: string;
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
       * InstanceMetadataOptions is the metadata options for the EC2 instance.
       */
      instanceMetadataOptions?: {
        /**
         * Enables or disables the HTTP metadata endpoint on your instances.
         *
         *
         * If you specify a value of disabled, you cannot access your instance metadata.
         *
         *
         * Default: enabled
         */
        httpEndpoint?: 'enabled' | 'disabled';
        /**
         * The desired HTTP PUT response hop limit for instance metadata requests. The
         * larger the number, the further instance metadata requests can travel.
         *
         *
         * Default: 1
         */
        httpPutResponseHopLimit?: number;
        /**
         * The state of token usage for your instance metadata requests.
         *
         *
         * If the state is optional, you can choose to retrieve instance metadata with
         * or without a session token on your request. If you retrieve the IAM role
         * credentials without a token, the version 1.0 role credentials are returned.
         * If you retrieve the IAM role credentials using a valid session token, the
         * version 2.0 role credentials are returned.
         *
         *
         * If the state is required, you must send a session token with any instance
         * metadata retrieval requests. In this state, retrieving the IAM role credentials
         * always returns the version 2.0 credentials; the version 1.0 credentials are
         * not available.
         *
         *
         * Default: optional
         */
        httpTokens?: 'optional' | 'required';
        /**
         * Set to enabled to allow access to instance tags from the instance metadata.
         * Set to disabled to turn off access to instance tags from the instance metadata.
         * For more information, see Work with instance tags using the instance metadata
         * (https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Using_Tags.html#work-with-tags-in-IMDS).
         *
         *
         * Default: disabled
         */
        instanceMetadataTags?: 'enabled' | 'disabled';
      };
      /**
       * The current state of the instance.
       */
      instanceState?: string;
      /**
       * Specifies ENIs attached to instance
       */
      networkInterfaces?: string[];
      /**
       * Configuration options for the non root storage volumes.
       */
      nonRootVolumes?: {
        /**
         * Device name
         */
        deviceName?: string;
        /**
         * Encrypted is whether the volume should be encrypted or not.
         */
        encrypted?: boolean;
        /**
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
      }[];
      /**
       * PlacementGroupName specifies the name of the placement group in which to launch the instance.
       */
      placementGroupName?: string;
      /**
       * PlacementGroupPartition is the partition number within the placement group in which to launch the instance.
       * This value is only valid if the placement group, referred in `PlacementGroupName`, was created with
       * strategy set to partition.
       */
      placementGroupPartition?: number;
      /**
       * PrivateDNSName is the options for the instance hostname.
       */
      privateDnsName?: {
        /**
         * EnableResourceNameDNSAAAARecord indicates whether to respond to DNS queries for instance hostnames with DNS AAAA records.
         */
        enableResourceNameDnsAAAARecord?: boolean;
        /**
         * EnableResourceNameDNSARecord indicates whether to respond to DNS queries for instance hostnames with DNS A records.
         */
        enableResourceNameDnsARecord?: boolean;
        /**
         * The type of hostname to assign to an instance.
         */
        hostnameType?: 'ip-name' | 'resource-name';
      };
      /**
       * The private IPv4 address assigned to the instance.
       */
      privateIp?: string;
      /**
       * PublicIPOnLaunch is the option to associate a public IP on instance launch
       */
      publicIPOnLaunch?: boolean;
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
         * EncryptionKey is the KMS key to use to encrypt the volume. Can be either a KMS key ID or ARN.
         * If Encrypted is set and this is omitted, the default AWS key will be used.
         * The key must already exist and be accessible by the controller.
         */
        encryptionKey?: string;
        /**
         * IOPS is the number of IOPS requested for the disk. Not applicable to all types.
         */
        iops?: number;
        /**
         * Size specifies size (in Gi) of the storage device.
         * Must be greater than the image snapshot size or 8 (whichever is greater).
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
      securityGroupIds?: string[];
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
        [k: string]: string;
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
       * UserData is the raw data script passed to the instance which is run upon bootstrap.
       * This field must not be base64 encoded and should only be used when running a new instance.
       */
      userData?: string;
      /**
       * IDs of the instance's volumes
       */
      volumeIDs?: string[];
    };
    /**
     * Conditions specifies the cpnditions for the managed control plane
     */
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another.
       * This should be when the underlying condition changed. If that is not known, then using the time when
       * the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition.
       * This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase.
       * The specific API may choose whether or not this field is considered a guaranteed API.
       * This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately
       * understand the current situation and act accordingly.
       * The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase.
       * Many .condition.type values are consistent across resources like Available, but because arbitrary conditions
       * can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
    /**
     * ExternalManagedControlPlane indicates to cluster-api that the control plane
     * is managed by an external service such as AKS, EKS, GKE, etc.
     */
    externalManagedControlPlane?: boolean;
    /**
     * FailureDomains specifies a list fo available availability zones that can be used
     */
    failureDomains?: {
      /**
       * FailureDomainSpec is the Schema for Cluster API failure domains.
       * It allows controllers to understand how many failure domains a cluster can optionally span across.
       */
      [k: string]: {
        /**
         * Attributes is a free form map of attributes an infrastructure provider might use or require.
         */
        attributes?: {
          [k: string]: string;
        };
        /**
         * ControlPlane determines if this failure domain is suitable for use by control plane machines.
         */
        controlPlane?: boolean;
      };
    };
    /**
     * ErrorMessage indicates that there is a terminal problem reconciling the
     * state, and will be set to a descriptive error message.
     */
    failureMessage?: string;
    /**
     * IdentityProviderStatus holds the status for
     * associated identity provider
     */
    identityProviderStatus?: {
      /**
       * ARN holds the ARN of associated identity provider
       */
      arn?: string;
      /**
       * Status holds current status of associated identity provider
       */
      status?: string;
    };
    /**
     * Initialized denotes whether or not the control plane has the
     * uploaded kubernetes config-map.
     */
    initialized?: boolean;
    /**
     * Networks holds details about the AWS networking resources used by the control plane
     */
    networkStatus?: {
      /**
       * APIServerELB is the Kubernetes api server load balancer.
       */
      apiServerElb?: {
        /**
         * ARN of the load balancer. Unlike the ClassicLB, ARN is used mostly
         * to define and get it.
         */
        arn?: string;
        /**
         * ClassicElbAttributes defines extra attributes associated with the load balancer.
         */
        attributes?: {
          /**
           * CrossZoneLoadBalancing enables the classic load balancer load balancing.
           */
          crossZoneLoadBalancing?: boolean;
          /**
           * IdleTimeout is time that the connection is allowed to be idle (no data
           * has been sent over the connection) before it is closed by the load balancer.
           */
          idleTimeout?: number;
        };
        /**
         * AvailabilityZones is an array of availability zones in the VPC attached to the load balancer.
         */
        availabilityZones?: string[];
        /**
         * DNSName is the dns name of the load balancer.
         */
        dnsName?: string;
        /**
         * ELBAttributes defines extra attributes associated with v2 load balancers.
         */
        elbAttributes?: {
          [k: string]: string;
        };
        /**
         * ELBListeners is an array of listeners associated with the load balancer. There must be at least one.
         */
        elbListeners?: {
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
          /**
           * TargetGroupSpec specifies target group settings for a given listener.
           * This is created first, and the ARN is then passed to the listener.
           */
          targetGroup: {
            /**
             * Name of the TargetGroup. Must be unique over the same group of listeners.
             */
            name: string;
            /**
             * Port is the exposed port
             */
            port: number;
            /**
             * ELBProtocol defines listener protocols for a load balancer.
             */
            protocol: 'tcp' | 'tls' | 'udp' | 'TCP' | 'TLS' | 'UDP';
            /**
             * HealthCheck is the elb health check associated with the load balancer.
             */
            targetGroupHealthCheck?: {
              intervalSeconds?: number;
              path?: string;
              port?: string;
              protocol?: string;
              thresholdCount?: number;
              timeoutSeconds?: number;
              unhealthyThresholdCount?: number;
            };
            vpcId: string;
          };
        }[];
        /**
         * HealthCheck is the classic elb health check associated with the load balancer.
         */
        healthChecks?: {
          healthyThreshold: number;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          interval: number;
          target: string;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          timeout: number;
          unhealthyThreshold: number;
        };
        /**
         * ClassicELBListeners is an array of classic elb listeners associated with the load balancer. There must be at least one.
         */
        listeners?: {
          instancePort: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          instanceProtocol: string;
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
        }[];
        /**
         * LoadBalancerType sets the type for a load balancer. The default type is classic.
         */
        loadBalancerType?: 'classic' | 'elb' | 'alb' | 'nlb';
        /**
         * The name of the load balancer. It must be unique within the set of load balancers
         * defined in the region. It also serves as identifier.
         */
        name?: string;
        /**
         * Scheme is the load balancer scheme, either internet-facing or private.
         */
        scheme?: string;
        /**
         * SecurityGroupIDs is an array of security groups assigned to the load balancer.
         */
        securityGroupIds?: string[];
        /**
         * SubnetIDs is an array of subnets in the VPC attached to the load balancer.
         */
        subnetIds?: string[];
        /**
         * Tags is a map of tags associated with the load balancer.
         */
        tags?: {
          [k: string]: string;
        };
      };
      /**
       * NatGatewaysIPs contains the public IPs of the NAT Gateways
       */
      natGatewaysIPs?: string[];
      /**
       * SecondaryAPIServerELB is the secondary Kubernetes api server load balancer.
       */
      secondaryAPIServerELB?: {
        /**
         * ARN of the load balancer. Unlike the ClassicLB, ARN is used mostly
         * to define and get it.
         */
        arn?: string;
        /**
         * ClassicElbAttributes defines extra attributes associated with the load balancer.
         */
        attributes?: {
          /**
           * CrossZoneLoadBalancing enables the classic load balancer load balancing.
           */
          crossZoneLoadBalancing?: boolean;
          /**
           * IdleTimeout is time that the connection is allowed to be idle (no data
           * has been sent over the connection) before it is closed by the load balancer.
           */
          idleTimeout?: number;
        };
        /**
         * AvailabilityZones is an array of availability zones in the VPC attached to the load balancer.
         */
        availabilityZones?: string[];
        /**
         * DNSName is the dns name of the load balancer.
         */
        dnsName?: string;
        /**
         * ELBAttributes defines extra attributes associated with v2 load balancers.
         */
        elbAttributes?: {
          [k: string]: string;
        };
        /**
         * ELBListeners is an array of listeners associated with the load balancer. There must be at least one.
         */
        elbListeners?: {
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
          /**
           * TargetGroupSpec specifies target group settings for a given listener.
           * This is created first, and the ARN is then passed to the listener.
           */
          targetGroup: {
            /**
             * Name of the TargetGroup. Must be unique over the same group of listeners.
             */
            name: string;
            /**
             * Port is the exposed port
             */
            port: number;
            /**
             * ELBProtocol defines listener protocols for a load balancer.
             */
            protocol: 'tcp' | 'tls' | 'udp' | 'TCP' | 'TLS' | 'UDP';
            /**
             * HealthCheck is the elb health check associated with the load balancer.
             */
            targetGroupHealthCheck?: {
              intervalSeconds?: number;
              path?: string;
              port?: string;
              protocol?: string;
              thresholdCount?: number;
              timeoutSeconds?: number;
              unhealthyThresholdCount?: number;
            };
            vpcId: string;
          };
        }[];
        /**
         * HealthCheck is the classic elb health check associated with the load balancer.
         */
        healthChecks?: {
          healthyThreshold: number;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          interval: number;
          target: string;
          /**
           * A Duration represents the elapsed time between two instants
           * as an int64 nanosecond count. The representation limits the
           * largest representable duration to approximately 290 years.
           */
          timeout: number;
          unhealthyThreshold: number;
        };
        /**
         * ClassicELBListeners is an array of classic elb listeners associated with the load balancer. There must be at least one.
         */
        listeners?: {
          instancePort: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          instanceProtocol: string;
          port: number;
          /**
           * ELBProtocol defines listener protocols for a load balancer.
           */
          protocol: string;
        }[];
        /**
         * LoadBalancerType sets the type for a load balancer. The default type is classic.
         */
        loadBalancerType?: 'classic' | 'elb' | 'alb' | 'nlb';
        /**
         * The name of the load balancer. It must be unique within the set of load balancers
         * defined in the region. It also serves as identifier.
         */
        name?: string;
        /**
         * Scheme is the load balancer scheme, either internet-facing or private.
         */
        scheme?: string;
        /**
         * SecurityGroupIDs is an array of security groups assigned to the load balancer.
         */
        securityGroupIds?: string[];
        /**
         * SubnetIDs is an array of subnets in the VPC attached to the load balancer.
         */
        subnetIds?: string[];
        /**
         * Tags is a map of tags associated with the load balancer.
         */
        tags?: {
          [k: string]: string;
        };
      };
      /**
       * SecurityGroups is a map from the role/kind of the security group to its unique name, if any.
       */
      securityGroups?: {
        /**
         * SecurityGroup defines an AWS security group.
         */
        [k: string]: {
          /**
           * ID is a unique identifier.
           */
          id: string;
          /**
           * IngressRules is the inbound rules associated with the security group.
           */
          ingressRule?: {
            /**
             * List of CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
             */
            cidrBlocks?: string[];
            /**
             * Description provides extended information about the ingress rule.
             */
            description: string;
            /**
             * FromPort is the start of port range.
             */
            fromPort: number;
            /**
             * List of IPv6 CIDR blocks to allow access from. Cannot be specified with SourceSecurityGroupID.
             */
            ipv6CidrBlocks?: string[];
            /**
             * NatGatewaysIPsSource use the NAT gateways IPs as the source for the ingress rule.
             */
            natGatewaysIPsSource?: boolean;
            /**
             * Protocol is the protocol for the ingress rule. Accepted values are "-1" (all), "4" (IP in IP),"tcp", "udp", "icmp", and "58" (ICMPv6), "50" (ESP).
             */
            protocol: '-1' | '4' | 'tcp' | 'udp' | 'icmp' | '58' | '50';
            /**
             * The security group id to allow access from. Cannot be specified with CidrBlocks.
             */
            sourceSecurityGroupIds?: string[];
            /**
             * The security group role to allow access from. Cannot be specified with CidrBlocks.
             * The field will be combined with source security group IDs if specified.
             */
            sourceSecurityGroupRoles?: (
              | 'bastion'
              | 'node'
              | 'controlplane'
              | 'apiserver-lb'
              | 'lb'
              | 'node-eks-additional'
            )[];
            /**
             * ToPort is the end of port range.
             */
            toPort: number;
          }[];
          /**
           * Name is the security group name.
           */
          name: string;
          /**
           * Tags is a map of tags associated with the security group.
           */
          tags?: {
            [k: string]: string;
          };
        };
      };
    };
    /**
     * OIDCProvider holds the status of the identity provider for this cluster
     */
    oidcProvider?: {
      /**
       * ARN holds the ARN of the provider
       */
      arn?: string;
      /**
       * TrustPolicy contains the boilerplate IAM trust policy to use for IRSA
       */
      trustPolicy?: string;
    };
    /**
     * Ready denotes that the AWSManagedControlPlane API Server is ready to
     * receive requests and that the VPC infra is ready.
     */
    ready: boolean;
  };
}

export const AWSManagedControlPlaneList = 'AWSManagedControlPlaneList';

export interface IAWSManagedControlPlaneList
  extends metav1.IList<IAWSManagedControlPlane> {
  apiVersion: 'controlplane.cluster.x-k8s.io/v1beta2';
  kind: typeof AWSManagedControlPlaneList;
}

export const AWSClusterRoleIdentity = 'AWSClusterRoleIdentity';

/**
 * AWSClusterRoleIdentity is the Schema for the awsclusterroleidentities API
 * It is used to assume a role using the provided sourceRef.
 */
export interface IAWSClusterRoleIdentity {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AWSClusterRoleIdentity;
  metadata: metav1.IObjectMeta;
  /**
   * Spec for this AWSClusterRoleIdentity.
   */
  spec?: {
    /**
     * AllowedNamespaces is used to identify which namespaces are allowed to use the identity from.
     * Namespaces can be selected either using an array of namespaces or with label selector.
     * An empty allowedNamespaces object indicates that AWSClusters can use this identity from any namespace.
     * If this object is nil, no namespaces will be allowed (default behaviour, if this field is not provided)
     * A namespace should be either in the NamespaceList or match with Selector to use the identity.
     */
    allowedNamespaces?: {
      /**
       * An nil or empty list indicates that AWSClusters cannot use the identity from any namespace.
       */
      list?: string[];
      /**
       * An empty selector indicates that AWSClusters cannot use this
       * AWSClusterIdentity from any namespace.
       */
      selector?: {
        /**
         * matchExpressions is a list of label selector requirements. The requirements are ANDed.
         */
        matchExpressions?: {
          /**
           * key is the label key that the selector applies to.
           */
          key: string;
          /**
           * operator represents a key's relationship to a set of values.
           * Valid operators are In, NotIn, Exists and DoesNotExist.
           */
          operator: string;
          /**
           * values is an array of string values. If the operator is In or NotIn,
           * the values array must be non-empty. If the operator is Exists or DoesNotExist,
           * the values array must be empty. This array is replaced during a strategic
           * merge patch.
           */
          values?: string[];
        }[];
        /**
         * matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels
         * map is equivalent to an element of matchExpressions, whose key field is "key", the
         * operator is "In", and the values array contains only "value". The requirements are ANDed.
         */
        matchLabels?: {
          [k: string]: string;
        };
      };
    };
    /**
     * The duration, in seconds, of the role session before it is renewed.
     */
    durationSeconds?: number;
    /**
     * A unique identifier that might be required when you assume a role in another account.
     * If the administrator of the account to which the role belongs provided you with an
     * external ID, then provide that value in the ExternalId parameter. This value can be
     * any string, such as a passphrase or account number. A cross-account role is usually
     * set up to trust everyone in an account. Therefore, the administrator of the trusting
     * account might send an external ID to the administrator of the trusted account. That
     * way, only someone with the ID can assume the role, rather than everyone in the
     * account. For more information about the external ID, see How to Use an External ID
     * When Granting Access to Your AWS Resources to a Third Party in the IAM User Guide.
     */
    externalID?: string;
    /**
     * An IAM policy as a JSON-encoded string that you want to use as an inline session policy.
     */
    inlinePolicy?: string;
    /**
     * The Amazon Resource Names (ARNs) of the IAM managed policies that you want
     * to use as managed session policies.
     * The policies must exist in the same account as the role.
     */
    policyARNs?: string[];
    /**
     * The Amazon Resource Name (ARN) of the role to assume.
     */
    roleARN: string;
    /**
     * An identifier for the assumed role session
     */
    sessionName?: string;
    /**
     * SourceIdentityRef is a reference to another identity which will be chained to do
     * role assumption. All identity types are accepted.
     */
    sourceIdentityRef?: {
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
  };
}

export const AWSClusterRoleIdentityList = 'AWSClusterRoleIdentityList';

export interface IAWSClusterRoleIdentityList
  extends metav1.IList<IAWSClusterRoleIdentity> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2';
  kind: typeof AWSClusterRoleIdentityList;
}
