/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import * as metav1 from 'model/services/mapi/metav1';

export const AzureCluster = 'AzureCluster';

export const AzureClusterApiVersion = 'infrastructure.cluster.x-k8s.io/v1beta1';

/**
 * AzureCluster is the Schema for the azureclusters API.
 */
export interface IAzureCluster {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureCluster;
  metadata: metav1.IObjectMeta;
  /**
   * AzureClusterSpec defines the desired state of AzureCluster.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to Azure resources managed by the Azure provider, in addition to the ones added by default.
     */
    additionalTags?: {
      [k: string]: string;
    };
    /**
     * AzureEnvironment is the name of the AzureCloud to be used. The default value that would be used by most users is "AzurePublicCloud", other values are: - ChinaCloud: "AzureChinaCloud" - GermanCloud: "AzureGermanCloud" - PublicCloud: "AzurePublicCloud" - USGovernmentCloud: "AzureUSGovernmentCloud"
     */
    azureEnvironment?: string;
    /**
     * BastionSpec encapsulates all things related to the Bastions in the cluster.
     */
    bastionSpec?: {
      /**
       * AzureBastion specifies how the Azure Bastion cloud component should be configured.
       */
      azureBastion?: {
        /**
         * EnableTunneling enables the native client support feature for the Azure Bastion Host. Defaults to false.
         */
        enableTunneling?: boolean;
        name?: string;
        /**
         * PublicIPSpec defines the inputs to create an Azure public IP address.
         */
        publicIP?: {
          dnsName?: string;
          ipTags?: {
            /**
             * Tag specifies the value of the IP tag associated with the public IP. Example: SQL.
             */
            tag: string;
            /**
             * Type specifies the IP tag type. Example: FirstPartyUsage.
             */
            type: string;
          }[];
          name: string;
        };
        /**
         * BastionHostSkuName configures the tier of the Azure Bastion Host. Can be either Basic or Standard. Defaults to Basic.
         */
        sku?: 'Basic' | 'Standard';
        /**
         * SubnetSpec configures an Azure subnet.
         */
        subnet?: {
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
           * NatGateway associated with this subnet.
           */
          natGateway?: {
            /**
             * ID is the Azure resource ID of the NAT gateway. READ-ONLY
             */
            id?: string;
            /**
             * PublicIPSpec defines the inputs to create an Azure public IP address.
             */
            ip?: {
              dnsName?: string;
              ipTags?: {
                /**
                 * Tag specifies the value of the IP tag associated with the public IP. Example: SQL.
                 */
                tag: string;
                /**
                 * Type specifies the IP tag type. Example: FirstPartyUsage.
                 */
                type: string;
              }[];
              name: string;
            };
            name: string;
          };
          /**
           * PrivateEndpoints defines a list of private endpoints that should be attached to this subnet.
           */
          privateEndpoints?: {
            /**
             * ApplicationSecurityGroups specifies the Application security group in which the private endpoint IP configuration is included.
             */
            applicationSecurityGroups?: string[];
            /**
             * CustomNetworkInterfaceName specifies the network interface name associated with the private endpoint.
             */
            customNetworkInterfaceName?: string;
            /**
             * Location specifies the region to create the private endpoint.
             */
            location?: string;
            /**
             * ManualApproval specifies if the connection approval needs to be done manually or not. Set it true when the network admin does not have access to approve connections to the remote resource. Defaults to false.
             */
            manualApproval?: boolean;
            /**
             * Name specifies the name of the private endpoint.
             */
            name: string;
            /**
             * PrivateIPAddresses specifies the IP addresses for the network interface associated with the private endpoint. They have to be part of the subnet where the private endpoint is linked.
             */
            privateIPAddresses?: string[];
            /**
             * PrivateLinkServiceConnections specifies Private Link Service Connections of the private endpoint.
             */
            privateLinkServiceConnections?: {
              /**
               * GroupIDs specifies the ID(s) of the group(s) obtained from the remote resource that this private endpoint should connect to.
               */
              groupIDs?: string[];
              /**
               * Name specifies the name of the private link service.
               */
              name?: string;
              /**
               * PrivateLinkServiceID specifies the resource ID of the private link service.
               */
              privateLinkServiceID?: string;
              /**
               * RequestMessage specifies a message passed to the owner of the remote resource with the private endpoint connection request.
               */
              requestMessage?: string;
            }[];
          }[];
          /**
           * Role defines the subnet role (eg. Node, ControlPlane)
           */
          role: 'node' | 'control-plane' | 'bastion';
          /**
           * RouteTable defines the route table that should be attached to this subnet.
           */
          routeTable?: {
            /**
             * ID is the Azure resource ID of the route table. READ-ONLY
             */
            id?: string;
            name: string;
          };
          /**
           * SecurityGroup defines the NSG (network security group) that should be attached to this subnet.
           */
          securityGroup?: {
            /**
             * ID is the Azure resource ID of the security group. READ-ONLY
             */
            id?: string;
            name: string;
            /**
             * SecurityRules is a slice of Azure security rules for security groups.
             */
            securityRules?: {
              /**
               * Action specifies whether network traffic is allowed or denied. Can either be "Allow" or "Deny". Defaults to "Allow".
               */
              action?: 'Allow' | 'Deny';
              /**
               * A description for this rule. Restricted to 140 chars.
               */
              description: string;
              /**
               * Destination is the destination address prefix. CIDR or destination IP range. Asterix '*' can also be used to match all source IPs. Default tags such as 'VirtualNetwork', 'AzureLoadBalancer' and 'Internet' can also be used.
               */
              destination?: string;
              /**
               * DestinationPorts specifies the destination port or range. Integer or range between 0 and 65535. Asterix '*' can also be used to match all ports.
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
               * Protocol specifies the protocol type. "Tcp", "Udp", "Icmp", or "*".
               */
              protocol: 'Tcp' | 'Udp' | 'Icmp' | '*';
              /**
               * Source specifies the CIDR or source IP range. Asterix '*' can also be used to match all source IPs. Default tags such as 'VirtualNetwork', 'AzureLoadBalancer' and 'Internet' can also be used. If this is an ingress rule, specifies where network traffic originates from.
               */
              source?: string;
              /**
               * SourcePorts specifies source port or range. Integer or range between 0 and 65535. Asterix '*' can also be used to match all ports.
               */
              sourcePorts?: string;
            }[];
            /**
             * Tags defines a map of tags.
             */
            tags?: {
              [k: string]: string;
            };
          };
          /**
           * ServiceEndpoints is a slice of Virtual Network service endpoints to enable for the subnets.
           */
          serviceEndpoints?: {
            locations: string[];
            service: string;
          }[];
        };
      };
    };
    /**
     * CloudProviderConfigOverrides is an optional set of configuration values that can be overridden in azure cloud provider config. This is only a subset of options that are available in azure cloud provider config. Some values for the cloud provider config are inferred from other parts of cluster api provider azure spec, and may not be available for overrides. See: https://cloud-provider-azure.sigs.k8s.io/install/configs Note: All cloud provider config values can be customized by creating the secret beforehand. CloudProviderConfigOverrides is only used when the secret is managed by the Azure Provider.
     */
    cloudProviderConfigOverrides?: {
      /**
       * BackOffConfig indicates the back-off config options.
       */
      backOffs?: {
        cloudProviderBackoff?: boolean;
        cloudProviderBackoffDuration?: number;
        cloudProviderBackoffExponent?: number | string;
        cloudProviderBackoffJitter?: number | string;
        cloudProviderBackoffRetries?: number;
      };
      rateLimits?: {
        /**
         * RateLimitConfig indicates the rate limit config options.
         */
        config?: {
          cloudProviderRateLimit?: boolean;
          cloudProviderRateLimitBucket?: number;
          cloudProviderRateLimitBucketWrite?: number;
          cloudProviderRateLimitQPS?: number | string;
          cloudProviderRateLimitQPSWrite?: number | string;
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
      }[];
    };
    /**
     * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane. It is not recommended to set this when creating an AzureCluster as CAPZ will set this for you. However, if it is set, CAPZ will not change it.
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
     * ExtendedLocation is an optional set of ExtendedLocation properties for clusters on Azure public MEC.
     */
    extendedLocation?: {
      /**
       * Name defines the name for the extended location.
       */
      name: string;
      /**
       * Type defines the type for the extended location.
       */
      type: 'EdgeZone';
    };
    /**
     * IdentityRef is a reference to an AzureIdentity to be used when reconciling this cluster
     */
    identityRef?: {
      /**
       * API version of the referent.
       */
      apiVersion?: string;
      /**
       * If referring to a piece of an object instead of an entire object, this string should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2]. For example, if the object reference is to a container within a pod, this would take on a value like: "spec.containers{name}" (where "name" refers to the name of the container that triggered the event) or if no container name is specified "spec.containers[2]" (container with index 2 in this pod). This syntax is chosen only to have some well-defined way of referencing a part of an object. TODO: this design is not final and this field is subject to change in the future.
       */
      fieldPath?: string;
      /**
       * Kind of the referent. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
       */
      kind?: string;
      /**
       * Name of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
       */
      name?: string;
      /**
       * Namespace of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
       */
      namespace?: string;
      /**
       * Specific resourceVersion to which this reference is made, if any. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency
       */
      resourceVersion?: string;
      /**
       * UID of the referent. More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids
       */
      uid?: string;
    };
    location: string;
    /**
     * NetworkSpec encapsulates all things related to Azure network.
     */
    networkSpec?: {
      /**
       * APIServerLB is the configuration for the control-plane load balancer.
       */
      apiServerLB?: {
        /**
         * BackendPool describes the backend pool of the load balancer.
         */
        backendPool?: {
          /**
           * Name specifies the name of backend pool for the load balancer. If not specified, the default name will be set, depending on the load balancer role.
           */
          name?: string;
        };
        frontendIPs?: {
          name: string;
          privateIP?: string;
          /**
           * PublicIPSpec defines the inputs to create an Azure public IP address.
           */
          publicIP?: {
            dnsName?: string;
            ipTags?: {
              /**
               * Tag specifies the value of the IP tag associated with the public IP. Example: SQL.
               */
              tag: string;
              /**
               * Type specifies the IP tag type. Example: FirstPartyUsage.
               */
              type: string;
            }[];
            name: string;
          };
        }[];
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
       * ControlPlaneOutboundLB is the configuration for the control-plane outbound load balancer. This is different from APIServerLB, and is used only in private clusters (optionally) for enabling outbound traffic.
       */
      controlPlaneOutboundLB?: {
        /**
         * BackendPool describes the backend pool of the load balancer.
         */
        backendPool?: {
          /**
           * Name specifies the name of backend pool for the load balancer. If not specified, the default name will be set, depending on the load balancer role.
           */
          name?: string;
        };
        frontendIPs?: {
          name: string;
          privateIP?: string;
          /**
           * PublicIPSpec defines the inputs to create an Azure public IP address.
           */
          publicIP?: {
            dnsName?: string;
            ipTags?: {
              /**
               * Tag specifies the value of the IP tag associated with the public IP. Example: SQL.
               */
              tag: string;
              /**
               * Type specifies the IP tag type. Example: FirstPartyUsage.
               */
              type: string;
            }[];
            name: string;
          };
        }[];
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
        /**
         * BackendPool describes the backend pool of the load balancer.
         */
        backendPool?: {
          /**
           * Name specifies the name of backend pool for the load balancer. If not specified, the default name will be set, depending on the load balancer role.
           */
          name?: string;
        };
        frontendIPs?: {
          name: string;
          privateIP?: string;
          /**
           * PublicIPSpec defines the inputs to create an Azure public IP address.
           */
          publicIP?: {
            dnsName?: string;
            ipTags?: {
              /**
               * Tag specifies the value of the IP tag associated with the public IP. Example: SQL.
               */
              tag: string;
              /**
               * Type specifies the IP tag type. Example: FirstPartyUsage.
               */
              type: string;
            }[];
            name: string;
          };
        }[];
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
      subnets?: {
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
         * NatGateway associated with this subnet.
         */
        natGateway?: {
          /**
           * ID is the Azure resource ID of the NAT gateway. READ-ONLY
           */
          id?: string;
          /**
           * PublicIPSpec defines the inputs to create an Azure public IP address.
           */
          ip?: {
            dnsName?: string;
            ipTags?: {
              /**
               * Tag specifies the value of the IP tag associated with the public IP. Example: SQL.
               */
              tag: string;
              /**
               * Type specifies the IP tag type. Example: FirstPartyUsage.
               */
              type: string;
            }[];
            name: string;
          };
          name: string;
        };
        /**
         * PrivateEndpoints defines a list of private endpoints that should be attached to this subnet.
         */
        privateEndpoints?: {
          /**
           * ApplicationSecurityGroups specifies the Application security group in which the private endpoint IP configuration is included.
           */
          applicationSecurityGroups?: string[];
          /**
           * CustomNetworkInterfaceName specifies the network interface name associated with the private endpoint.
           */
          customNetworkInterfaceName?: string;
          /**
           * Location specifies the region to create the private endpoint.
           */
          location?: string;
          /**
           * ManualApproval specifies if the connection approval needs to be done manually or not. Set it true when the network admin does not have access to approve connections to the remote resource. Defaults to false.
           */
          manualApproval?: boolean;
          /**
           * Name specifies the name of the private endpoint.
           */
          name: string;
          /**
           * PrivateIPAddresses specifies the IP addresses for the network interface associated with the private endpoint. They have to be part of the subnet where the private endpoint is linked.
           */
          privateIPAddresses?: string[];
          /**
           * PrivateLinkServiceConnections specifies Private Link Service Connections of the private endpoint.
           */
          privateLinkServiceConnections?: {
            /**
             * GroupIDs specifies the ID(s) of the group(s) obtained from the remote resource that this private endpoint should connect to.
             */
            groupIDs?: string[];
            /**
             * Name specifies the name of the private link service.
             */
            name?: string;
            /**
             * PrivateLinkServiceID specifies the resource ID of the private link service.
             */
            privateLinkServiceID?: string;
            /**
             * RequestMessage specifies a message passed to the owner of the remote resource with the private endpoint connection request.
             */
            requestMessage?: string;
          }[];
        }[];
        /**
         * Role defines the subnet role (eg. Node, ControlPlane)
         */
        role: 'node' | 'control-plane' | 'bastion';
        /**
         * RouteTable defines the route table that should be attached to this subnet.
         */
        routeTable?: {
          /**
           * ID is the Azure resource ID of the route table. READ-ONLY
           */
          id?: string;
          name: string;
        };
        /**
         * SecurityGroup defines the NSG (network security group) that should be attached to this subnet.
         */
        securityGroup?: {
          /**
           * ID is the Azure resource ID of the security group. READ-ONLY
           */
          id?: string;
          name: string;
          /**
           * SecurityRules is a slice of Azure security rules for security groups.
           */
          securityRules?: {
            /**
             * Action specifies whether network traffic is allowed or denied. Can either be "Allow" or "Deny". Defaults to "Allow".
             */
            action?: 'Allow' | 'Deny';
            /**
             * A description for this rule. Restricted to 140 chars.
             */
            description: string;
            /**
             * Destination is the destination address prefix. CIDR or destination IP range. Asterix '*' can also be used to match all source IPs. Default tags such as 'VirtualNetwork', 'AzureLoadBalancer' and 'Internet' can also be used.
             */
            destination?: string;
            /**
             * DestinationPorts specifies the destination port or range. Integer or range between 0 and 65535. Asterix '*' can also be used to match all ports.
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
             * Protocol specifies the protocol type. "Tcp", "Udp", "Icmp", or "*".
             */
            protocol: 'Tcp' | 'Udp' | 'Icmp' | '*';
            /**
             * Source specifies the CIDR or source IP range. Asterix '*' can also be used to match all source IPs. Default tags such as 'VirtualNetwork', 'AzureLoadBalancer' and 'Internet' can also be used. If this is an ingress rule, specifies where network traffic originates from.
             */
            source?: string;
            /**
             * SourcePorts specifies source port or range. Integer or range between 0 and 65535. Asterix '*' can also be used to match all ports.
             */
            sourcePorts?: string;
          }[];
          /**
           * Tags defines a map of tags.
           */
          tags?: {
            [k: string]: string;
          };
        };
        /**
         * ServiceEndpoints is a slice of Virtual Network service endpoints to enable for the subnets.
         */
        serviceEndpoints?: {
          locations: string[];
          service: string;
        }[];
      }[];
      /**
       * Vnet is the configuration for the Azure virtual network.
       */
      vnet?: {
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
        peerings?: {
          /**
           * ForwardPeeringProperties specifies VnetPeeringProperties for peering from the cluster's virtual network to the remote virtual network.
           */
          forwardPeeringProperties?: {
            /**
             * AllowForwardedTraffic specifies whether the forwarded traffic from the VMs in the local virtual network will be allowed/disallowed in remote virtual network.
             */
            allowForwardedTraffic?: boolean;
            /**
             * AllowGatewayTransit specifies if gateway links can be used in remote virtual networking to link to this virtual network.
             */
            allowGatewayTransit?: boolean;
            /**
             * AllowVirtualNetworkAccess specifies whether the VMs in the local virtual network space would be able to access the VMs in remote virtual network space.
             */
            allowVirtualNetworkAccess?: boolean;
            /**
             * UseRemoteGateways specifies if remote gateways can be used on this virtual network. If the flag is set to true, and allowGatewayTransit on remote peering is also set to true, the virtual network will use the gateways of the remote virtual network for transit. Only one peering can have this flag set to true. This flag cannot be set if virtual network already has a gateway.
             */
            useRemoteGateways?: boolean;
          };
          /**
           * RemoteVnetName defines name of the remote virtual network.
           */
          remoteVnetName: string;
          /**
           * ResourceGroup is the resource group name of the remote virtual network.
           */
          resourceGroup?: string;
          /**
           * ReversePeeringProperties specifies VnetPeeringProperties for peering from the remote virtual network to the cluster's virtual network.
           */
          reversePeeringProperties?: {
            /**
             * AllowForwardedTraffic specifies whether the forwarded traffic from the VMs in the local virtual network will be allowed/disallowed in remote virtual network.
             */
            allowForwardedTraffic?: boolean;
            /**
             * AllowGatewayTransit specifies if gateway links can be used in remote virtual networking to link to this virtual network.
             */
            allowGatewayTransit?: boolean;
            /**
             * AllowVirtualNetworkAccess specifies whether the VMs in the local virtual network space would be able to access the VMs in remote virtual network space.
             */
            allowVirtualNetworkAccess?: boolean;
            /**
             * UseRemoteGateways specifies if remote gateways can be used on this virtual network. If the flag is set to true, and allowGatewayTransit on remote peering is also set to true, the virtual network will use the gateways of the remote virtual network for transit. Only one peering can have this flag set to true. This flag cannot be set if virtual network already has a gateway.
             */
            useRemoteGateways?: boolean;
          };
        }[];
        /**
         * ResourceGroup is the name of the resource group of the existing virtual network or the resource group where a managed virtual network should be created.
         */
        resourceGroup?: string;
        /**
         * Tags is a collection of tags describing the resource.
         */
        tags?: {
          [k: string]: string;
        };
      };
    };
    resourceGroup?: string;
    subscriptionID?: string;
  };
  /**
   * AzureClusterStatus defines the observed state of AzureCluster.
   */
  status?: {
    /**
     * Conditions defines current service state of the AzureCluster.
     */
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another. This should be when the underlying condition changed. If that is not known, then using the time when the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition. This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase. The specific API may choose whether or not this field is considered a guaranteed API. This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately understand the current situation and act accordingly. The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase. Many .condition.type values are consistent across resources like Available, but because arbitrary conditions can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
    /**
     * FailureDomains specifies the list of unique failure domains for the location/region of the cluster. A FailureDomain maps to Availability Zone with an Azure Region (if the region support them). An Availability Zone is a separate data center within a region and they can be used to ensure the cluster is more resilient to failure. See: https://learn.microsoft.com/azure/reliability/availability-zones-overview This list will be used by Cluster API to try and spread the machines across the failure domains.
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
     * LongRunningOperationStates saves the states for Azure long-running operations so they can be continued on the next reconciliation loop.
     */
    longRunningOperationStates?: {
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
    }[];
    /**
     * Ready is true when the provider resource is ready.
     */
    ready?: boolean;
  };
}

export const AzureClusterList = 'AzureClusterList';

export const AzureClusterListApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

export interface IAzureClusterList extends metav1.IList<IAzureCluster> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  kind: typeof AzureClusterList;
}

export const AzureClusterIdentity = 'AzureClusterIdentity';

export const AzureClusterIdentityApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

/**
 * AzureClusterIdentity is the Schema for the azureclustersidentities API.
 */
export interface IAzureClusterIdentity {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureClusterIdentity;
  metadata: metav1.IObjectMeta;
  /**
   * AzureClusterIdentitySpec defines the parameters that are used to create an AzureIdentity.
   */
  spec?: {
    /**
     * AllowedNamespaces is used to identify the namespaces the clusters are allowed to use the identity from. Namespaces can be selected either using an array of namespaces or with label selector. An empty allowedNamespaces object indicates that AzureClusters can use this identity from any namespace. If this object is nil, no namespaces will be allowed (default behaviour, if this field is not provided) A namespace should be either in the NamespaceList or match with Selector to use the identity.
     */
    allowedNamespaces?: {
      /**
       * A nil or empty list indicates that AzureCluster cannot use the identity from any namespace.
       */
      list?: string[];
      /**
       * Selector is a selector of namespaces that AzureCluster can use this Identity from. This is a standard Kubernetes LabelSelector, a label query over a set of resources. The result of matchLabels and matchExpressions are ANDed.
       *  A nil or empty selector indicates that AzureCluster cannot use this AzureClusterIdentity from any namespace.
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
           * operator represents a key's relationship to a set of values. Valid operators are In, NotIn, Exists and DoesNotExist.
           */
          operator: string;
          /**
           * values is an array of string values. If the operator is In or NotIn, the values array must be non-empty. If the operator is Exists or DoesNotExist, the values array must be empty. This array is replaced during a strategic merge patch.
           */
          values?: string[];
        }[];
        /**
         * matchLabels is a map of {key,value} pairs. A single {key,value} in the matchLabels map is equivalent to an element of matchExpressions, whose key field is "key", the operator is "In", and the values array contains only "value". The requirements are ANDed.
         */
        matchLabels?: {
          [k: string]: string;
        };
      };
    };
    /**
     * ClientID is the service principal client ID. Both User Assigned MSI and SP can use this field.
     */
    clientID: string;
    /**
     * ClientSecret is a secret reference which should contain either a Service Principal password or certificate secret.
     */
    clientSecret?: {
      /**
       * name is unique within a namespace to reference a secret resource.
       */
      name?: string;
      /**
       * namespace defines the space within which the secret name must be unique.
       */
      namespace?: string;
    };
    /**
     * ResourceID is the Azure resource ID for the User Assigned MSI resource. Only applicable when type is UserAssignedMSI.
     */
    resourceID?: string;
    /**
     * TenantID is the service principal primary tenant id.
     */
    tenantID: string;
    /**
     * Type is the type of Azure Identity used. ServicePrincipal, ServicePrincipalCertificate, UserAssignedMSI, ManualServicePrincipal or WorkloadIdentity.
     */
    type:
      | 'ServicePrincipal'
      | 'UserAssignedMSI'
      | 'ManualServicePrincipal'
      | 'ServicePrincipalCertificate'
      | 'WorkloadIdentity';
  };
  /**
   * AzureClusterIdentityStatus defines the observed state of AzureClusterIdentity.
   */
  status?: {
    /**
     * Conditions defines current service state of the AzureClusterIdentity.
     */
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another. This should be when the underlying condition changed. If that is not known, then using the time when the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition. This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase. The specific API may choose whether or not this field is considered a guaranteed API. This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately understand the current situation and act accordingly. The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase. Many .condition.type values are consistent across resources like Available, but because arbitrary conditions can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
  };
}

