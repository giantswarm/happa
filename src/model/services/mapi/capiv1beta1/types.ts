import * as corev1 from '../corev1';
import * as k8sUrl from '../k8sUrl';
import * as metav1 from '../metav1';

export const ApiVersion = 'cluster.x-k8s.io/v1beta1';

export interface IClusterNetworkNetworkRanges {
  cidrBlocks: string[] | null;
}

export interface IClusterNetwork {
  /**
   * APIServerPort specifies the port the API Server should bind to. Defaults to 6443.
   */
  apiServerPort?: number;
  /**
   * The network ranges from which Pod networks are allocated.
   */
  pods?: IClusterNetworkNetworkRanges;
  /**
   * Domain name for services.
   */
  serviceDomain?: string;
  /**
   * The network ranges from which service VIPs are allocated.
   */
  services?: IClusterNetworkNetworkRanges;
}

export interface IApiEndpoint {
  /**
   * The hostname on which the API server is serving.
   */
  host: string;
  /**
   * The port on which the API server is serving.
   */
  port: number;
}

export interface IClusterSpec {
  /**
   * ClusterNetwork represents the cluster network configuration.
   */
  clusterNetwork?: IClusterNetwork;
  /**
   * ControlPlaneEndpoint represents the endpoint used to communicate with the control plane.
   */
  controlPlaneEndpoint?: IApiEndpoint;
  controlPlaneRef?: corev1.IObjectReference;
  infrastructureRef?: corev1.IObjectReference;
  /**
   * Paused can be used to prevent controllers from processing the Cluster and all its associated objects.
   */
  paused?: boolean;
}

export type FailureDomains = Record<string, IFailureDomainSpec>;

export interface IFailureDomainSpec {
  /**
   * Attributes is a free form map of attributes an infrastructure provider might use or require.
   */
  attributes?: Record<string, string>;
  /**
   * ControlPlane determines if this failure domain is suitable for use by control plane machines.
   */
  controlPlane?: boolean;
}

/**
 * ICondition defines current service state.
 */
export interface ICondition {
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
  severity?: 'Error' | 'Warning' | 'Info' | '';
  /**
   * Status of the condition, one of True, False, Unknown.
   */
  status:
    | typeof corev1.conditionTrue
    | typeof corev1.conditionFalse
    | typeof corev1.conditionUnknown;
  /**
   * Type of condition in CamelCase or in foo.example.com/CamelCase. Many .condition.type values are consistent across resources like Available, but because arbitrary conditions can be useful (see .node.status.conditions), the ability to deconflict is important.
   */
  type: string;
}

export interface IClusterStatus {
  conditions?: ICondition[];
  /**
   * ControlPlaneReady defines if the control plane is ready.
   */
  controlPlaneReady?: boolean;
  /**
   * FailureDomains is a slice of failure domain objects synced from the infrastructure provider.
   */
  failureDomains?: FailureDomains;
  /**
   * FailureMessage indicates that there is a fatal problem reconciling the state, and will be set to a descriptive error message.
   */
  failureMessage?: string;
  /**
   * FailureReason indicates that there is a fatal problem reconciling the state, and will be set to a token value suitable for programmatic interpretation.
   */
  failureReason?: string;
  /**
   * InfrastructureReady is the state of the infrastructure provider.
   */
  infrastructureReady?: boolean;
  /**
   * ObservedGeneration is the latest generation observed by the controller.
   */
  observedGeneration?: number;
  /**
   * Phase represents the current phase of cluster actuation. E.g. Pending, Running, Terminating, Failed etc.
   */
  phase?: string;
}

export const Cluster = 'Cluster';

/**
 * ICluster is the Schema for the clusters API.
 */
export interface ICluster {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof Cluster;
  metadata: metav1.IObjectMeta;
  /**
   * Spec defines the desired state of Cluster.
   */
  spec?: IClusterSpec;
  /**
   * Status defines the observed state of Cluster.
   */
  status?: IClusterStatus;
}

export const ClusterList = 'ClusterList';

export interface IClusterList extends metav1.IList<ICluster> {
  apiVersion: typeof ApiVersion;
  kind: typeof ClusterList;
}

export interface IMachineDeploymentTemplateSpecBootstrap {
  /**
   * ConfigRef is a reference to a bootstrap provider-specific resource that holds configuration details. The reference is optional to allow users/operators to specify Bootstrap.DataSecretName without the need of a controller.
   */
  configRef?: corev1.IObjectReference;
  /**
   * DataSecretName is the name of the secret that stores the bootstrap data script. If nil, the Machine should remain in the Pending state.
   */
  dataSecretName?: string;
}

