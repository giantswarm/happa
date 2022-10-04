import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

export const ApiVersion = 'infrastructure.giantswarm.io/v1alpha2';

export const AWSCluster = 'AWSCluster';

export interface IAWSCluster
  extends Omit<infrav1alpha3.IAWSCluster, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}

export const AWSClusterList = 'AWSClusterList';

export interface IAWSClusterList
  extends Omit<infrav1alpha3.IAWSClusterList, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}

export const AWSControlPlane = 'AWSControlPlane';

export interface IAWSControlPlane
  extends Omit<infrav1alpha3.IAWSControlPlane, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}

export const AWSControlPlaneList = 'AWSControlPlaneList';

export interface IAWSControlPlaneList
  extends Omit<infrav1alpha3.IAWSControlPlaneList, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}

export const G8sControlPlane = 'G8sControlPlane';

export interface IG8sControlPlane
  extends Omit<infrav1alpha3.IG8sControlPlane, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}

export const G8sControlPlaneList = 'G8sControlPlaneList';

export interface IG8sControlPlaneList
  extends Omit<infrav1alpha3.IG8sControlPlaneList, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}

export const AWSMachineDeployment = 'AWSMachineDeployment';

export interface IAWSMachineDeployment
  extends Omit<infrav1alpha3.IAWSMachineDeployment, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}

export const AWSMachineDeploymentList = 'AWSMachineDeploymentList';

export interface IAWSMachineDeploymentList
  extends Omit<infrav1alpha3.IAWSMachineDeploymentList, 'apiVersion'> {
  apiVersion: typeof ApiVersion;
}
