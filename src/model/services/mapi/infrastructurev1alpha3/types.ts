import * as metav1 from '../metav1';

export interface IAWSClusterSpecClusterDNS {
  domain: string;
}

export interface IAWSClusterSpecClusterKubeProxy {
  conntrackMaxPerCore?: number;
}

export interface IAWSClusterSpecClusterOIDCClaims {
  username?: string;
  groups?: string;
}

export interface IAWSClusterSpecClusterOIDC {
  claims?: IAWSClusterSpecClusterOIDCClaims;
  clientID?: string;
  issuerURL?: string;
}

export interface IAWSClusterSpecCluster {
  description: string;
  dns: IAWSClusterSpecClusterDNS;
  kubeProxy?: IAWSClusterSpecClusterKubeProxy;
  oidc?: IAWSClusterSpecClusterOIDC;
}

export interface IAWSClusterSpecProviderCredentialSecret {
  name: string;
  namespace: string;
}

export interface IAWSClusterSpecProviderMaster {
  availabilityZone: string;
  instanceType: string;
}

export interface IAWSClusterSpecProviderNodes {
  networkPool?: string;
}

export interface IAWSClusterSpecProviderPods {
  cidrBlock?: string;
  externalSNAT?: boolean;
}

export interface IAWSClusterSpecProvider {
  region: string;
  credentialSecret: IAWSClusterSpecProviderCredentialSecret;
  master?: IAWSClusterSpecProviderMaster;
  nodes?: IAWSClusterSpecProviderNodes;
  pods?: IAWSClusterSpecProviderPods;
}

export interface IAWSClusterSpec {
  cluster: IAWSClusterSpecCluster;
  provider: IAWSClusterSpecProvider;
}

export interface IAWSClusterStatusClusterCondition {
  condition: string;
  lastTransitionTime?: string;
}

export interface IAWSClusterStatusClusterVersion {
  version: string;
  lastTransitionTime?: string;
}

export interface IAWSClusterStatusCluster {
  conditions?: IAWSClusterStatusClusterCondition[];
  id?: string;
  versions?: IAWSClusterStatusClusterVersion[];
}

export interface IAWSClusterStatusProviderNetwork {
  cidr?: string;
  vpcID?: string;
}

export interface IAWSClusterStatusProvider {
  network?: IAWSClusterStatusProviderNetwork;
}

export interface IAWSClusterStatus {
  cluster?: IAWSClusterStatusCluster;
  provider?: IAWSClusterStatusProvider;
}

export const AWSCluster = 'AWSCluster';

export interface IAWSCluster {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof AWSCluster;
  metadata: metav1.IObjectMeta;
  spec?: IAWSClusterSpec;
  status?: IAWSClusterStatus;
}

export const AWSClusterList = 'AWSClusterList';

export interface IAWSClusterList extends metav1.IList<IAWSCluster> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof AWSClusterList;
}
