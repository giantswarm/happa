/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import * as metav1 from 'model/services/mapi/metav1';

export const ApiGroup = 'infrastructure.cluster.x-k8s.io';

export const ApiVersion = 'infrastructure.cluster.x-k8s.io/v1beta1';

export const GCPCluster = 'GCPCluster';

/**
 * GCPCluster is the Schema for the gcpclusters API.
 */
export interface IGCPCluster {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof GCPCluster;
  metadata: metav1.IObjectMeta;
  /**
   * GCPClusterSpec defines the desired state of GCPCluster.
   */
  spec?: {
    /**
     * AdditionalLabels is an optional set of tags to add to GCP resources managed by the GCP provider, in addition to the ones added by default.
     */
    additionalLabels?: {
      [k: string]: string;
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
     * CredentialsRef is a reference to a Secret that contains the credentials to use for provisioning this cluster. If not supplied then the credentials of the controller will be used.
     */
    credentialsRef?: {
      /**
       * Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
       */
      name: string;
      /**
       * Namespace of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
       */
      namespace: string;
    };
    /**
     * FailureDomains is an optional field which is used to assign selected availability zones to a cluster FailureDomains if empty, defaults to all the zones in the selected region and if specified would override the default zones.
     */
    failureDomains?: string[];
    /**
     * NetworkSpec encapsulates all things related to GCP network.
     */
    network?: {
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
      /**
       * Subnets configuration.
       */
      subnets?: {
        /**
         * CidrBlock is the range of internal addresses that are owned by this subnetwork. Provide this property when you create the subnetwork. For example, 10.0.0.0/8 or 192.168.0.0/16. Ranges must be unique and non-overlapping within a network. Only IPv4 is supported. This field can be set only at resource creation time.
         */
        cidrBlock?: string;
        /**
         * Description is an optional description associated with the resource.
         */
        description?: string;
        /**
         * EnableFlowLogs: Whether to enable flow logging for this subnetwork. If this field is not explicitly set, it will not appear in get listings. If not set the default behavior is to disable flow logging.
         */
        enableFlowLogs?: boolean;
        /**
         * Name defines a unique identifier to reference this resource.
         */
        name?: string;
        /**
         * PrivateGoogleAccess defines whether VMs in this subnet can access Google services without assigning external IP addresses
         */
        privateGoogleAccess?: boolean;
        /**
         * Purpose: The purpose of the resource. If unspecified, the purpose defaults to PRIVATE_RFC_1918. The enableFlowLogs field isn't supported with the purpose field set to INTERNAL_HTTPS_LOAD_BALANCER.
         *  Possible values: "INTERNAL_HTTPS_LOAD_BALANCER" - Subnet reserved for Internal HTTP(S) Load Balancing. "PRIVATE" - Regular user created or automatically created subnet. "PRIVATE_RFC_1918" - Regular user created or automatically created subnet. "PRIVATE_SERVICE_CONNECT" - Subnetworks created for Private Service Connect in the producer network. "REGIONAL_MANAGED_PROXY" - Subnetwork used for Regional Internal/External HTTP(S) Load Balancing.
         */
        purpose?:
          | 'INTERNAL_HTTPS_LOAD_BALANCER'
          | 'PRIVATE_RFC_1918'
          | 'PRIVATE'
          | 'PRIVATE_SERVICE_CONNECT'
          | 'REGIONAL_MANAGED_PROXY';
        /**
         * Region is the name of the region where the Subnetwork resides.
         */
        region?: string;
        /**
         * SecondaryCidrBlocks defines secondary CIDR ranges, from which secondary IP ranges of a VM may be allocated
         */
        secondaryCidrBlocks?: {
          [k: string]: string;
        };
      }[];
    };
    /**
     * Project is the name of the project to deploy the cluster to.
     */
    project: string;
    /**
     * The GCP Region the cluster lives in.
     */
    region: string;
  };
  /**
   * GCPClusterStatus defines the observed state of GCPCluster.
   */
  status?: {
    /**
     * FailureDomains is a slice of FailureDomains.
     */
    failureDomains?: {
      /**
       * FailureDomainSpec is the Schema for Cluster API failure domains. It allows controllers to understand how many failure domains a cluster can optionally span across.
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
     * Network encapsulates GCP networking resources.
     */
    network?: {
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
      apiServerInstanceGroups?: {
        [k: string]: string;
      };
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
      firewallRules?: {
        [k: string]: string;
      };
      /**
       * Router is the full reference to the router created within the network it'll contain the cloud nat gateway
       */
      router?: string;
      /**
       * SelfLink is the link to the Network used for this cluster.
       */
      selfLink?: string;
    };
    /**
     * Bastion Instance `json:"bastion,omitempty"`
     */
    ready: boolean;
  };
}

export const GCPClusterList = 'GCPClusterList';

export interface IGCPClusterList extends metav1.IList<IGCPCluster> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  kind: typeof GCPClusterList;
}

export const GCPMachineTemplate = 'GCPMachineTemplate';

/**
 * GCPMachineTemplate is the Schema for the gcpmachinetemplates API.
 */
export interface IGCPMachineTemplate {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof GCPMachineTemplate;
  metadata: metav1.IObjectMeta;
  /**
   * GCPMachineTemplateSpec defines the desired state of GCPMachineTemplate.
   */
  spec?: {
    /**
     * GCPMachineTemplateResource describes the data needed to create am GCPMachine from a template.
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
          [k: string]: string;
        };
        /**
         * Map of string keys and values that can be used to organize and categorize (scope and select) objects. May match selectors of replication controllers and services. More info: http://kubernetes.io/docs/user-guide/labels
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
         * AdditionalDisks are optional non-boot attached disks.
         */
        additionalDisks?: {
          /**
           * DeviceType is a device type of the attached disk. Supported types of non-root attached volumes: 1. "pd-standard" - Standard (HDD) persistent disk 2. "pd-ssd" - SSD persistent disk 3. "local-ssd" - Local SSD disk (https://cloud.google.com/compute/docs/disks/local-ssd). Default is "pd-standard".
           */
          deviceType?: string;
          /**
           * Size is the size of the disk in GBs. Defaults to 30GB. For "local-ssd" size is always 375GB.
           */
          size?: number;
        }[];
        /**
         * AdditionalLabels is an optional set of tags to add to an instance, in addition to the ones added by default by the GCP provider. If both the GCPCluster and the GCPMachine specify the same tag name with different values, the GCPMachine's value takes precedence.
         */
        additionalLabels?: {
          [k: string]: string;
        };
        /**
         * AdditionalMetadata is an optional set of metadata to add to an instance, in addition to the ones added by default by the GCP provider.
         */
        additionalMetadata?: {
          /**
           * Key is the identifier for the metadata entry.
           */
          key: string;
          /**
           * Value is the value of the metadata entry.
           */
          value?: string;
        }[];
        /**
         * AdditionalNetworkTags is a list of network tags that should be applied to the instance. These tags are set in addition to any network tags defined at the cluster level or in the actuator.
         */
        additionalNetworkTags?: string[];
        /**
         * ConfidentialCompute Defines whether the instance should have confidential compute enabled. If enabled OnHostMaintenance is required to be set to "Terminate". If omitted, the platform chooses a default, which is subject to change over time, currently that default is false.
         */
        confidentialCompute?: 'Enabled' | 'Disabled';
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
         * IPForwarding Allows this instance to send and receive packets with non-matching destination or source IPs. This is required if you plan to use this instance to forward routes. Defaults to enabled.
         */
        ipForwarding?: 'Enabled' | 'Disabled';
        /**
         * OnHostMaintenance determines the behavior when a maintenance event occurs that might cause the instance to reboot. If omitted, the platform chooses a default, which is subject to change over time, currently that default is "Migrate".
         */
        onHostMaintenance?: 'Migrate' | 'Terminate';
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
        rootDeviceType?: string;
        /**
         * ServiceAccount specifies the service account email and which scopes to assign to the machine. Defaults to: email: "default", scope: []{compute.CloudPlatformScope}
         */
        serviceAccounts?: {
          /**
           * Email: Email address of the service account.
           */
          email?: string;
          /**
           * Scopes: The list of scopes to be made available for this service account.
           */
          scopes?: string[];
        };
        /**
         * ShieldedInstanceConfig is the Shielded VM configuration for this machine
         */
        shieldedInstanceConfig?: {
          /**
           * IntegrityMonitoring determines whether the instance should have integrity monitoring that verify the runtime boot integrity. Compares the most recent boot measurements to the integrity policy baseline and return a pair of pass/fail results depending on whether they match or not. If omitted, the platform chooses a default, which is subject to change over time, currently that default is Enabled.
           */
          integrityMonitoring?: 'Enabled' | 'Disabled';
          /**
           * SecureBoot Defines whether the instance should have secure boot enabled. Secure Boot verify the digital signature of all boot components, and halting the boot process if signature verification fails. If omitted, the platform chooses a default, which is subject to change over time, currently that default is Disabled.
           */
          secureBoot?: 'Enabled' | 'Disabled';
          /**
           * VirtualizedTrustedPlatformModule enable virtualized trusted platform module measurements to create a known good boot integrity policy baseline. The integrity policy baseline is used for comparison with measurements from subsequent VM boots to determine if anything has changed. If omitted, the platform chooses a default, which is subject to change over time, currently that default is Enabled.
           */
          virtualizedTrustedPlatformModule?: 'Enabled' | 'Disabled';
        };
        /**
         * Subnet is a reference to the subnetwork to use for this instance. If not specified, the first subnetwork retrieved from the Cluster Region and Network is picked.
         */
        subnet?: string;
      };
    };
  };
}

export const GCPMachineTemplateList = 'GCPMachineTemplateList';

export interface IGCPMachineTemplateList
  extends metav1.IList<IGCPMachineTemplate> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  kind: typeof GCPMachineTemplateList;
}