export const AzureClusterIdentityList = 'AzureClusterIdentityList';

export const AzureClusterIdentityListApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

export interface IAzureClusterIdentityList
  extends metav1.IList<IAzureClusterIdentity> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  kind: typeof AzureClusterIdentityList;
}

export const AzureMachineTemplate = 'AzureMachineTemplate';

export const AzureMachineTemplateApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

/**
 * AzureMachineTemplate is the Schema for the azuremachinetemplates API.
 */
export interface IAzureMachineTemplate {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureMachineTemplate;
  metadata: metav1.IObjectMeta;
  /**
   * AzureMachineTemplateSpec defines the desired state of AzureMachineTemplate.
   */
  spec?: {
    /**
     * AzureMachineTemplateResource describes the data needed to create an AzureMachine from a template.
     */
    template: {
      /**
       * ObjectMeta is metadata that all persisted resources must have, which includes all objects users must create. This is a copy of customizable fields from metav1.ObjectMeta.
       *  ObjectMeta is embedded in `Machine.Spec`, `MachineDeployment.Template` and `MachineSet.Template`, which are not top-level Kubernetes objects. Given that metav1.ObjectMeta has lots of special cases and read-only fields which end up in the generated CRD validation, having it as a subset simplifies the API and some issues that can impact user experience.
       *  During the [upgrade to controller-tools@v2](https://github.com/kubernetes-sigs/cluster-api/pull/1054) for v1alpha2, we noticed a failure would occur running Cluster API test suite against the new CRDs, specifically `spec.metadata.creationTimestamp in body must be of type string: "null"`. The investigation showed that `controller-tools@v2` behaves differently than its previous version when handling types from [metav1](k8s.io/apimachinery/pkg/apis/meta/v1) package.
       *  In more details, we found that embedded (non-top level) types that embedded `metav1.ObjectMeta` had validation properties, including for `creationTimestamp` (metav1.Time). The `metav1.Time` type specifies a custom json marshaller that, when IsZero() is true, returns `null` which breaks validation because the field isn't marked as nullable.
       *  In future versions, controller-tools@v2 might allow overriding the type and validation for embedded types. When that happens, this hack should be revisited.
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
         * Deprecated: AcceleratedNetworking should be set in the networkInterfaces field.
         */
        acceleratedNetworking?: boolean;
        /**
         * AdditionalCapabilities specifies additional capabilities enabled or disabled on the virtual machine.
         */
        additionalCapabilities?: {
          /**
           * UltraSSDEnabled enables or disables Azure UltraSSD capability for the virtual machine. Defaults to true if Ultra SSD data disks are specified, otherwise it doesn't set the capability on the VM.
           */
          ultraSSDEnabled?: boolean;
        };
        /**
         * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the Azure provider. If both the AzureCluster and the AzureMachine specify the same tag name with different values, the AzureMachine's value takes precedence.
         */
        additionalTags?: {
          [k: string]: string;
        };
        /**
         * AllocatePublicIP allows the ability to create dynamic public ips for machines where this value is true.
         */
        allocatePublicIP?: boolean;
        /**
         * DataDisk specifies the parameters that are used to add one or more data disks to the machine
         */
        dataDisks?: {
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
          managedDisk?: {
            /**
             * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk.
             */
            diskEncryptionSet?: {
              /**
               * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
               */
              id?: string;
            };
            /**
             * SecurityProfile specifies the security profile for the managed disk.
             */
            securityProfile?: {
              /**
               * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk that is used for Customer Managed Key encrypted ConfidentialVM OS Disk and VMGuest blob.
               */
              diskEncryptionSet?: {
                /**
                 * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
                 */
                id?: string;
              };
              /**
               * SecurityEncryptionType specifies the encryption type of the managed disk. It is set to DiskWithVMGuestState to encrypt the managed disk along with the VMGuestState blob, and to VMGuestStateOnly to encrypt the VMGuestState blob only. When set to VMGuestStateOnly, VirtualizedTrustedPlatformModule should be set to Enabled. When set to DiskWithVMGuestState, EncryptionAtHost should be disabled, SecureBoot and VirtualizedTrustedPlatformModule should be set to Enabled. It can be set only for Confidential VMs.
               */
              securityEncryptionType?:
                | 'VMGuestStateOnly'
                | 'DiskWithVMGuestState';
            };
            storageAccountType?: string;
          };
          /**
           * NameSuffix is the suffix to be appended to the machine name to generate the disk name. Each disk name will be in format <machineName>_<nameSuffix>.
           */
          nameSuffix: string;
        }[];
        /**
         * Diagnostics specifies the diagnostics settings for a virtual machine. If not specified then Boot diagnostics (Managed) will be enabled.
         */
        diagnostics?: {
          /**
           * Boot configures the boot diagnostics settings for the virtual machine. This allows to configure capturing serial output from the virtual machine on boot. This is useful for debugging software based launch issues. If not specified then Boot diagnostics (Managed) will be enabled.
           */
          boot?: {
            /**
             * StorageAccountType determines if the storage account for storing the diagnostics data should be disabled (Disabled), provisioned by Azure (Managed) or by the user (UserManaged).
             */
            storageAccountType: 'Managed' | 'UserManaged' | 'Disabled';
            /**
             * UserManaged provides a reference to the user-managed storage account.
             */
            userManaged?: {
              /**
               * StorageAccountURI is the URI of the user-managed storage account. The URI typically will be `https://<mystorageaccountname>.blob.core.windows.net/` but may differ if you are using Azure DNS zone endpoints. You can find the correct endpoint by looking for the Blob Primary Endpoint in the endpoints tab in the Azure console or with the CLI by issuing `az storage account list --query='[].{name: name, "resource group": resourceGroup, "blob endpoint": primaryEndpoints.blob}'`.
               */
              storageAccountURI: string;
            };
          };
        };
        /**
         * DNSServers adds a list of DNS Server IP addresses to the VM NICs.
         */
        dnsServers?: string[];
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
        image?: {
          /**
           * ComputeGallery specifies an image to use from the Azure Compute Gallery
           */
          computeGallery?: {
            /**
             * Gallery specifies the name of the compute image gallery that contains the image
             */
            gallery: string;
            /**
             * Name is the name of the image
             */
            name: string;
            /**
             * Plan contains plan information.
             */
            plan?: {
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
            };
            /**
             * ResourceGroup specifies the resource group containing the private compute gallery.
             */
            resourceGroup?: string;
            /**
             * SubscriptionID is the identifier of the subscription that contains the private compute gallery.
             */
            subscriptionID?: string;
            /**
             * Version specifies the version of the marketplace image. The allowed formats are Major.Minor.Build or 'latest'. Major, Minor, and Build are decimal numbers. Specify 'latest' to use the latest version of an image available at deploy time. Even if you use 'latest', the VM image will not automatically update after deploy time even if a new version becomes available.
             */
            version: string;
          };
          /**
           * ID specifies an image to use by ID
           */
          id?: string;
          /**
           * Marketplace specifies an image to use from the Azure Marketplace
           */
          marketplace?: {
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
          };
          /**
           * SharedGallery specifies an image to use from an Azure Shared Image Gallery Deprecated: use ComputeGallery instead.
           */
          sharedGallery?: {
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
          };
        };
        /**
         * NetworkInterfaces specifies a list of network interface configurations. If left unspecified, the VM will get a single network interface with a single IPConfig in the subnet specified in the cluster's node subnet field. The primary interface will be the first networkInterface specified (index 0) in the list.
         */
        networkInterfaces?: {
          /**
           * AcceleratedNetworking enables or disables Azure accelerated networking. If omitted, it will be set based on whether the requested VMSize supports accelerated networking. If AcceleratedNetworking is set to true with a VMSize that does not support it, Azure will return an error.
           */
          acceleratedNetworking?: boolean;
          /**
           * PrivateIPConfigs specifies the number of private IP addresses to attach to the interface. Defaults to 1 if not specified.
           */
          privateIPConfigs?: number;
          /**
           * SubnetName specifies the subnet in which the new network interface will be placed.
           */
          subnetName?: string;
        }[];
        /**
         * OSDisk specifies the parameters for the operating system disk of the machine
         */
        osDisk: {
          /**
           * CachingType specifies the caching requirements.
           */
          cachingType?: 'None' | 'ReadOnly' | 'ReadWrite';
          /**
           * DiffDiskSettings describe ephemeral disk settings for the os disk.
           */
          diffDiskSettings?: {
            /**
             * Option enables ephemeral OS when set to "Local" See https://learn.microsoft.com/azure/virtual-machines/ephemeral-os-disks for full details
             */
            option: 'Local';
          };
          /**
           * DiskSizeGB is the size in GB to assign to the OS disk. Will have a default of 30GB if not provided
           */
          diskSizeGB?: number;
          /**
           * ManagedDisk specifies the Managed Disk parameters for the OS disk.
           */
          managedDisk?: {
            /**
             * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk.
             */
            diskEncryptionSet?: {
              /**
               * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
               */
              id?: string;
            };
            /**
             * SecurityProfile specifies the security profile for the managed disk.
             */
            securityProfile?: {
              /**
               * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk that is used for Customer Managed Key encrypted ConfidentialVM OS Disk and VMGuest blob.
               */
              diskEncryptionSet?: {
                /**
                 * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
                 */
                id?: string;
              };
              /**
               * SecurityEncryptionType specifies the encryption type of the managed disk. It is set to DiskWithVMGuestState to encrypt the managed disk along with the VMGuestState blob, and to VMGuestStateOnly to encrypt the VMGuestState blob only. When set to VMGuestStateOnly, VirtualizedTrustedPlatformModule should be set to Enabled. When set to DiskWithVMGuestState, EncryptionAtHost should be disabled, SecureBoot and VirtualizedTrustedPlatformModule should be set to Enabled. It can be set only for Confidential VMs.
               */
              securityEncryptionType?:
                | 'VMGuestStateOnly'
                | 'DiskWithVMGuestState';
            };
            storageAccountType?: string;
          };
          osType: string;
        };
        /**
         * ProviderID is the unique identifier as specified by the cloud provider.
         */
        providerID?: string;
        /**
         * Deprecated: RoleAssignmentName should be set in the systemAssignedIdentityRole field.
         */
        roleAssignmentName?: string;
        /**
         * SecurityProfile specifies the Security profile settings for a virtual machine.
         */
        securityProfile?: {
          /**
           * This field indicates whether Host Encryption should be enabled or disabled for a virtual machine or virtual machine scale set. This should be disabled when SecurityEncryptionType is set to DiskWithVMGuestState. Default is disabled.
           */
          encryptionAtHost?: boolean;
          /**
           * SecurityType specifies the SecurityType of the virtual machine. It has to be set to any specified value to enable UefiSettings. The default behavior is: UefiSettings will not be enabled unless this property is set.
           */
          securityType?: 'ConfidentialVM' | 'TrustedLaunch';
          /**
           * UefiSettings specifies the security settings like secure boot and vTPM used while creating the virtual machine.
           */
          uefiSettings?: {
            /**
             * SecureBootEnabled specifies whether secure boot should be enabled on the virtual machine. Secure Boot verifies the digital signature of all boot components and halts the boot process if signature verification fails. If omitted, the platform chooses a default, which is subject to change over time, currently that default is false.
             */
            secureBootEnabled?: boolean;
            /**
             * VTpmEnabled specifies whether vTPM should be enabled on the virtual machine. When true it enables the virtualized trusted platform module measurements to create a known good boot integrity policy baseline. The integrity policy baseline is used for comparison with measurements from subsequent VM boots to determine if anything has changed. This is required to be set to Enabled if SecurityEncryptionType is defined. If omitted, the platform chooses a default, which is subject to change over time, currently that default is false.
             */
            vTpmEnabled?: boolean;
          };
        };
        /**
         * SpotVMOptions allows the ability to specify the Machine should use a Spot VM
         */
        spotVMOptions?: {
          /**
           * EvictionPolicy defines the behavior of the virtual machine when it is evicted. It can be either Delete or Deallocate.
           */
          evictionPolicy?: 'Deallocate' | 'Delete';
          /**
           * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
           */
          maxPrice?: number | string;
        };
        /**
         * SSHPublicKey is the SSH public key string, base64-encoded to add to a Virtual Machine. Linux only. Refer to documentation on how to set up SSH access on Windows instances.
         */
        sshPublicKey?: string;
        /**
         * Deprecated: SubnetName should be set in the networkInterfaces field.
         */
        subnetName?: string;
        /**
         * SystemAssignedIdentityRole defines the role and scope to assign to the system-assigned identity.
         */
        systemAssignedIdentityRole?: {
          /**
           * DefinitionID is the ID of the role definition to create for a system assigned identity. It can be an Azure built-in role or a custom role. Refer to built-in roles: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles
           */
          definitionID?: string;
          /**
           * Name is the name of the role assignment to create for a system assigned identity. It can be any valid UUID. If not specified, a random UUID will be generated.
           */
          name?: string;
          /**
           * Scope is the scope that the role assignment or definition applies to. The scope can be any REST resource instance. If not specified, the scope will be the subscription.
           */
          scope?: string;
        };
        /**
         * UserAssignedIdentities is a list of standalone Azure identities provided by the user The lifecycle of a user-assigned identity is managed separately from the lifecycle of the AzureMachine. See https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/how-to-manage-ua-identity-cli
         */
        userAssignedIdentities?: {
          /**
           * ProviderID is the identification ID of the user-assigned Identity, the format of an identity is: 'azure:///subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}'
           */
          providerID: string;
        }[];
        /**
         * VMExtensions specifies a list of extensions to be added to the virtual machine.
         */
        vmExtensions?: {
          /**
           * Name is the name of the extension.
           */
          name: string;
          /**
           * ProtectedSettings is a JSON formatted protected settings for the extension.
           */
          protectedSettings?: {
            [k: string]: string;
          };
          /**
           * Publisher is the name of the extension handler publisher.
           */
          publisher: string;
          /**
           * Settings is a JSON formatted public settings for the extension.
           */
          settings?: {
            [k: string]: string;
          };
          /**
           * Version specifies the version of the script handler.
           */
          version: string;
        }[];
        vmSize: string;
      };
    };
  };
}

