import * as corev1 from '../corev1';
import * as k8sUrl from '../k8sUrl';
import * as metav1 from '../metav1';

export const ApiGroup = 'cluster.x-k8s.io';

export const ApiVersion = `${ApiGroup}/v1beta1`;

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
  severity?: 'Error' | 'Warning' | 'Info' | '' | string;
  /**
   * Status of the condition, one of True, False, Unknown.
   */
  status:
    | typeof corev1.conditionTrue
    | typeof corev1.conditionFalse
    | typeof corev1.conditionUnknown
    | string;
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
  metadata: metav1.IObjectMeta;
  spec?: IMachineSpec;
  status?: IMachineStatus;
}

export const MachineList = 'MachineList';

export interface IMachineList extends metav1.IList<IMachine> {
  apiVersion: typeof ApiVersion;
  kind: typeof MachineList;
}

export const KubeadmControlPlane = 'KubeadmControlPlane';
export const KubeadmControlPlaneApiVersion =
  'controlplane.cluster.x-k8s.io/v1beta1';

/**
 * KubeadmControlPlane is the Schema for the KubeadmControlPlane API.
 */
export interface IKubeadmControlPlane {
  /**
   * APIVersion defines the versioned schema of this representation of an object.
   * Servers should convert recognized schemas to the latest internal value, and
   * may reject unrecognized values.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
   */
  apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1';
  /**
   * Kind is a string value representing the REST resource this object represents.
   * Servers may infer this from the endpoint the client submits requests to.
   * Cannot be updated.
   * In CamelCase.
   * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
   */
  kind: typeof KubeadmControlPlane;
  metadata: metav1.IObjectMeta;
  /**
   * KubeadmControlPlaneSpec defines the desired state of KubeadmControlPlane.
   */
  spec?: {
    /**
     * KubeadmConfigSpec is a KubeadmConfigSpec
     * to use for initializing and joining machines to the control plane.
     */
    kubeadmConfigSpec: {
      /**
       * ClusterConfiguration along with InitConfiguration are the configurations necessary for the init command
       */
      clusterConfiguration?: {
        /**
         * APIServer contains extra settings for the API server control plane component
         */
        apiServer?: {
          /**
           * CertSANs sets extra Subject Alternative Names for the API Server signing cert.
           */
          certSANs?: string[];
          /**
           * ExtraArgs is an extra set of flags to pass to the control plane component.
           * TODO: This is temporary and ideally we would like to switch all components to
           * use ComponentConfig + ConfigMaps.
           */
          extraArgs?: {
            [k: string]: string;
          };
          /**
           * ExtraVolumes is an extra set of host volumes, mounted to the control plane component.
           */
          extraVolumes?: {
            /**
             * HostPath is the path in the host that will be mounted inside
             * the pod.
             */
            hostPath: string;
            /**
             * MountPath is the path inside the pod where hostPath will be mounted.
             */
            mountPath: string;
            /**
             * Name of the volume inside the pod template.
             */
            name: string;
            /**
             * PathType is the type of the HostPath.
             */
            pathType?: string;
            /**
             * ReadOnly controls write access to the volume
             */
            readOnly?: boolean;
          }[];
          /**
           * TimeoutForControlPlane controls the timeout that we use for API server to appear
           */
          timeoutForControlPlane?: string;
        };
        /**
         * APIVersion defines the versioned schema of this representation of an object.
         * Servers should convert recognized schemas to the latest internal value, and
         * may reject unrecognized values.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
         */
        apiVersion?: string;
        /**
         * CertificatesDir specifies where to store or look for all required certificates.
         * NB: if not provided, this will default to `/etc/kubernetes/pki`
         */
        certificatesDir?: string;
        /**
         * The cluster name
         */
        clusterName?: string;
        /**
         * ControlPlaneEndpoint sets a stable IP address or DNS name for the control plane; it
         * can be a valid IP address or a RFC-1123 DNS subdomain, both with optional TCP port.
         * In case the ControlPlaneEndpoint is not specified, the AdvertiseAddress + BindPort
         * are used; in case the ControlPlaneEndpoint is specified but without a TCP port,
         * the BindPort is used.
         * Possible usages are:
         * e.g. In a cluster with more than one control plane instances, this field should be
         * assigned the address of the external load balancer in front of the
         * control plane instances.
         * e.g.  in environments with enforced node recycling, the ControlPlaneEndpoint
         * could be used for assigning a stable DNS to the control plane.
         * NB: This value defaults to the first value in the Cluster object status.apiEndpoints array.
         */
        controlPlaneEndpoint?: string;
        /**
         * ControllerManager contains extra settings for the controller manager control plane component
         */
        controllerManager?: {
          /**
           * ExtraArgs is an extra set of flags to pass to the control plane component.
           * TODO: This is temporary and ideally we would like to switch all components to
           * use ComponentConfig + ConfigMaps.
           */
          extraArgs?: {
            [k: string]: string;
          };
          /**
           * ExtraVolumes is an extra set of host volumes, mounted to the control plane component.
           */
          extraVolumes?: {
            /**
             * HostPath is the path in the host that will be mounted inside
             * the pod.
             */
            hostPath: string;
            /**
             * MountPath is the path inside the pod where hostPath will be mounted.
             */
            mountPath: string;
            /**
             * Name of the volume inside the pod template.
             */
            name: string;
            /**
             * PathType is the type of the HostPath.
             */
            pathType?: string;
            /**
             * ReadOnly controls write access to the volume
             */
            readOnly?: boolean;
          }[];
        };
        /**
         * DNS defines the options for the DNS add-on installed in the cluster.
         */
        dns?: {
          /**
           * ImageRepository sets the container registry to pull images from.
           * if not set, the ImageRepository defined in ClusterConfiguration will be used instead.
           */
          imageRepository?: string;
          /**
           * ImageTag allows to specify a tag for the image.
           * In case this value is set, kubeadm does not change automatically the version of the above components during upgrades.
           */
          imageTag?: string;
        };
        /**
         * Etcd holds configuration for etcd.
         * NB: This value defaults to a Local (stacked) etcd
         */
        etcd?: {
          /**
           * External describes how to connect to an external etcd cluster
           * Local and External are mutually exclusive
           */
          external?: {
            /**
             * CAFile is an SSL Certificate Authority file used to secure etcd communication.
             * Required if using a TLS connection.
             */
            caFile: string;
            /**
             * CertFile is an SSL certification file used to secure etcd communication.
             * Required if using a TLS connection.
             */
            certFile: string;
            /**
             * Endpoints of etcd members. Required for ExternalEtcd.
             */
            endpoints: string[];
            /**
             * KeyFile is an SSL key file used to secure etcd communication.
             * Required if using a TLS connection.
             */
            keyFile: string;
          };
          /**
           * Local provides configuration knobs for configuring the local etcd instance
           * Local and External are mutually exclusive
           */
          local?: {
            /**
             * DataDir is the directory etcd will place its data.
             * Defaults to "/var/lib/etcd".
             */
            dataDir?: string;
            /**
             * ExtraArgs are extra arguments provided to the etcd binary
             * when run inside a static pod.
             */
            extraArgs?: {
              [k: string]: string;
            };
            /**
             * ImageRepository sets the container registry to pull images from.
             * if not set, the ImageRepository defined in ClusterConfiguration will be used instead.
             */
            imageRepository?: string;
            /**
             * ImageTag allows to specify a tag for the image.
             * In case this value is set, kubeadm does not change automatically the version of the above components during upgrades.
             */
            imageTag?: string;
            /**
             * PeerCertSANs sets extra Subject Alternative Names for the etcd peer signing cert.
             */
            peerCertSANs?: string[];
            /**
             * ServerCertSANs sets extra Subject Alternative Names for the etcd server signing cert.
             */
            serverCertSANs?: string[];
          };
        };
        /**
         * FeatureGates enabled by the user.
         */
        featureGates?: {
          [k: string]: boolean;
        };
        /**
         * ImageRepository sets the container registry to pull images from.
         * * If not set, the default registry of kubeadm will be used, i.e.
         *   * registry.k8s.io (new registry): >= v1.22.17, >= v1.23.15, >= v1.24.9, >= v1.25.0
         *   * k8s.gcr.io (old registry): all older versions
         *   Please note that when imageRepository is not set we don't allow upgrades to
         *   versions >= v1.22.0 which use the old registry (k8s.gcr.io). Please use
         *   a newer patch version with the new registry instead (i.e. >= v1.22.17,
         *   >= v1.23.15, >= v1.24.9, >= v1.25.0).
         * * If the version is a CI build (kubernetes version starts with `ci/` or `ci-cross/`)
         *  `gcr.io/k8s-staging-ci-images` will be used as a default for control plane components
         *   and for kube-proxy, while `registry.k8s.io` will be used for all the other images.
         */
        imageRepository?: string;
        /**
         * Kind is a string value representing the REST resource this object represents.
         * Servers may infer this from the endpoint the client submits requests to.
         * Cannot be updated.
         * In CamelCase.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
         */
        kind?: string;
        /**
         * KubernetesVersion is the target version of the control plane.
         * NB: This value defaults to the Machine object spec.version
         */
        kubernetesVersion?: string;
        /**
         * Networking holds configuration for the networking topology of the cluster.
         * NB: This value defaults to the Cluster object spec.clusterNetwork.
         */
        networking?: {
          /**
           * DNSDomain is the dns domain used by k8s services. Defaults to "cluster.local".
           */
          dnsDomain?: string;
          /**
           * PodSubnet is the subnet used by pods.
           * If unset, the API server will not allocate CIDR ranges for every node.
           * Defaults to a comma-delimited string of the Cluster object's spec.clusterNetwork.services.cidrBlocks if that is set
           */
          podSubnet?: string;
          /**
           * ServiceSubnet is the subnet used by k8s services.
           * Defaults to a comma-delimited string of the Cluster object's spec.clusterNetwork.pods.cidrBlocks, or
           * to "10.96.0.0/12" if that's unset.
           */
          serviceSubnet?: string;
        };
        /**
         * Scheduler contains extra settings for the scheduler control plane component
         */
        scheduler?: {
          /**
           * ExtraArgs is an extra set of flags to pass to the control plane component.
           * TODO: This is temporary and ideally we would like to switch all components to
           * use ComponentConfig + ConfigMaps.
           */
          extraArgs?: {
            [k: string]: string;
          };
          /**
           * ExtraVolumes is an extra set of host volumes, mounted to the control plane component.
           */
          extraVolumes?: {
            /**
             * HostPath is the path in the host that will be mounted inside
             * the pod.
             */
            hostPath: string;
            /**
             * MountPath is the path inside the pod where hostPath will be mounted.
             */
            mountPath: string;
            /**
             * Name of the volume inside the pod template.
             */
            name: string;
            /**
             * PathType is the type of the HostPath.
             */
            pathType?: string;
            /**
             * ReadOnly controls write access to the volume
             */
            readOnly?: boolean;
          }[];
        };
      };
      /**
       * DiskSetup specifies options for the creation of partition tables and file systems on devices.
       */
      diskSetup?: {
        /**
         * Filesystems specifies the list of file systems to setup.
         */
        filesystems?: {
          /**
           * Device specifies the device name
           */
          device: string;
          /**
           * ExtraOpts defined extra options to add to the command for creating the file system.
           */
          extraOpts?: string[];
          /**
           * Filesystem specifies the file system type.
           */
          filesystem: string;
          /**
           * Label specifies the file system label to be used. If set to None, no label is used.
           */
          label: string;
          /**
           * Overwrite defines whether or not to overwrite any existing filesystem.
           * If true, any pre-existing file system will be destroyed. Use with Caution.
           */
          overwrite?: boolean;
          /**
           * Partition specifies the partition to use. The valid options are: "auto|any", "auto", "any", "none", and <NUM>, where NUM is the actual partition number.
           */
          partition?: string;
          /**
           * ReplaceFS is a special directive, used for Microsoft Azure that instructs cloud-init to replace a file system of <FS_TYPE>.
           * NOTE: unless you define a label, this requires the use of the 'any' partition directive.
           */
          replaceFS?: string;
        }[];
        /**
         * Partitions specifies the list of the partitions to setup.
         */
        partitions?: {
          /**
           * Device is the name of the device.
           */
          device: string;
          /**
           * Layout specifies the device layout.
           * If it is true, a single partition will be created for the entire device.
           * When layout is false, it means don't partition or ignore existing partitioning.
           */
          layout: boolean;
          /**
           * Overwrite describes whether to skip checks and create the partition if a partition or filesystem is found on the device.
           * Use with caution. Default is 'false'.
           */
          overwrite?: boolean;
          /**
           * TableType specifies the tupe of partition table. The following are supported:
           * 'mbr': default and setups a MS-DOS partition table
           * 'gpt': setups a GPT partition table
           */
          tableType?: string;
        }[];
      };
      /**
       * Files specifies extra files to be passed to user_data upon creation.
       */
      files?: {
        /**
         * Append specifies whether to append Content to existing file if Path exists.
         */
        append?: boolean;
        /**
         * Content is the actual content of the file.
         */
        content?: string;
        /**
         * ContentFrom is a referenced source of content to populate the file.
         */
        contentFrom?: {
          /**
           * Secret represents a secret that should populate this file.
           */
          secret: {
            /**
             * Key is the key in the secret's data map for this value.
             */
            key: string;
            /**
             * Name of the secret in the KubeadmBootstrapConfig's namespace to use.
             */
            name: string;
          };
        };
        /**
         * Encoding specifies the encoding of the file contents.
         */
        encoding?: 'base64' | 'gzip' | 'gzip+base64';
        /**
         * Owner specifies the ownership of the file, e.g. "root:root".
         */
        owner?: string;
        /**
         * Path specifies the full path on disk where to store the file.
         */
        path: string;
        /**
         * Permissions specifies the permissions to assign to the file, e.g. "0640".
         */
        permissions?: string;
      }[];
      /**
       * Format specifies the output format of the bootstrap data
       */
      format?: 'cloud-config' | 'ignition';
      /**
       * Ignition contains Ignition specific configuration.
       */
      ignition?: {
        /**
         * ContainerLinuxConfig contains CLC specific configuration.
         */
        containerLinuxConfig?: {
          /**
           * AdditionalConfig contains additional configuration to be merged with the Ignition
           * configuration generated by the bootstrapper controller. More info: https://coreos.github.io/ignition/operator-notes/#config-merging
           *
           *
           * The data format is documented here: https://kinvolk.io/docs/flatcar-container-linux/latest/provisioning/cl-config/
           */
          additionalConfig?: string;
          /**
           * Strict controls if AdditionalConfig should be strictly parsed. If so, warnings are treated as errors.
           */
          strict?: boolean;
        };
      };
      /**
       * InitConfiguration along with ClusterConfiguration are the configurations necessary for the init command
       */
      initConfiguration?: {
        /**
         * APIVersion defines the versioned schema of this representation of an object.
         * Servers should convert recognized schemas to the latest internal value, and
         * may reject unrecognized values.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
         */
        apiVersion?: string;
        /**
         * BootstrapTokens is respected at `kubeadm init` time and describes a set of Bootstrap Tokens to create.
         * This information IS NOT uploaded to the kubeadm cluster configmap, partly because of its sensitive nature
         */
        bootstrapTokens?: {
          /**
           * Description sets a human-friendly message why this token exists and what it's used
           * for, so other administrators can know its purpose.
           */
          description?: string;
          /**
           * Expires specifies the timestamp when this token expires. Defaults to being set
           * dynamically at runtime based on the TTL. Expires and TTL are mutually exclusive.
           */
          expires?: string;
          /**
           * Groups specifies the extra groups that this token will authenticate as when/if
           * used for authentication
           */
          groups?: string[];
          /**
           * Token is used for establishing bidirectional trust between nodes and control-planes.
           * Used for joining nodes in the cluster.
           */
          token: string;
          /**
           * TTL defines the time to live for this token. Defaults to 24h.
           * Expires and TTL are mutually exclusive.
           */
          ttl?: string;
          /**
           * Usages describes the ways in which this token can be used. Can by default be used
           * for establishing bidirectional trust, but that can be changed here.
           */
          usages?: string[];
        }[];
        /**
         * Kind is a string value representing the REST resource this object represents.
         * Servers may infer this from the endpoint the client submits requests to.
         * Cannot be updated.
         * In CamelCase.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
         */
        kind?: string;
        /**
         * LocalAPIEndpoint represents the endpoint of the API server instance that's deployed on this control plane node
         * In HA setups, this differs from ClusterConfiguration.ControlPlaneEndpoint in the sense that ControlPlaneEndpoint
         * is the global endpoint for the cluster, which then loadbalances the requests to each individual API server. This
         * configuration object lets you customize what IP/DNS name and port the local API server advertises it's accessible
         * on. By default, kubeadm tries to auto-detect the IP of the default interface and use that, but in case that process
         * fails you may set the desired value here.
         */
        localAPIEndpoint?: {
          /**
           * AdvertiseAddress sets the IP address for the API server to advertise.
           */
          advertiseAddress?: string;
          /**
           * BindPort sets the secure port for the API Server to bind to.
           * Defaults to 6443.
           */
          bindPort?: number;
        };
        /**
         * NodeRegistration holds fields that relate to registering the new control-plane node to the cluster.
         * When used in the context of control plane nodes, NodeRegistration should remain consistent
         * across both InitConfiguration and JoinConfiguration
         */
        nodeRegistration?: {
          /**
           * CRISocket is used to retrieve container runtime info. This information will be annotated to the Node API object, for later re-use
           */
          criSocket?: string;
          /**
           * IgnorePreflightErrors provides a slice of pre-flight errors to be ignored when the current node is registered.
           */
          ignorePreflightErrors?: string[];
          /**
           * ImagePullPolicy specifies the policy for image pulling
           * during kubeadm "init" and "join" operations. The value of
           * this field must be one of "Always", "IfNotPresent" or
           * "Never". Defaults to "IfNotPresent". This can be used only
           * with Kubernetes version equal to 1.22 and later.
           */
          imagePullPolicy?: 'Always' | 'IfNotPresent' | 'Never';
          /**
           * KubeletExtraArgs passes through extra arguments to the kubelet. The arguments here are passed to the kubelet command line via the environment file
           * kubeadm writes at runtime for the kubelet to source. This overrides the generic base-level configuration in the kubelet-config-1.X ConfigMap
           * Flags have higher priority when parsing. These values are local and specific to the node kubeadm is executing on.
           */
          kubeletExtraArgs?: {
            [k: string]: string;
          };
          /**
           * Name is the `.Metadata.Name` field of the Node API object that will be created in this `kubeadm init` or `kubeadm join` operation.
           * This field is also used in the CommonName field of the kubelet's client certificate to the API server.
           * Defaults to the hostname of the node if not provided.
           */
          name?: string;
          /**
           * Taints specifies the taints the Node API object should be registered with. If this field is unset, i.e. nil, in the `kubeadm init` process
           * it will be defaulted to []v1.Taint{'node-role.kubernetes.io/master=""'}. If you don't want to taint your control-plane node, set this field to an
           * empty slice, i.e. `taints: []` in the YAML file. This field is solely used for Node registration.
           */
          taints?: {
            /**
             * Required. The effect of the taint on pods
             * that do not tolerate the taint.
             * Valid effects are NoSchedule, PreferNoSchedule and NoExecute.
             */
            effect: string;
            /**
             * Required. The taint key to be applied to a node.
             */
            key: string;
            /**
             * TimeAdded represents the time at which the taint was added.
             * It is only written for NoExecute taints.
             */
            timeAdded?: string;
            /**
             * The taint value corresponding to the taint key.
             */
            value?: string;
          }[];
        };
        /**
         * Patches contains options related to applying patches to components deployed by kubeadm during
         * "kubeadm init". The minimum kubernetes version needed to support Patches is v1.22
         */
        patches?: {
          /**
           * Directory is a path to a directory that contains files named "target[suffix][+patchtype].extension".
           * For example, "kube-apiserver0+merge.yaml" or just "etcd.json". "target" can be one of
           * "kube-apiserver", "kube-controller-manager", "kube-scheduler", "etcd". "patchtype" can be one
           * of "strategic" "merge" or "json" and they match the patch formats supported by kubectl.
           * The default "patchtype" is "strategic". "extension" must be either "json" or "yaml".
           * "suffix" is an optional string that can be used to determine which patches are applied
           * first alpha-numerically.
           * These files can be written into the target directory via KubeadmConfig.Files which
           * specifies additional files to be created on the machine, either with content inline or
           * by referencing a secret.
           */
          directory?: string;
        };
        /**
         * SkipPhases is a list of phases to skip during command execution.
         * The list of phases can be obtained with the "kubeadm init --help" command.
         * This option takes effect only on Kubernetes >=1.22.0.
         */
        skipPhases?: string[];
      };
      /**
       * JoinConfiguration is the kubeadm configuration for the join command
       */
      joinConfiguration?: {
        /**
         * APIVersion defines the versioned schema of this representation of an object.
         * Servers should convert recognized schemas to the latest internal value, and
         * may reject unrecognized values.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources
         */
        apiVersion?: string;
        /**
         * CACertPath is the path to the SSL certificate authority used to
         * secure comunications between node and control-plane.
         * Defaults to "/etc/kubernetes/pki/ca.crt".
         * TODO: revisit when there is defaulting from k/k
         */
        caCertPath?: string;
        /**
         * ControlPlane defines the additional control plane instance to be deployed on the joining node.
         * If nil, no additional control plane instance will be deployed.
         */
        controlPlane?: {
          /**
           * LocalAPIEndpoint represents the endpoint of the API server instance to be deployed on this node.
           */
          localAPIEndpoint?: {
            /**
             * AdvertiseAddress sets the IP address for the API server to advertise.
             */
            advertiseAddress?: string;
            /**
             * BindPort sets the secure port for the API Server to bind to.
             * Defaults to 6443.
             */
            bindPort?: number;
          };
        };
        /**
         * Discovery specifies the options for the kubelet to use during the TLS Bootstrap process
         * TODO: revisit when there is defaulting from k/k
         */
        discovery?: {
          /**
           * BootstrapToken is used to set the options for bootstrap token based discovery
           * BootstrapToken and File are mutually exclusive
           */
          bootstrapToken?: {
            /**
             * APIServerEndpoint is an IP or domain name to the API server from which info will be fetched.
             */
            apiServerEndpoint?: string;
            /**
             * CACertHashes specifies a set of public key pins to verify
             * when token-based discovery is used. The root CA found during discovery
             * must match one of these values. Specifying an empty set disables root CA
             * pinning, which can be unsafe. Each hash is specified as "<type>:<value>",
             * where the only currently supported type is "sha256". This is a hex-encoded
             * SHA-256 hash of the Subject Public Key Info (SPKI) object in DER-encoded
             * ASN.1. These hashes can be calculated using, for example, OpenSSL:
             * openssl x509 -pubkey -in ca.crt openssl rsa -pubin -outform der 2>&/dev/null | openssl dgst -sha256 -hex
             */
            caCertHashes?: string[];
            /**
             * Token is a token used to validate cluster information
             * fetched from the control-plane.
             */
            token: string;
            /**
             * UnsafeSkipCAVerification allows token-based discovery
             * without CA verification via CACertHashes. This can weaken
             * the security of kubeadm since other nodes can impersonate the control-plane.
             */
            unsafeSkipCAVerification?: boolean;
          };
          /**
           * File is used to specify a file or URL to a kubeconfig file from which to load cluster information
           * BootstrapToken and File are mutually exclusive
           */
          file?: {
            /**
             * KubeConfigPath is used to specify the actual file path or URL to the kubeconfig file from which to load cluster information
             */
            kubeConfigPath: string;
          };
          /**
           * Timeout modifies the discovery timeout
           */
          timeout?: string;
          /**
           * TLSBootstrapToken is a token used for TLS bootstrapping.
           * If .BootstrapToken is set, this field is defaulted to .BootstrapToken.Token, but can be overridden.
           * If .File is set, this field **must be set** in case the KubeConfigFile does not contain any other authentication information
           */
          tlsBootstrapToken?: string;
        };
        /**
         * Kind is a string value representing the REST resource this object represents.
         * Servers may infer this from the endpoint the client submits requests to.
         * Cannot be updated.
         * In CamelCase.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
         */
        kind?: string;
        /**
         * NodeRegistration holds fields that relate to registering the new control-plane node to the cluster.
         * When used in the context of control plane nodes, NodeRegistration should remain consistent
         * across both InitConfiguration and JoinConfiguration
         */
        nodeRegistration?: {
          /**
           * CRISocket is used to retrieve container runtime info. This information will be annotated to the Node API object, for later re-use
           */
          criSocket?: string;
          /**
           * IgnorePreflightErrors provides a slice of pre-flight errors to be ignored when the current node is registered.
           */
          ignorePreflightErrors?: string[];
          /**
           * ImagePullPolicy specifies the policy for image pulling
           * during kubeadm "init" and "join" operations. The value of
           * this field must be one of "Always", "IfNotPresent" or
           * "Never". Defaults to "IfNotPresent". This can be used only
           * with Kubernetes version equal to 1.22 and later.
           */
          imagePullPolicy?: 'Always' | 'IfNotPresent' | 'Never';
          /**
           * KubeletExtraArgs passes through extra arguments to the kubelet. The arguments here are passed to the kubelet command line via the environment file
           * kubeadm writes at runtime for the kubelet to source. This overrides the generic base-level configuration in the kubelet-config-1.X ConfigMap
           * Flags have higher priority when parsing. These values are local and specific to the node kubeadm is executing on.
           */
          kubeletExtraArgs?: {
            [k: string]: string;
          };
          /**
           * Name is the `.Metadata.Name` field of the Node API object that will be created in this `kubeadm init` or `kubeadm join` operation.
           * This field is also used in the CommonName field of the kubelet's client certificate to the API server.
           * Defaults to the hostname of the node if not provided.
           */
          name?: string;
          /**
           * Taints specifies the taints the Node API object should be registered with. If this field is unset, i.e. nil, in the `kubeadm init` process
           * it will be defaulted to []v1.Taint{'node-role.kubernetes.io/master=""'}. If you don't want to taint your control-plane node, set this field to an
           * empty slice, i.e. `taints: []` in the YAML file. This field is solely used for Node registration.
           */
          taints?: {
            /**
             * Required. The effect of the taint on pods
             * that do not tolerate the taint.
             * Valid effects are NoSchedule, PreferNoSchedule and NoExecute.
             */
            effect: string;
            /**
             * Required. The taint key to be applied to a node.
             */
            key: string;
            /**
             * TimeAdded represents the time at which the taint was added.
             * It is only written for NoExecute taints.
             */
            timeAdded?: string;
            /**
             * The taint value corresponding to the taint key.
             */
            value?: string;
          }[];
        };
        /**
         * Patches contains options related to applying patches to components deployed by kubeadm during
         * "kubeadm join". The minimum kubernetes version needed to support Patches is v1.22
         */
        patches?: {
          /**
           * Directory is a path to a directory that contains files named "target[suffix][+patchtype].extension".
           * For example, "kube-apiserver0+merge.yaml" or just "etcd.json". "target" can be one of
           * "kube-apiserver", "kube-controller-manager", "kube-scheduler", "etcd". "patchtype" can be one
           * of "strategic" "merge" or "json" and they match the patch formats supported by kubectl.
           * The default "patchtype" is "strategic". "extension" must be either "json" or "yaml".
           * "suffix" is an optional string that can be used to determine which patches are applied
           * first alpha-numerically.
           * These files can be written into the target directory via KubeadmConfig.Files which
           * specifies additional files to be created on the machine, either with content inline or
           * by referencing a secret.
           */
          directory?: string;
        };
        /**
         * SkipPhases is a list of phases to skip during command execution.
         * The list of phases can be obtained with the "kubeadm init --help" command.
         * This option takes effect only on Kubernetes >=1.22.0.
         */
        skipPhases?: string[];
      };
      /**
       * Mounts specifies a list of mount points to be setup.
       */
      mounts?: string[][];
      /**
       * NTP specifies NTP configuration
       */
      ntp?: {
        /**
         * Enabled specifies whether NTP should be enabled
         */
        enabled?: boolean;
        /**
         * Servers specifies which NTP servers to use
         */
        servers?: string[];
      };
      /**
       * PostKubeadmCommands specifies extra commands to run after kubeadm runs
       */
      postKubeadmCommands?: string[];
      /**
       * PreKubeadmCommands specifies extra commands to run before kubeadm runs
       */
      preKubeadmCommands?: string[];
      /**
       * UseExperimentalRetryJoin replaces a basic kubeadm command with a shell
       * script with retries for joins.
       *
       *
       * This is meant to be an experimental temporary workaround on some environments
       * where joins fail due to timing (and other issues). The long term goal is to add retries to
       * kubeadm proper and use that functionality.
       *
       *
       * This will add about 40KB to userdata
       *
       *
       * For more information, refer to https://github.com/kubernetes-sigs/cluster-api/pull/2763#discussion_r397306055.
       *
       *
       * Deprecated: This experimental fix is no longer needed and this field will be removed in a future release.
       * When removing also remove from staticcheck exclude-rules for SA1019 in golangci.yml
       */
      useExperimentalRetryJoin?: boolean;
      /**
       * Users specifies extra users to add
       */
      users?: {
        /**
         * Gecos specifies the gecos to use for the user
         */
        gecos?: string;
        /**
         * Groups specifies the additional groups for the user
         */
        groups?: string;
        /**
         * HomeDir specifies the home directory to use for the user
         */
        homeDir?: string;
        /**
         * Inactive specifies whether to mark the user as inactive
         */
        inactive?: boolean;
        /**
         * LockPassword specifies if password login should be disabled
         */
        lockPassword?: boolean;
        /**
         * Name specifies the user name
         */
        name: string;
        /**
         * Passwd specifies a hashed password for the user
         */
        passwd?: string;
        /**
         * PasswdFrom is a referenced source of passwd to populate the passwd.
         */
        passwdFrom?: {
          /**
           * Secret represents a secret that should populate this password.
           */
          secret: {
            /**
             * Key is the key in the secret's data map for this value.
             */
            key: string;
            /**
             * Name of the secret in the KubeadmBootstrapConfig's namespace to use.
             */
            name: string;
          };
        };
        /**
         * PrimaryGroup specifies the primary group for the user
         */
        primaryGroup?: string;
        /**
         * Shell specifies the user's shell
         */
        shell?: string;
        /**
         * SSHAuthorizedKeys specifies a list of ssh authorized keys for the user
         */
        sshAuthorizedKeys?: string[];
        /**
         * Sudo specifies a sudo role for the user
         */
        sudo?: string;
      }[];
      /**
       * Verbosity is the number for the kubeadm log level verbosity.
       * It overrides the `--v` flag in kubeadm commands.
       */
      verbosity?: number;
    };
    /**
     * MachineTemplate contains information about how machines
     * should be shaped when creating or updating a control plane.
     */
    machineTemplate: {
      /**
       * InfrastructureRef is a required reference to a custom resource
       * offered by an infrastructure provider.
       */
      infrastructureRef: {
        /**
         * API version of the referent.
         */
        apiVersion?: string;
        /**
         * If referring to a piece of an object instead of an entire object, this string
         * should contain a valid JSON/Go field access statement, such as desiredState.manifest.containers[2].
         * For example, if the object reference is to a container within a pod, this would take on a value like:
         * "spec.containers{name}" (where "name" refers to the name of the container that triggered
         * the event) or if no container name is specified "spec.containers[2]" (container with
         * index 2 in this pod). This syntax is chosen only to have some well-defined way of
         * referencing a part of an object.
         * TODO: this design is not final and this field is subject to change in the future.
         */
        fieldPath?: string;
        /**
         * Kind of the referent.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds
         */
        kind?: string;
        /**
         * Name of the referent.
         * More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#names
         */
        name?: string;
        /**
         * Namespace of the referent.
         * More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/
         */
        namespace?: string;
        /**
         * Specific resourceVersion to which this reference is made, if any.
         * More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#concurrency-control-and-consistency
         */
        resourceVersion?: string;
        /**
         * UID of the referent.
         * More info: https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#uids
         */
        uid?: string;
      };
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
       * NodeDeletionTimeout defines how long the machine controller will attempt to delete the Node that the Machine
       * hosts after the Machine is marked for deletion. A duration of 0 will retry deletion indefinitely.
       * If no value is provided, the default value for this property of the Machine resource will be used.
       */
      nodeDeletionTimeout?: string;
      /**
       * NodeDrainTimeout is the total amount of time that the controller will spend on draining a controlplane node
       * The default value is 0, meaning that the node can be drained without any time limitations.
       * NOTE: NodeDrainTimeout is different from `kubectl drain --timeout`
       */
      nodeDrainTimeout?: string;
      /**
       * NodeVolumeDetachTimeout is the total amount of time that the controller will spend on waiting for all volumes
       * to be detached. The default value is 0, meaning that the volumes can be detached without any time limitations.
       */
      nodeVolumeDetachTimeout?: string;
    };
    /**
     * The RemediationStrategy that controls how control plane machine remediation happens.
     */
    remediationStrategy?: {
      /**
       * MaxRetry is the Max number of retries while attempting to remediate an unhealthy machine.
       * A retry happens when a machine that was created as a replacement for an unhealthy machine also fails.
       * For example, given a control plane with three machines M1, M2, M3:
       *
       *
       * 	M1 become unhealthy; remediation happens, and M1-1 is created as a replacement.
       * 	If M1-1 (replacement of M1) has problems while bootstrapping it will become unhealthy, and then be
       * 	remediated; such operation is considered a retry, remediation-retry #1.
       * 	If M1-2 (replacement of M1-1) becomes unhealthy, remediation-retry #2 will happen, etc.
       *
       *
       * A retry could happen only after RetryPeriod from the previous retry.
       * If a machine is marked as unhealthy after MinHealthyPeriod from the previous remediation expired,
       * this is not considered a retry anymore because the new issue is assumed unrelated from the previous one.
       *
       *
       * If not set, the remedation will be retried infinitely.
       */
      maxRetry?: number;
      /**
       * MinHealthyPeriod defines the duration after which KCP will consider any failure to a machine unrelated
       * from the previous one. In this case the remediation is not considered a retry anymore, and thus the retry
       * counter restarts from 0. For example, assuming MinHealthyPeriod is set to 1h (default)
       *
       *
       * 	M1 become unhealthy; remediation happens, and M1-1 is created as a replacement.
       * 	If M1-1 (replacement of M1) has problems within the 1hr after the creation, also
       * 	this machine will be remediated and this operation is considered a retry - a problem related
       * 	to the original issue happened to M1 -.
       *
       *
       * 	If instead the problem on M1-1 is happening after MinHealthyPeriod expired, e.g. four days after
       * 	m1-1 has been created as a remediation of M1, the problem on M1-1 is considered unrelated to
       * 	the original issue happened to M1.
       *
       *
       * If not set, this value is defaulted to 1h.
       */
      minHealthyPeriod?: string;
      /**
       * RetryPeriod is the duration that KCP should wait before remediating a machine being created as a replacement
       * for an unhealthy machine (a retry).
       *
       *
       * If not set, a retry will happen immediately.
       */
      retryPeriod?: string;
    };
    /**
     * Number of desired machines. Defaults to 1. When stacked etcd is used only
     * odd numbers are permitted, as per [etcd best practice](https://etcd.io/docs/v3.3.12/faq/#why-an-odd-number-of-cluster-members).
     * This is a pointer to distinguish between explicit zero and not specified.
     */
    replicas?: number;
    /**
     * RolloutAfter is a field to indicate a rollout should be performed
     * after the specified time even if no changes have been made to the
     * KubeadmControlPlane.
     * Example: In the YAML the time can be specified in the RFC3339 format.
     * To specify the rolloutAfter target as March 9, 2023, at 9 am UTC
     * use "2023-03-09T09:00:00Z".
     */
    rolloutAfter?: string;
    /**
     * RolloutBefore is a field to indicate a rollout should be performed
     * if the specified criteria is met.
     */
    rolloutBefore?: {
      /**
       * CertificatesExpiryDays indicates a rollout needs to be performed if the
       * certificates of the machine will expire within the specified days.
       */
      certificatesExpiryDays?: number;
    };
    /**
     * The RolloutStrategy to use to replace control plane machines with
     * new ones.
     */
    rolloutStrategy?: {
      /**
       * Rolling update config params. Present only if
       * RolloutStrategyType = RollingUpdate.
       */
      rollingUpdate?: {
        /**
         * The maximum number of control planes that can be scheduled above or under the
         * desired number of control planes.
         * Value can be an absolute number 1 or 0.
         * Defaults to 1.
         * Example: when this is set to 1, the control plane can be scaled
         * up immediately when the rolling update starts.
         */
        maxSurge?: number | string;
      };
      /**
       * Type of rollout. Currently the only supported strategy is
       * "RollingUpdate".
       * Default is RollingUpdate.
       */
      type?: string;
    };
    /**
     * Version defines the desired Kubernetes version.
     * Please note that if kubeadmConfigSpec.ClusterConfiguration.imageRepository is not set
     * we don't allow upgrades to versions >= v1.22.0 for which kubeadm uses the old registry (k8s.gcr.io).
     * Please use a newer patch version with the new registry instead. The default registries of kubeadm are:
     *   * registry.k8s.io (new registry): >= v1.22.17, >= v1.23.15, >= v1.24.9, >= v1.25.0
     *   * k8s.gcr.io (old registry): all older versions
     */
    version: string;
  };
  /**
   * KubeadmControlPlaneStatus defines the observed state of KubeadmControlPlane.
   */
  status?: {
    /**
     * Conditions defines current service state of the KubeadmControlPlane.
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
     * ErrorMessage indicates that there is a terminal problem reconciling the
     * state, and will be set to a descriptive error message.
     */
    failureMessage?: string;
    /**
     * FailureReason indicates that there is a terminal problem reconciling the
     * state, and will be set to a token value suitable for
     * programmatic interpretation.
     */
    failureReason?: string;
    /**
     * Initialized denotes whether or not the control plane has the
     * uploaded kubeadm-config configmap.
     */
    initialized?: boolean;
    /**
     * LastRemediation stores info about last remediation performed.
     */
    lastRemediation?: {
      /**
       * Machine is the machine name of the latest machine being remediated.
       */
      machine: string;
      /**
       * RetryCount used to keep track of remediation retry for the last remediated machine.
       * A retry happens when a machine that was created as a replacement for an unhealthy machine also fails.
       */
      retryCount: number;
      /**
       * Timestamp is when last remediation happened. It is represented in RFC3339 form and is in UTC.
       */
      timestamp: string;
    };
    /**
     * ObservedGeneration is the latest generation observed by the controller.
     */
    observedGeneration?: number;
    /**
     * Ready denotes that the KubeadmControlPlane API Server is ready to
     * receive requests.
     */
    ready?: boolean;
    /**
     * Total number of fully running and ready control plane machines.
     */
    readyReplicas?: number;
    /**
     * Total number of non-terminated machines targeted by this control plane
     * (their labels match the selector).
     */
    replicas?: number;
    /**
     * Selector is the label selector in string format to avoid introspection
     * by clients, and is used to provide the CRD-based integration for the
     * scale subresource and additional integrations for things like kubectl
     * describe.. The string will be in the same format as the query-param syntax.
     * More info about label selectors: http://kubernetes.io/docs/user-guide/labels#label-selectors
     */
    selector?: string;
    /**
     * Total number of unavailable machines targeted by this control plane.
     * This is the total number of machines that are still required for
     * the deployment to have 100% available capacity. They may either
     * be machines that are running but not yet ready or machines
     * that still have not been created.
     */
    unavailableReplicas?: number;
    /**
     * Total number of non-terminated machines targeted by this control plane
     * that have the desired template spec.
     */
    updatedReplicas?: number;
    /**
     * Version represents the minimum Kubernetes version for the control plane machines
     * in the cluster.
     */
    version?: string;
  };
}

export const KubeadmControlPlaneList = 'KubeadmControlPlaneList';

export interface IKubeadmControlPlaneList
  extends metav1.IList<IKubeadmControlPlane> {
  apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1';
  kind: typeof KubeadmControlPlaneList;
}
