import * as corev1 from '../corev1';
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

export interface IAWSControlPlaneSpec {
  availabilityZones?: string[];
  instanceType?: string;
}

export const AWSControlPlane = 'AWSControlPlane';

export interface IAWSControlPlane {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof AWSControlPlane;
  metadata: metav1.IObjectMeta;
  spec: IAWSControlPlaneSpec;
}

export const AWSControlPlaneList = 'AWSControlPlaneList';

export interface IAWSControlPlaneList extends metav1.IList<IAWSControlPlane> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof AWSControlPlaneList;
}

export interface IG8sControlPlaneSpec {
  replicas?: number;
  infrastructureRef: corev1.IObjectReference;
}

export interface IG8sControlPlaneStatus {
  replicas?: number;
  readyReplicas?: number;
}

export const G8sControlPlane = 'G8sControlPlane';

export interface IG8sControlPlane {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof G8sControlPlane;
  metadata: metav1.IObjectMeta;
  spec: IG8sControlPlaneSpec;
  status: IG8sControlPlaneStatus;
}

export const G8sControlPlaneList = 'G8sControlPlaneList';

export interface IG8sControlPlaneList extends metav1.IList<IG8sControlPlane> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof G8sControlPlaneList;
}

export interface IAWSMachineDeploymentSpecNodePoolMachine {
  dockerVolumeSizeGB: number;
  kubeletVolumeSizeGB: number;
}

export interface IAWSMachineDeploymentSpecNodePoolScaling {
  min: number;
  max: number;
}

export interface IAWSMachineDeploymentSpecNodePool {
  description: string;
  machine: IAWSMachineDeploymentSpecNodePoolMachine;
  scaling: IAWSMachineDeploymentSpecNodePoolScaling;
}

export interface IAWSMachineDeploymentSpecProviderInstanceDistribution {
  onDemandBaseCapacity: number;
  onDemandPercentageAboveBaseCapacity: number | null;
}

export interface IAWSMachineDeploymentSpecProviderWorker {
  instanceType: string;
  useAlikeInstanceTypes: boolean;
}

export interface IAWSMachineDeploymentSpecProvider {
  availabilityZones: string[];
  worker: IAWSMachineDeploymentSpecProviderWorker;
  instanceDistribution?: IAWSMachineDeploymentSpecProviderInstanceDistribution;
}

export interface IAWSMachineDeploymentSpec {
  nodePool: IAWSMachineDeploymentSpecNodePool;
  provider: IAWSMachineDeploymentSpecProvider;
}

export interface IAWSMachineDeploymentStatusProviderWorker {
  instanceTypes?: string[];
  spotInstances?: number;
}

export interface IAWSMachineDeploymentStatusProvider {
  worker?: IAWSMachineDeploymentStatusProviderWorker;
}

export interface IAWSMachineDeploymentStatus {
  provider?: IAWSMachineDeploymentStatusProvider;
}

export const AWSMachineDeployment = 'AWSMachineDeployment';

export interface IAWSMachineDeployment {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof AWSMachineDeployment;
  metadata: metav1.IObjectMeta;
  spec: IAWSMachineDeploymentSpec;
  status?: IAWSMachineDeploymentStatus;
}

export const AWSMachineDeploymentList = 'AWSMachineDeploymentList';

export interface IAWSMachineDeploymentList
  extends metav1.IList<IAWSMachineDeployment> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3';
  kind: typeof AWSMachineDeploymentList;
}
