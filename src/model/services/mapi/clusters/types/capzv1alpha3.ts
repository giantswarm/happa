import * as corev1 from '../../types/corev1';
import * as metav1 from '../../types/metav1';
import * as capiv1alpha3 from './capiv1alpha3';

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
  contronPlaneEndpoint?: capiv1alpha3.IApiEndpoint;
  additionalTags?: Tags;
  identityRef?: corev1.IObjectReference;
}

export interface IAzureClusterStatus {
  failureDomains: capiv1alpha3.FailureDomains;
  ready: boolean;
  conditions: capiv1alpha3.ICondition[];
}

export interface IAzureCluster {
  apiVersion: string;
  kind: string;
  metadata: metav1.IObjectMeta;
  spec: IAzureClusterSpec;
  status: capiv1alpha3.IClusterStatus;
}

export interface IAzureClusterList extends metav1.IList<IAzureCluster> {}