export interface IMachineDeploymentTemplateSpec {
  /**
   * Bootstrap is a reference to a local struct which encapsulates fields to configure the Machine’s bootstrapping mechanism.
   */
  bootstrap: IMachineDeploymentTemplateSpecBootstrap;
  /**
   * ClusterName is the name of the Cluster this object belongs to.
   */
  clusterName: string;
  /**
   * FailureDomain is the failure domain the machine will be created in. Must match a key in the FailureDomains map stored on the cluster object.
   */
  failureDomain?: string;
  /**
   * InfrastructureRef is a required reference to a custom resource offered by an infrastructure provider.
   */
  infrastructureRef: corev1.IObjectReference;
  /**
   * NodeDrainTimeout is the total amount of time that the controller will spend on draining a node. The default value is 0, meaning that the node can be drained without any time limitations. NOTE: NodeDrainTimeout is different from `kubectl drain --timeout`
   */
  nodeDrainTimeout?: string;
  /**
   * ProviderID is the identification ID of the machine provided by the provider. This field must match the provider ID as seen on the node object corresponding to this machine. This field is required by higher level consumers of cluster-api. Example use case is cluster autoscaler with cluster-api as provider. Clean-up logic in the autoscaler compares machines to nodes to find out machines at provider which could not get registered as Kubernetes nodes. With cluster-api as a generic out-of-tree provider for autoscaler, this field is required by autoscaler to be able to have a provider view of the list of machines. Another list of nodes is queried from the k8s apiserver and then a comparison is done to find out unregistered machines and are marked for delete. This field will be set by the actuators and consumed by higher level entities like autoscaler that will be interfacing with cluster-api as generic provider.
   */
  providerID?: string;
  /**
   * Version defines the desired Kubernetes version. This field is meant to be optionally used by bootstrap providers.
   */
  version?: string;
}

export interface IMachineDeploymentTemplate {
  metadata: metav1.IObjectMeta;
  /**
   * Specification of the desired behavior of the machine. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  spec: IMachineDeploymentTemplateSpec;
}

export interface IMachineDeploymentStrategyRollingUpdate {
  /**
   * DeletePolicy defines the policy used by the MachineDeployment to identify nodes to delete when downscaling. Valid values are "Random, "Newest", "Oldest" When no value is supplied, the default DeletePolicy of MachineSet is used
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

export interface IMachineDeploymentStrategy {
  /**
   * Type of deployment. Default is RollingUpdate.
   */
  type?: 'RollingUpdate' | 'OnDelete';
  /**
   * Rolling update config params. Present only if MachineDeploymentStrategyType = RollingUpdate.
   */
  rollingUpdate?: IMachineDeploymentStrategyRollingUpdate;
}

/**
 * IMachineDeploymentSpec defines the desired state of MachineDeployment.
 */
export interface IMachineDeploymentSpec {
  /**
   * ClusterName is the name of the Cluster this object belongs to.
   */
  clusterName: string;
  /**
   * Minimum number of seconds for which a newly created machine should be ready. Defaults to 0 (machine will be considered available as soon as it is ready)
   */
  minReadySeconds?: number;
  /**
   * Indicates that the deployment is paused.
   */
  paused?: boolean;
  /**
   * The maximum time in seconds for a deployment to make progress before it is considered to be failed. The deployment controller will continue to process failed deployments and a condition with a ProgressDeadlineExceeded reason will be surfaced in the deployment status. Note that progress will not be estimated during the time a deployment is paused. Defaults to 600s.
   */
  progressDeadlineSeconds?: number;
  /**
   * Number of desired machines. Defaults to 1. This is a pointer to distinguish between explicit zero and not specified.
   */
  replicas?: number;
  /**
   * The number of old MachineSets to retain to allow rollback. This is a pointer to distinguish between explicit zero and not specified. Defaults to 1.
   */
  revisionHistoryLimit?: number;
  /**
   * Label selector for machines. Existing MachineSets whose machines are selected by this will be the ones affected by this deployment. It must match the machine template's labels.
   */
  selector?: k8sUrl.IK8sLabelSelector;
  /**
   * The deployment strategy to use to replace existing machines with new ones.
   */
  strategy?: IMachineDeploymentStrategy;
  /**
   * Template describes the machines that will be created.
   */
  template: IMachineDeploymentTemplate;
}

/**
 * IMachineDeploymentStatus defines the observed state of MachineDeployment.
 */
