import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';
import * as infrav1alpha2 from 'model/services/mapi/infrastructurev1alpha2';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

export type ControlPlaneNode =
  | capzv1beta1.IAzureMachine
  | infrav1alpha2.IAWSControlPlane
  | infrav1alpha2.IG8sControlPlane
  | infrav1alpha3.IAWSControlPlane
  | infrav1alpha3.IG8sControlPlane
  | capgv1beta1.IGCPMachineTemplate
  | capiv1beta1.IMachine;

export type ControlPlaneNodeList =
  | capzv1beta1.IAzureMachineList
  | infrav1alpha2.IAWSControlPlaneList
  | infrav1alpha2.IG8sControlPlaneList
  | infrav1alpha3.IAWSControlPlaneList
  | infrav1alpha3.IG8sControlPlaneList
  | capgv1beta1.IGCPMachineTemplateList
  | capiv1beta1.IMachineList;

export type Cluster = capiv1beta1.ICluster;

export type ClusterList = capiv1beta1.IClusterList;

export type ProviderCluster =
  | capzv1beta1.IAzureCluster
  | infrav1alpha2.IAWSCluster
  | infrav1alpha3.IAWSCluster
  | capgv1beta1.IGCPCluster
  | undefined;

export type ProviderClusterList =
  | capzv1beta1.IAzureClusterList
  | infrav1alpha2.IAWSClusterList
  | infrav1alpha3.IAWSClusterList
  | capgv1beta1.IGCPClusterList;

export type NodePool =
  | capiv1beta1.IMachineDeployment
  | capiexpv1alpha3.IMachinePool
  | capiv1beta1.IMachinePool;

export type NodePoolList =
  | capiv1beta1.IMachineDeploymentList
  | capiexpv1alpha3.IMachinePoolList
  | capiv1beta1.IMachinePoolList;

export type ProviderNodePool =
  | capzexpv1alpha3.IAzureMachinePool
  | capzv1beta1.IAzureMachinePool
  | infrav1alpha2.IAWSMachineDeployment
  | infrav1alpha3.IAWSMachineDeployment
  | capgv1beta1.IGCPMachineTemplate
  | undefined;

export type ProviderNodePoolList =
  | capzexpv1alpha3.IAzureMachinePoolList
  | capzv1beta1.IAzureMachinePoolList
  | infrav1alpha2.IAWSMachineDeploymentList
  | infrav1alpha3.IAWSMachineDeploymentList
  | capgv1beta1.IGCPMachineTemplateList;

export type BootstrapConfig = gscorev1alpha1.ISpark | undefined;
