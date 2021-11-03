import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

export interface IAWSCluster
  extends Omit<infrav1alpha3.IAWSCluster, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}

export interface IAWSClusterList
  extends Omit<infrav1alpha3.IAWSClusterList, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}

export interface IAWSControlPlane
  extends Omit<infrav1alpha3.IAWSControlPlane, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}

export interface IAWSControlPlaneList
  extends Omit<infrav1alpha3.IAWSControlPlaneList, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}

export interface IG8sControlPlane
  extends Omit<infrav1alpha3.IG8sControlPlane, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}

export interface IG8sControlPlaneList
  extends Omit<infrav1alpha3.IG8sControlPlaneList, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}

export interface IAWSMachineDeployment
  extends Omit<infrav1alpha3.IAWSMachineDeployment, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}

export interface IAWSMachineDeploymentList
  extends Omit<infrav1alpha3.IAWSMachineDeploymentList, 'apiVersion'> {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha2';
}