export interface IMachineDeploymentStatus {
  /**
   * Total number of available machines (ready for at least minReadySeconds) targeted by this deployment.
   */
  availableReplicas?: number;
  /**
   * Conditions defines current service state of the MachineDeployment.
   */
  conditions?: ICondition[];
  /**
   * The generation observed by the deployment controller.
   */
  observedGeneration?: number;
  /**
   * Phase represents the current phase of a MachineDeployment (ScalingUp, ScalingDown, Running, Failed, or Unknown).
   */
  phase?: string;
  /**
   * Total number of ready machines targeted by this deployment.
   */
  readyReplicas?: number;
  /**
   * Total number of non-terminated machines targeted by this deployment (their labels match the selector).
   */
  replicas?: number;
  /**
   * Selector is the same as the label selector but in the string format to avoid introspection by clients. The string will be in the same format as the query-param syntax. More info about label selectors: http://kubernetes.io/docs/user-guide/labels#label-selectors
   */
  selector?: string;
  /**
   * Total number of unavailable machines targeted by this deployment. This is the total number of machines that are still required for the deployment to have 100% available capacity. They may either be machines that are running but not yet available or machines that still have not been created.
   */
  unavailableReplicas?: number;
  /**
   * Total number of non-terminated machines targeted by this deployment that have the desired template spec.
   */
  updatedReplicas?: number;
}

export const MachineDeployment = 'MachineDeployment';

/**
 * IMachineDeployment is the Schema for the machinedeployments API.
 */
export interface IMachineDeployment {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof MachineDeployment;
  metadata: metav1.IObjectMeta;
  spec?: IMachineDeploymentSpec;
  status?: IMachineDeploymentStatus;
}

export const MachineDeploymentList = 'MachineDeploymentList';

export interface IMachineDeploymentList
  extends metav1.IList<IMachineDeployment> {
  apiVersion: typeof ApiVersion;
  kind: typeof MachineDeploymentList;
}

export interface IMachineSpecBootstrap {
  /**
   * ConfigRef is a reference to a bootstrap provider-specific resource that holds configuration details. The reference is optional to allow users/operators to specify Bootstrap.DataSecretName without the need of a controller.
   */
  configRef?: corev1.IObjectReference;
  /**
   * DataSecretName is the name of the secret that stores the bootstrap data script. If nil, the Machine should remain in the Pending state.
   */
  dataSecretName?: string;
}

export interface IMachineSpec {
  /**
   * Bootstrap is a reference to a local struct which encapsulates fields to configure the Machine’s bootstrapping mechanism.
   */
  bootstrap: IMachineSpecBootstrap;
  /**
   * ClusterName is the name of the Cluster this object belongs to.
   */
  clusterName: string;
  /**
   * FailureDomain is the failure domain the machine will be created in. Must match a key in the FailureDomains map stored on the cluster object.
   */
  failureDomain?: string;
  /**
   * InfrastructureRef is a required reference to a custom resource offered by an infrastructure provider.
   */
  infrastructureRef: corev1.IObjectReference;
  /**
   * NodeDrainTimeout is the total amount of time that the controller will spend on draining a node. The default value is 0, meaning that the node can be drained without any time limitations. NOTE: NodeDrainTimeout is different from `kubectl drain --timeout`
   */
  nodeDrainTimeout?: string;
  /**
   * ProviderID is the identification ID of the machine provided by the provider. This field must match the provider ID as seen on the node object corresponding to this machine. This field is required by higher level consumers of cluster-api. Example use case is cluster autoscaler with cluster-api as provider. Clean-up logic in the autoscaler compares machines to nodes to find out machines at provider which could not get registered as Kubernetes nodes. With cluster-api as a generic out-of-tree provider for autoscaler, this field is required by autoscaler to be able to have a provider view of the list of machines. Another list of nodes is queried from the k8s apiserver and then a comparison is done to find out unregistered machines and are marked for delete. This field will be set by the actuators and consumed by higher level entities like autoscaler that will be interfacing with cluster-api as generic provider.
   */
  providerID?: string;
  /**
   * Version defines the desired Kubernetes version. This field is meant to be optionally used by bootstrap providers.
   */
  version?: string;
}

export interface IMachineTemplateSpec {
  metadata?: metav1.IObjectMeta;
  /**
   * Specification of the desired behavior of the machine. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#spec-and-status
   */
  spec?: IMachineSpec;
}

/**
 * IMachinePoolSpec defines the desired state of MachinePool.
 */