export const AzureMachineTemplateList = 'AzureMachineTemplateList';

export const AzureMachineTemplateListApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

export interface IAzureMachineTemplateList
  extends metav1.IList<IAzureMachineTemplate> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  kind: typeof AzureMachineTemplateList;
}

export const AzureMachine = 'AzureMachine';

export const AzureMachineApiVersion = 'infrastructure.cluster.x-k8s.io/v1beta1';

/**
 * AzureMachine is the Schema for the azuremachines API.
 */
export interface IAzureMachine {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureMachine;
  metadata: metav1.IObjectMeta;
  /**
   * AzureMachineSpec defines the desired state of AzureMachine.
   */
  spec?: {
    /**
     * Deprecated: AcceleratedNetworking should be set in the networkInterfaces field.
     */
    acceleratedNetworking?: boolean;
    /**
     * AdditionalCapabilities specifies additional capabilities enabled or disabled on the virtual machine.
     */
    additionalCapabilities?: {
      /**
       * UltraSSDEnabled enables or disables Azure UltraSSD capability for the virtual machine. Defaults to true if Ultra SSD data disks are specified, otherwise it doesn't set the capability on the VM.
       */
      ultraSSDEnabled?: boolean;
    };
    /**
     * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the Azure provider. If both the AzureCluster and the AzureMachine specify the same tag name with different values, the AzureMachine's value takes precedence.
     */
    additionalTags?: {
      [k: string]: string;
    };
    /**
     * AllocatePublicIP allows the ability to create dynamic public ips for machines where this value is true.
     */
    allocatePublicIP?: boolean;
    /**
     * DataDisk specifies the parameters that are used to add one or more data disks to the machine
     */
    dataDisks?: {
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
      managedDisk?: {
        /**
         * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk.
         */
        diskEncryptionSet?: {
          /**
           * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
           */
          id?: string;
        };
        /**
         * SecurityProfile specifies the security profile for the managed disk.
         */
        securityProfile?: {
          /**
           * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk that is used for Customer Managed Key encrypted ConfidentialVM OS Disk and VMGuest blob.
           */
          diskEncryptionSet?: {
            /**
             * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
             */
            id?: string;
          };
          /**
           * SecurityEncryptionType specifies the encryption type of the managed disk. It is set to DiskWithVMGuestState to encrypt the managed disk along with the VMGuestState blob, and to VMGuestStateOnly to encrypt the VMGuestState blob only. When set to VMGuestStateOnly, VirtualizedTrustedPlatformModule should be set to Enabled. When set to DiskWithVMGuestState, EncryptionAtHost should be disabled, SecureBoot and VirtualizedTrustedPlatformModule should be set to Enabled. It can be set only for Confidential VMs.
           */
          securityEncryptionType?: 'VMGuestStateOnly' | 'DiskWithVMGuestState';
        };
        storageAccountType?: string;
      };
      /**
       * NameSuffix is the suffix to be appended to the machine name to generate the disk name. Each disk name will be in format <machineName>_<nameSuffix>.
       */
      nameSuffix: string;
    }[];
    /**
     * Diagnostics specifies the diagnostics settings for a virtual machine. If not specified then Boot diagnostics (Managed) will be enabled.
     */
    diagnostics?: {
      /**
       * Boot configures the boot diagnostics settings for the virtual machine. This allows to configure capturing serial output from the virtual machine on boot. This is useful for debugging software based launch issues. If not specified then Boot diagnostics (Managed) will be enabled.
       */
      boot?: {
        /**
         * StorageAccountType determines if the storage account for storing the diagnostics data should be disabled (Disabled), provisioned by Azure (Managed) or by the user (UserManaged).
         */
        storageAccountType: 'Managed' | 'UserManaged' | 'Disabled';
        /**
         * UserManaged provides a reference to the user-managed storage account.
         */
        userManaged?: {
          /**
           * StorageAccountURI is the URI of the user-managed storage account. The URI typically will be `https://<mystorageaccountname>.blob.core.windows.net/` but may differ if you are using Azure DNS zone endpoints. You can find the correct endpoint by looking for the Blob Primary Endpoint in the endpoints tab in the Azure console or with the CLI by issuing `az storage account list --query='[].{name: name, "resource group": resourceGroup, "blob endpoint": primaryEndpoints.blob}'`.
           */
          storageAccountURI: string;
        };
      };
    };
    /**
     * DNSServers adds a list of DNS Server IP addresses to the VM NICs.
     */
    dnsServers?: string[];
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
    image?: {
      /**
       * ComputeGallery specifies an image to use from the Azure Compute Gallery
       */
      computeGallery?: {
        /**
         * Gallery specifies the name of the compute image gallery that contains the image
         */
        gallery: string;
        /**
         * Name is the name of the image
         */
        name: string;
        /**
         * Plan contains plan information.
         */
        plan?: {
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
        };
        /**
         * ResourceGroup specifies the resource group containing the private compute gallery.
         */
        resourceGroup?: string;
        /**
         * SubscriptionID is the identifier of the subscription that contains the private compute gallery.
         */
        subscriptionID?: string;
        /**
         * Version specifies the version of the marketplace image. The allowed formats are Major.Minor.Build or 'latest'. Major, Minor, and Build are decimal numbers. Specify 'latest' to use the latest version of an image available at deploy time. Even if you use 'latest', the VM image will not automatically update after deploy time even if a new version becomes available.
         */
        version: string;
      };
      /**
       * ID specifies an image to use by ID
       */
      id?: string;
      /**
       * Marketplace specifies an image to use from the Azure Marketplace
       */
      marketplace?: {
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
      };
      /**
       * SharedGallery specifies an image to use from an Azure Shared Image Gallery Deprecated: use ComputeGallery instead.
       */
      sharedGallery?: {
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
      };
    };
    /**
     * NetworkInterfaces specifies a list of network interface configurations. If left unspecified, the VM will get a single network interface with a single IPConfig in the subnet specified in the cluster's node subnet field. The primary interface will be the first networkInterface specified (index 0) in the list.
     */
    networkInterfaces?: {
      /**
       * AcceleratedNetworking enables or disables Azure accelerated networking. If omitted, it will be set based on whether the requested VMSize supports accelerated networking. If AcceleratedNetworking is set to true with a VMSize that does not support it, Azure will return an error.
       */
      acceleratedNetworking?: boolean;
      /**
       * PrivateIPConfigs specifies the number of private IP addresses to attach to the interface. Defaults to 1 if not specified.
       */
      privateIPConfigs?: number;
      /**
       * SubnetName specifies the subnet in which the new network interface will be placed.
       */
      subnetName?: string;
    }[];
    /**
     * OSDisk specifies the parameters for the operating system disk of the machine
     */
    osDisk: {
      /**
       * CachingType specifies the caching requirements.
       */
      cachingType?: 'None' | 'ReadOnly' | 'ReadWrite';
      /**
       * DiffDiskSettings describe ephemeral disk settings for the os disk.
       */
      diffDiskSettings?: {
        /**
         * Option enables ephemeral OS when set to "Local" See https://learn.microsoft.com/azure/virtual-machines/ephemeral-os-disks for full details
         */
        option: 'Local';
      };
      /**
       * DiskSizeGB is the size in GB to assign to the OS disk. Will have a default of 30GB if not provided
       */
      diskSizeGB?: number;
      /**
       * ManagedDisk specifies the Managed Disk parameters for the OS disk.
       */
      managedDisk?: {
        /**
         * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk.
         */
        diskEncryptionSet?: {
          /**
           * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
           */
          id?: string;
        };
        /**
         * SecurityProfile specifies the security profile for the managed disk.
         */
        securityProfile?: {
          /**
           * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk that is used for Customer Managed Key encrypted ConfidentialVM OS Disk and VMGuest blob.
           */
          diskEncryptionSet?: {
            /**
             * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
             */
            id?: string;
          };
          /**
           * SecurityEncryptionType specifies the encryption type of the managed disk. It is set to DiskWithVMGuestState to encrypt the managed disk along with the VMGuestState blob, and to VMGuestStateOnly to encrypt the VMGuestState blob only. When set to VMGuestStateOnly, VirtualizedTrustedPlatformModule should be set to Enabled. When set to DiskWithVMGuestState, EncryptionAtHost should be disabled, SecureBoot and VirtualizedTrustedPlatformModule should be set to Enabled. It can be set only for Confidential VMs.
           */
          securityEncryptionType?: 'VMGuestStateOnly' | 'DiskWithVMGuestState';
        };
        storageAccountType?: string;
      };
      osType: string;
    };
    /**
     * ProviderID is the unique identifier as specified by the cloud provider.
     */
    providerID?: string;
    /**
     * Deprecated: RoleAssignmentName should be set in the systemAssignedIdentityRole field.
     */
    roleAssignmentName?: string;
    /**
     * SecurityProfile specifies the Security profile settings for a virtual machine.
     */
    securityProfile?: {
      /**
       * This field indicates whether Host Encryption should be enabled or disabled for a virtual machine or virtual machine scale set. This should be disabled when SecurityEncryptionType is set to DiskWithVMGuestState. Default is disabled.
       */
      encryptionAtHost?: boolean;
      /**
       * SecurityType specifies the SecurityType of the virtual machine. It has to be set to any specified value to enable UefiSettings. The default behavior is: UefiSettings will not be enabled unless this property is set.
       */
      securityType?: 'ConfidentialVM' | 'TrustedLaunch';
      /**
       * UefiSettings specifies the security settings like secure boot and vTPM used while creating the virtual machine.
       */
      uefiSettings?: {
        /**
         * SecureBootEnabled specifies whether secure boot should be enabled on the virtual machine. Secure Boot verifies the digital signature of all boot components and halts the boot process if signature verification fails. If omitted, the platform chooses a default, which is subject to change over time, currently that default is false.
         */
        secureBootEnabled?: boolean;
        /**
         * VTpmEnabled specifies whether vTPM should be enabled on the virtual machine. When true it enables the virtualized trusted platform module measurements to create a known good boot integrity policy baseline. The integrity policy baseline is used for comparison with measurements from subsequent VM boots to determine if anything has changed. This is required to be set to Enabled if SecurityEncryptionType is defined. If omitted, the platform chooses a default, which is subject to change over time, currently that default is false.
         */
        vTpmEnabled?: boolean;
      };
    };
    /**
     * SpotVMOptions allows the ability to specify the Machine should use a Spot VM
     */
    spotVMOptions?: {
      /**
       * EvictionPolicy defines the behavior of the virtual machine when it is evicted. It can be either Delete or Deallocate.
       */
      evictionPolicy?: 'Deallocate' | 'Delete';
      /**
       * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
       */
      maxPrice?: number | string;
    };
    /**
     * SSHPublicKey is the SSH public key string, base64-encoded to add to a Virtual Machine. Linux only. Refer to documentation on how to set up SSH access on Windows instances.
     */
    sshPublicKey?: string;
    /**
     * Deprecated: SubnetName should be set in the networkInterfaces field.
     */
    subnetName?: string;
    /**
     * SystemAssignedIdentityRole defines the role and scope to assign to the system-assigned identity.
     */
    systemAssignedIdentityRole?: {
      /**
       * DefinitionID is the ID of the role definition to create for a system assigned identity. It can be an Azure built-in role or a custom role. Refer to built-in roles: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles
       */
      definitionID?: string;
      /**
       * Name is the name of the role assignment to create for a system assigned identity. It can be any valid UUID. If not specified, a random UUID will be generated.
       */
      name?: string;
      /**
       * Scope is the scope that the role assignment or definition applies to. The scope can be any REST resource instance. If not specified, the scope will be the subscription.
       */
      scope?: string;
    };
    /**
     * UserAssignedIdentities is a list of standalone Azure identities provided by the user The lifecycle of a user-assigned identity is managed separately from the lifecycle of the AzureMachine. See https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/how-to-manage-ua-identity-cli
     */
    userAssignedIdentities?: {
      /**
       * ProviderID is the identification ID of the user-assigned Identity, the format of an identity is: 'azure:///subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}'
       */
      providerID: string;
    }[];
    /**
     * VMExtensions specifies a list of extensions to be added to the virtual machine.
     */
    vmExtensions?: {
      /**
       * Name is the name of the extension.
       */
      name: string;
      /**
       * ProtectedSettings is a JSON formatted protected settings for the extension.
       */
      protectedSettings?: {
        [k: string]: string;
      };
      /**
       * Publisher is the name of the extension handler publisher.
       */
      publisher: string;
      /**
       * Settings is a JSON formatted public settings for the extension.
       */
      settings?: {
        [k: string]: string;
      };
      /**
       * Version specifies the version of the script handler.
       */
      version: string;
    }[];
    vmSize: string;
  };
  /**
   * AzureMachineStatus defines the observed state of AzureMachine.
   */
  status?: {
    /**
     * Addresses contains the Azure instance associated addresses.
     */
    addresses?: {
      /**
       * The node address.
       */
      address: string;
      /**
       * Node address type, one of Hostname, ExternalIP or InternalIP.
       */
      type: string;
    }[];
    /**
     * Conditions defines current service state of the AzureMachine.
     */
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another. This should be when the underlying condition changed. If that is not known, then using the time when the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition. This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase. The specific API may choose whether or not this field is considered a guaranteed API. This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately understand the current situation and act accordingly. The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase. Many .condition.type values are consistent across resources like Available, but because arbitrary conditions can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
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
    longRunningOperationStates?: {
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
    }[];
    /**
     * Ready is true when the provider resource is ready.
     */
    ready?: boolean;
    /**
     * VMState is the provisioning state of the Azure virtual machine.
     */
    vmState?: string;
  };
}

