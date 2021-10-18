import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capiv1alpha4 from 'model/services/mapi/capiv1alpha4';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1alpha4 from 'model/services/mapi/capzv1alpha4';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

export type ControlPlaneNode = capzv1alpha3.IAzureMachine;

export type ControlPlaneNodeList = capzv1alpha3.IAzureMachineList;

export type Cluster = capiv1alpha3.ICluster;

export type ClusterList = capiv1alpha3.IClusterList;

export type ProviderCluster =
  | capzv1alpha3.IAzureCluster
  | infrav1alpha3.IAWSCluster
  | undefined;

export type ProviderClusterList = capzv1alpha3.IAzureClusterList;

export type NodePool =
  | capiv1alpha3.IMachineDeployment
  | capiexpv1alpha3.IMachinePool
  | capiv1alpha4.IMachinePool;

export type NodePoolList =
  | capiv1alpha3.IMachineDeploymentList
  | capiexpv1alpha3.IMachinePoolList
  | capiv1alpha4.IMachinePoolList;

export type ProviderNodePool =
  | capzexpv1alpha3.IAzureMachinePool
  | capzv1alpha4.IAzureMachinePool
  | infrav1alpha3.IAWSMachineDeployment
  | undefined;

export type ProviderNodePoolList =
  | capzexpv1alpha3.IAzureMachinePoolList
  | capzv1alpha4.IAzureMachinePoolList;

export type BootstrapConfig = gscorev1alpha1.ISpark;