export interface IMachinePoolSpec {
  /**
   * ClusterName is the name of the Cluster this object belongs to.
   */
  clusterName: string;
  /**
   * FailureDomains is the list of failure domains this MachinePool should be attached to.
   */
  failureDomains?: string[];
  /**
   * Minimum number of seconds for which a newly created machine instances should be ready. Defaults to 0 (machine instance will be considered available as soon as it is ready)
   */
  minReadySeconds?: number;
  /**
   * ProviderIDList are the identification IDs of machine instances provided by the provider. This field must match the provider IDs as seen on the node objects corresponding to a machine pool's machine instances.
   */
  providerIDList?: string[];
  /**
   * Number of desired machines. Defaults to 1. This is a pointer to distinguish between explicit zero and not specified.
   */
  replicas?: number;
  /**
   * Template describes the machines that will be created.
   */
  template: IMachineTemplateSpec;
}

/**
 * IMachinePoolStatus defines the observed state of MachinePool.
 */
export interface IMachinePoolStatus {
  /**
   * The number of available replicas (ready for at least minReadySeconds) for this MachinePool.
   */
  availableReplicas?: number;
  /**
   * BootstrapReady is the state of the bootstrap provider.
   */
  bootstrapReady?: boolean;
  /**
   * Conditions define the current service state of the MachinePool.
   */
  conditions?: ICondition[];
  /**
   * FailureMessage indicates that there is a problem reconciling the state, and will be set to a descriptive error message.
   */
  failureMessage?: string;
  /**
   * FailureReason indicates that there is a problem reconciling the state, and will be set to a token value suitable for programmatic interpretation.
   */
  failureReason?: string;
  /**
   * InfrastructureReady is the state of the infrastructure provider.
   */
  infrastructureReady?: boolean;
  /**
   * NodeRefs will point to the corresponding Nodes if it they exist.
   */
  nodeRefs?: corev1.IObjectReference[];
  /**
   * ObservedGeneration is the latest generation observed by the controller.
   */
  observedGeneration?: number;
  /**
   * Phase represents the current phase of cluster actuation. E.g. Pending, Running, Terminating, Failed etc.
   */
  phase?: string;
  /**
   * The number of ready replicas for this MachinePool. A machine is considered ready when the node has been created and is "Ready".
   */
  readyReplicas?: number;
  /**
   * Replicas is the most recently observed number of replicas.
   */
  replicas?: number;
  /**
   * Total number of unavailable machine instances targeted by this machine pool. This is the total number of machine instances that are still required for the machine pool to have 100% available capacity. They may either be machine instances that are running but not yet available or machine instances that still have not been created.
   */
  unavailableReplicas?: number;
}

export const MachinePool = 'MachinePool';

/**
 * MachinePool is the Schema for the machinepools API.
 */
export interface IMachinePool {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: typeof ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof MachinePool;
  metadata: metav1.IObjectMeta;
  spec?: IMachinePoolSpec;
  status?: IMachinePoolStatus;
}

export const MachinePoolList = 'MachinePoolList';

export interface IMachinePoolList extends metav1.IList<IMachinePool> {
  apiVersion: typeof ApiVersion;
  kind: typeof MachinePoolList;
}

export interface IMachineStatus {
  /**
   * Addresses is a list of addresses assigned to the machine. This field is copied from the infrastructure provider reference.
   */
  addresses?: corev1.INodeAddress[];
  /**
   * BootstrapReady is the state of the bootstrap provider.
   */
  bootstrapReady?: boolean;
  /**
   * Conditions defines current service state of the Machine.
   */
  conditions?: ICondition[];
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
   * InfrastructureReady is the state of the infrastructure provider.
   */
  infrastructureReady?: boolean;
  /**
   * LastUpdated identifies when the phase of the Machine last transitioned.
   */
  lastUpdated?: string;
  /**
   * NodeInfo is a set of ids/uuids to uniquely identify the node. More info: https://kubernetes.io/docs/concepts/nodes/node/#info
   */
  nodeInfo?: corev1.INodeSystemInfo;
  /**
   * NodeRef will point to the corresponding Node if it exists.
   */
  nodeRef?: corev1.IObjectReference;
  /**
   * ObservedGeneration is the latest generation observed by the controller.
   */
  observedGeneration?: number;
  /**
   * Phase represents the current phase of machine actuation. E.g. Pending, Running, Terminating, Failed etc.
   */
  phase?: string;
}

export const Machine = 'Machine';
export interface IMachine {
  apiVersion: typeof ApiVersion;
  kind: typeof Machine;
  metadata?: metav1.IObjectMeta;
  spec?: IMachineSpec;
  status?: IMachineStatus;
}

export const MachineList = 'MachineList';

export interface IMachineList extends metav1.IList<IMachine> {
  apiVersion: typeof ApiVersion;
  kind: typeof MachineList;
}
