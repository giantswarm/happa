import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';

export type ControlPlaneNode = capzv1alpha3.IAzureMachine;

export type ControlPlaneNodeList = capzv1alpha3.IAzureMachineList;

export type Cluster = capiv1alpha3.ICluster;

export type ClusterList = capiv1alpha3.IClusterList;

export type ProviderCluster = capzv1alpha3.IAzureCluster;

export type ProviderClusterList = capzv1alpha3.IAzureClusterList;

export type NodePool =
  | capiv1alpha3.IMachineDeployment
  | capiexpv1alpha3.IMachinePool;

export type NodePoolList =
  | capiv1alpha3.IMachineDeploymentList
  | capiexpv1alpha3.IMachinePoolList;

export type ProviderNodePool = capzexpv1alpha3.IAzureMachinePool | undefined;

export type ProviderNodePoolList = capzexpv1alpha3.IAzureMachinePoolList;

export type BootstrapConfig = gscorev1alpha1.ISpark;
