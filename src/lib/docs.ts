/**
 * Collection of docs.giantswarm.io URLs.
 *
 * For each const, let's document in a comment what we expect
 * to find on the other side.
 */

// Entry point for app platform docs.
export const appPlatformURL = 'https://docs.giantswarm.io/app-platform/';

// How to prepare an AWS account for use with Giant Swarm.
export const cloudProviderAccountSetupAwsURL =
  'https://docs.giantswarm.io/getting-started/cloud-provider-accounts/aws/';

// How to preparte an Azure subscription for use with Giant Swarm.
export const cloudProviderAccountSetupAzureURL =
  'https://docs.giantswarm.io/getting-started/cloud-provider-accounts/azure/';

// List of points to check before an upgrade.
export const clusterUpgradeChecklistURL =
  'https://docs.giantswarm.io/general/cluster-upgrades/#checklist';

// General Kubernetes explanation on exposig workloads to the outside world.
export const exposingWorkloadsURL =
  'https://docs.giantswarm.io/getting-started/exposing-workloads/';

// About installing the CA Cert
export const installingCACert =
  'https://docs.giantswarm.io/getting-started/ca-certificate/';

// Getting started section
export const gettingStartedURL = 'https://docs.giantswarm.io/getting-started/';

// Docs front page
export const homeURL = 'https://docs.giantswarm.io/';

// Explains the installation of an optional ingress controller.
export const ingressControllerInstallationURL =
  'https://docs.giantswarm.io/getting-started/ingress-controller/';

// Collection of Kubernetes resources.
export const kubernetesResourcesURL =
  'https://docs.giantswarm.io/kubernetes/resources/';

// All information about node pools.
export const nodePoolsURL = 'https://docs.giantswarm.io/advanced/node-pools/';

// Organization concept docs.
export const organizationsExplainedURL =
  'https://docs.giantswarm.io/general/organizations/';

export const organizationsNamingConventionsURL =
  'https://docs.giantswarm.io/general/organizations/#naming-conventions';

export const organizationAccessControlWebUI =
  'https://docs.giantswarm.io/ui-api/web/organizations/access-control/';

export const gsctlCreateKubeconfigURL =
  'https://docs.giantswarm.io/ui-api/gsctl/create-kubeconfig/';

export const kubectlGSInstallationURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/installation/';

export const kubectlGSLoginURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/login/';

export const kubectlGSGetClustersURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/get-clusters/';

export const kubectlGSGetCatalogsURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/get-catalogs/';

export const kubectlGSTemplateClusterURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/template-cluster/';

export const kubectlGSTemplateAppURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/template-app/';

export const kubectlGSGetNodePoolsURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/get-nodepools/';

export const kubectlGSTemplateNodePoolURL =
  'https://docs.giantswarm.io/ui-api/kubectl-gs/template-nodepool/';

// Management API introduction page
export const managementAPIIntroduction =
  'https://docs.giantswarm.io/ui-api/management-api/overview/';

// How to create a RoleBinding
export const kubectlCreateRoleBindingURL =
  'https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-rolebinding-em-';

// How to create a ClusterRoleBinding
export const kubectlCreateClusterRoleBindingURL =
  'https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-clusterrolebinding-em-';

// How to manage workload cluster labels via the Management API
export const labellingWorkloadClustersURL =
  'https://docs.giantswarm.io/advanced/labelling-workload-clusters/';

// How to create workload cluster key pairs via the Management API
export const creatingWorkloadClusterKeyPairsURL =
  'https://docs.giantswarm.io/ui-api/management-api/wc-key-pairs/';

// CRD names we expect to find a docs schema page for,
// grouped by publisher domain.
export const crds = {
  giantswarmio: {
    app: 'apps.application.giantswarm.io',
    organization: 'organizations.security.giantswarm.io',
    release: 'releases.release.giantswarm.io',
    catalog: 'catalogs.application.giantswarm.io/',
    appCatalogEntry: 'appcatalogentries.application.giantswarm.io',
  },
  xk8sio: {
    azureCluster: 'azureclusters.infrastructure.cluster.x-k8s.io',
    azureMachine: 'azuremachines.infrastructure.cluster.x-k8s.io',
    cluster: 'clusters.cluster.x-k8s.io',
    machinepool: 'machinepools.exp.cluster.x-k8s.io',
  },
};

// CRD docs URL function
export function crdSchemaURL(fullName: string) {
  const baseURL = 'https://docs.giantswarm.io/ui-api/management-api/crd/';

  return `${baseURL}${fullName}/`;
}
