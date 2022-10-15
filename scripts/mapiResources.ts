export const mapiResources: IAPIGroupVersion[] = [
  {
    apiVersionAlias: 'capav1beta1',
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    resources: [
      {
        name: 'AWSClusterRoleIdentity',
        crdURL:
          'https://raw.githubusercontent.com/kubernetes-sigs/cluster-api-provider-aws/main/config/crd/bases/infrastructure.cluster.x-k8s.io_awsclusterroleidentities.yaml',
      },
      {
        name: 'AWSCluster',
        crdURL:
          ' https://raw.githubusercontent.com/kubernetes-sigs/cluster-api-provider-aws/main/config/crd/bases/infrastructure.cluster.x-k8s.io_awsclusters.yaml',
      },
    ],
  },
];

export interface IResourceInfo {
  /**
   * name if the name of the resource - this will be used as the name
   * for the generated TS interface.
   * Important: this should be give in PascalCase, e.g. `MachinePool`.
   */
  name: string;
  /**
   * crdURL is the URL at which the .yaml file of the CRD can be found.
   */
  crdURL: string;
}

interface IAPIGroupVersion {
  /**
   * apiVersionAlias is the folder name for the api version, e.g. `capiv1beta1`.
   */
  apiVersionAlias: string;
  /**
   * apiVersion is the resources' apiVersion, e.g. `cluster.x-k8s.io/v1beta1`.
   */
  apiVersion: string;
  /**
   * resources specifies a list of resources for this API group and version.
   */
  resources: IResourceInfo[];
}