export const AzureMachineList = 'AzureMachineList';

export const AzureMachineListApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

export interface IAzureMachineList extends metav1.IList<IAzureMachine> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  kind: typeof AzureMachineList;
}

export const AzureMachinePool = 'AzureMachinePool';

export const AzureMachinePoolApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

/**
 * AzureMachinePool is the Schema for the azuremachinepools API.
 */
export interface IAzureMachinePool {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof AzureMachinePool;
  metadata: metav1.IObjectMeta;
  /**
   * AzureMachinePoolSpec defines the desired state of AzureMachinePool.
   */
  spec?: {
    /**
     * AdditionalTags is an optional set of tags to add to an instance, in addition to the ones added by default by the Azure provider. If both the AzureCluster and the AzureMachine specify the same tag name with different values, the AzureMachine's value takes precedence.
     */
    additionalTags?: {
      [k: string]: string;
    };
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
     * OrchestrationMode specifies the orchestration mode for the Virtual Machine Scale Set
     */
    orchestrationMode?: 'Flexible' | 'Uniform';
    /**
     * ProviderID is the identification ID of the Virtual Machine Scale Set
     */
    providerID?: string;
    /**
     * ProviderIDList are the identification IDs of machine instances provided by the provider. This field must match the provider IDs as seen on the node objects corresponding to a machine pool's machine instances.
     */
    providerIDList?: string[];
    /**
     * Deprecated: RoleAssignmentName should be set in the systemAssignedIdentityRole field.
     */
    roleAssignmentName?: string;
    /**
     * The deployment strategy to use to replace existing AzureMachinePoolMachines with new ones.
     */
    strategy?: {
      /**
       * Rolling update config params. Present only if MachineDeploymentStrategyType = RollingUpdate.
       */
      rollingUpdate?: {
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
      };
      /**
       * Type of deployment. Currently the only supported strategy is RollingUpdate
       */
      type?: 'RollingUpdate';
    };
    /**
     * SystemAssignedIdentityRole defines the role and scope to assign to the system assigned identity.
     */
    systemAssignedIdentityRole?: {
      /**
       * DefinitionID is the ID of the role definition to create for a system assigned identity. It can be an Azure built-in role or a custom role. Refer to built-in roles: https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles
       */
      definitionID?: string;
      /**
       * Name is the name of the role assignment to create for a system assigned identity. It can be any valid UUID. If not specified, a random UUID will be generated.
       */
      name?: string;
      /**
       * Scope is the scope that the role assignment or definition applies to. The scope can be any REST resource instance. If not specified, the scope will be the subscription.
       */
      scope?: string;
    };
    /**
     * Template contains the details used to build a replica virtual machine within the Machine Pool
     */
    template: {
      /**
       * Deprecated: AcceleratedNetworking should be set in the networkInterfaces field.
       */
      acceleratedNetworking?: boolean;
      /**
       * DataDisks specifies the list of data disks to be created for a Virtual Machine
       */
      dataDisks?: {
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
        managedDisk?: {
          /**
           * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk.
           */
          diskEncryptionSet?: {
            /**
             * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
             */
            id?: string;
          };
          /**
           * SecurityProfile specifies the security profile for the managed disk.
           */
          securityProfile?: {
            /**
             * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk that is used for Customer Managed Key encrypted ConfidentialVM OS Disk and VMGuest blob.
             */
            diskEncryptionSet?: {
              /**
               * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
               */
              id?: string;
            };
            /**
             * SecurityEncryptionType specifies the encryption type of the managed disk. It is set to DiskWithVMGuestState to encrypt the managed disk along with the VMGuestState blob, and to VMGuestStateOnly to encrypt the VMGuestState blob only. When set to VMGuestStateOnly, VirtualizedTrustedPlatformModule should be set to Enabled. When set to DiskWithVMGuestState, EncryptionAtHost should be disabled, SecureBoot and VirtualizedTrustedPlatformModule should be set to Enabled. It can be set only for Confidential VMs.
             */
            securityEncryptionType?:
              | 'VMGuestStateOnly'
              | 'DiskWithVMGuestState';
          };
          storageAccountType?: string;
        };
        /**
         * NameSuffix is the suffix to be appended to the machine name to generate the disk name. Each disk name will be in format <machineName>_<nameSuffix>.
         */
        nameSuffix: string;
      }[];
      /**
       * Diagnostics specifies the diagnostics settings for a virtual machine. If not specified then Boot diagnostics (Managed) will be enabled.
       */
      diagnostics?: {
        /**
         * Boot configures the boot diagnostics settings for the virtual machine. This allows to configure capturing serial output from the virtual machine on boot. This is useful for debugging software based launch issues. If not specified then Boot diagnostics (Managed) will be enabled.
         */
        boot?: {
          /**
           * StorageAccountType determines if the storage account for storing the diagnostics data should be disabled (Disabled), provisioned by Azure (Managed) or by the user (UserManaged).
           */
          storageAccountType: 'Managed' | 'UserManaged' | 'Disabled';
          /**
           * UserManaged provides a reference to the user-managed storage account.
           */
          userManaged?: {
            /**
             * StorageAccountURI is the URI of the user-managed storage account. The URI typically will be `https://<mystorageaccountname>.blob.core.windows.net/` but may differ if you are using Azure DNS zone endpoints. You can find the correct endpoint by looking for the Blob Primary Endpoint in the endpoints tab in the Azure console or with the CLI by issuing `az storage account list --query='[].{name: name, "resource group": resourceGroup, "blob endpoint": primaryEndpoints.blob}'`.
             */
            storageAccountURI: string;
          };
        };
      };
      /**
       * Image is used to provide details of an image to use during VM creation. If image details are omitted the image will default the Azure Marketplace "capi" offer, which is based on Ubuntu.
       */
      image?: {
        /**
         * ComputeGallery specifies an image to use from the Azure Compute Gallery
         */
        computeGallery?: {
          /**
           * Gallery specifies the name of the compute image gallery that contains the image
           */
          gallery: string;
          /**
           * Name is the name of the image
           */
          name: string;
          /**
           * Plan contains plan information.
           */
          plan?: {
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
          };
          /**
           * ResourceGroup specifies the resource group containing the private compute gallery.
           */
          resourceGroup?: string;
          /**
           * SubscriptionID is the identifier of the subscription that contains the private compute gallery.
           */
          subscriptionID?: string;
          /**
           * Version specifies the version of the marketplace image. The allowed formats are Major.Minor.Build or 'latest'. Major, Minor, and Build are decimal numbers. Specify 'latest' to use the latest version of an image available at deploy time. Even if you use 'latest', the VM image will not automatically update after deploy time even if a new version becomes available.
           */
          version: string;
        };
        /**
         * ID specifies an image to use by ID
         */
        id?: string;
        /**
         * Marketplace specifies an image to use from the Azure Marketplace
         */
        marketplace?: {
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
        };
        /**
         * SharedGallery specifies an image to use from an Azure Shared Image Gallery Deprecated: use ComputeGallery instead.
         */
        sharedGallery?: {
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
        };
      };
      /**
       * NetworkInterfaces specifies a list of network interface configurations. If left unspecified, the VM will get a single network interface with a single IPConfig in the subnet specified in the cluster's node subnet field. The primary interface will be the first networkInterface specified (index 0) in the list.
       */
      networkInterfaces?: {
        /**
         * AcceleratedNetworking enables or disables Azure accelerated networking. If omitted, it will be set based on whether the requested VMSize supports accelerated networking. If AcceleratedNetworking is set to true with a VMSize that does not support it, Azure will return an error.
         */
        acceleratedNetworking?: boolean;
        /**
         * PrivateIPConfigs specifies the number of private IP addresses to attach to the interface. Defaults to 1 if not specified.
         */
        privateIPConfigs?: number;
        /**
         * SubnetName specifies the subnet in which the new network interface will be placed.
         */
        subnetName?: string;
      }[];
      /**
       * OSDisk contains the operating system disk information for a Virtual Machine
       */
      osDisk: {
        /**
         * CachingType specifies the caching requirements.
         */
        cachingType?: 'None' | 'ReadOnly' | 'ReadWrite';
        /**
         * DiffDiskSettings describe ephemeral disk settings for the os disk.
         */
        diffDiskSettings?: {
          /**
           * Option enables ephemeral OS when set to "Local" See https://learn.microsoft.com/azure/virtual-machines/ephemeral-os-disks for full details
           */
          option: 'Local';
        };
        /**
         * DiskSizeGB is the size in GB to assign to the OS disk. Will have a default of 30GB if not provided
         */
        diskSizeGB?: number;
        /**
         * ManagedDisk specifies the Managed Disk parameters for the OS disk.
         */
        managedDisk?: {
          /**
           * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk.
           */
          diskEncryptionSet?: {
            /**
             * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
             */
            id?: string;
          };
          /**
           * SecurityProfile specifies the security profile for the managed disk.
           */
          securityProfile?: {
            /**
             * DiskEncryptionSet specifies the customer-managed disk encryption set resource id for the managed disk that is used for Customer Managed Key encrypted ConfidentialVM OS Disk and VMGuest blob.
             */
            diskEncryptionSet?: {
              /**
               * ID defines resourceID for diskEncryptionSet resource. It must be in the same subscription
               */
              id?: string;
            };
            /**
             * SecurityEncryptionType specifies the encryption type of the managed disk. It is set to DiskWithVMGuestState to encrypt the managed disk along with the VMGuestState blob, and to VMGuestStateOnly to encrypt the VMGuestState blob only. When set to VMGuestStateOnly, VirtualizedTrustedPlatformModule should be set to Enabled. When set to DiskWithVMGuestState, EncryptionAtHost should be disabled, SecureBoot and VirtualizedTrustedPlatformModule should be set to Enabled. It can be set only for Confidential VMs.
             */
            securityEncryptionType?:
              | 'VMGuestStateOnly'
              | 'DiskWithVMGuestState';
          };
          storageAccountType?: string;
        };
        osType: string;
      };
      /**
       * SecurityProfile specifies the Security profile settings for a virtual machine.
       */
      securityProfile?: {
        /**
         * This field indicates whether Host Encryption should be enabled or disabled for a virtual machine or virtual machine scale set. This should be disabled when SecurityEncryptionType is set to DiskWithVMGuestState. Default is disabled.
         */
        encryptionAtHost?: boolean;
        /**
         * SecurityType specifies the SecurityType of the virtual machine. It has to be set to any specified value to enable UefiSettings. The default behavior is: UefiSettings will not be enabled unless this property is set.
         */
        securityType?: 'ConfidentialVM' | 'TrustedLaunch';
        /**
         * UefiSettings specifies the security settings like secure boot and vTPM used while creating the virtual machine.
         */
        uefiSettings?: {
          /**
           * SecureBootEnabled specifies whether secure boot should be enabled on the virtual machine. Secure Boot verifies the digital signature of all boot components and halts the boot process if signature verification fails. If omitted, the platform chooses a default, which is subject to change over time, currently that default is false.
           */
          secureBootEnabled?: boolean;
          /**
           * VTpmEnabled specifies whether vTPM should be enabled on the virtual machine. When true it enables the virtualized trusted platform module measurements to create a known good boot integrity policy baseline. The integrity policy baseline is used for comparison with measurements from subsequent VM boots to determine if anything has changed. This is required to be set to Enabled if SecurityEncryptionType is defined. If omitted, the platform chooses a default, which is subject to change over time, currently that default is false.
           */
          vTpmEnabled?: boolean;
        };
      };
      /**
       * SpotVMOptions allows the ability to specify the Machine should use a Spot VM
       */
      spotVMOptions?: {
        /**
         * EvictionPolicy defines the behavior of the virtual machine when it is evicted. It can be either Delete or Deallocate.
         */
        evictionPolicy?: 'Deallocate' | 'Delete';
        /**
         * MaxPrice defines the maximum price the user is willing to pay for Spot VM instances
         */
        maxPrice?: number | string;
      };
      /**
       * SSHPublicKey is the SSH public key string, base64-encoded to add to a Virtual Machine. Linux only. Refer to documentation on how to set up SSH access on Windows instances.
       */
      sshPublicKey?: string;
      /**
       * Deprecated: SubnetName should be set in the networkInterfaces field.
       */
      subnetName?: string;
      /**
       * TerminateNotificationTimeout enables or disables VMSS scheduled events termination notification with specified timeout allowed values are between 5 and 15 (mins)
       */
      terminateNotificationTimeout?: number;
      /**
       * VMExtensions specifies a list of extensions to be added to the scale set.
       */
      vmExtensions?: {
        /**
         * Name is the name of the extension.
         */
        name: string;
        /**
         * ProtectedSettings is a JSON formatted protected settings for the extension.
         */
        protectedSettings?: {
          [k: string]: string;
        };
        /**
         * Publisher is the name of the extension handler publisher.
         */
        publisher: string;
        /**
         * Settings is a JSON formatted public settings for the extension.
         */
        settings?: {
          [k: string]: string;
        };
        /**
         * Version specifies the version of the script handler.
         */
        version: string;
      }[];
      /**
       * VMSize is the size of the Virtual Machine to build. See https://learn.microsoft.com/rest/api/compute/virtualmachines/createorupdate#virtualmachinesizetypes
       */
      vmSize: string;
    };
    /**
     * UserAssignedIdentities is a list of standalone Azure identities provided by the user The lifecycle of a user-assigned identity is managed separately from the lifecycle of the AzureMachinePool. See https://learn.microsoft.com/azure/active-directory/managed-identities-azure-resources/how-to-manage-ua-identity-cli
     */
    userAssignedIdentities?: {
      /**
       * ProviderID is the identification ID of the user-assigned Identity, the format of an identity is: 'azure:///subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}'
       */
      providerID: string;
    }[];
  };
  /**
   * AzureMachinePoolStatus defines the observed state of AzureMachinePool.
   */
  status?: {
    /**
     * Conditions defines current service state of the AzureMachinePool.
     */
    conditions?: {
      /**
       * Last time the condition transitioned from one status to another. This should be when the underlying condition changed. If that is not known, then using the time when the API field changed is acceptable.
       */
      lastTransitionTime: string;
      /**
       * A human readable message indicating details about the transition. This field may be empty.
       */
      message?: string;
      /**
       * The reason for the condition's last transition in CamelCase. The specific API may choose whether or not this field is considered a guaranteed API. This field may not be empty.
       */
      reason?: string;
      /**
       * Severity provides an explicit classification of Reason code, so the users or machines can immediately understand the current situation and act accordingly. The Severity field MUST be set only when Status=False.
       */
      severity?: string;
      /**
       * Status of the condition, one of True, False, Unknown.
       */
      status: string;
      /**
       * Type of condition in CamelCase or in foo.example.com/CamelCase. Many .condition.type values are consistent across resources like Available, but because arbitrary conditions can be useful (see .node.status.conditions), the ability to deconflict is important.
       */
      type: string;
    }[];
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
    image?: {
      /**
       * ComputeGallery specifies an image to use from the Azure Compute Gallery
       */
      computeGallery?: {
        /**
         * Gallery specifies the name of the compute image gallery that contains the image
         */
        gallery: string;
        /**
         * Name is the name of the image
         */
        name: string;
        /**
         * Plan contains plan information.
         */
        plan?: {
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
        };
        /**
         * ResourceGroup specifies the resource group containing the private compute gallery.
         */
        resourceGroup?: string;
        /**
         * SubscriptionID is the identifier of the subscription that contains the private compute gallery.
         */
        subscriptionID?: string;
        /**
         * Version specifies the version of the marketplace image. The allowed formats are Major.Minor.Build or 'latest'. Major, Minor, and Build are decimal numbers. Specify 'latest' to use the latest version of an image available at deploy time. Even if you use 'latest', the VM image will not automatically update after deploy time even if a new version becomes available.
         */
        version: string;
      };
      /**
       * ID specifies an image to use by ID
       */
      id?: string;
      /**
       * Marketplace specifies an image to use from the Azure Marketplace
       */
      marketplace?: {
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
      };
      /**
       * SharedGallery specifies an image to use from an Azure Shared Image Gallery Deprecated: use ComputeGallery instead.
       */
      sharedGallery?: {
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
      };
    };
    /**
     * Instances is the VM instance status for each VM in the VMSS
     */
    instances?: {
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
    }[];
    /**
     * LongRunningOperationStates saves the state for Azure long-running operations so they can be continued on the next reconciliation loop.
     */
    longRunningOperationStates?: {
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
    }[];
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
  };
}

export const AzureMachinePoolList = 'AzureMachinePoolList';

export const AzureMachinePoolListApiVersion =
  'infrastructure.cluster.x-k8s.io/v1beta1';

export interface IAzureMachinePoolList extends metav1.IList<IAzureMachinePool> {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1';
  kind: typeof AzureMachinePoolList;
}
