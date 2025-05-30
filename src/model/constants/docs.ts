/**
 * Collection of docs.giantswarm.io URLs.
 *
 * For each const, let's document in a comment what we expect
 * to find on the other side.
 */

// Entry point for app platform docs.
export const appPlatformURL =
  'https://docs.giantswarm.io/getting-started/app-platform/';

// App CR configuration guide
export const appCRConfigurationURL =
  'https://docs.giantswarm.io/getting-started/app-platform/deploy-app/#configuring-an-app-cr';

// App configuration guide
export const appConfigurationURL =
  'https://docs.giantswarm.io/getting-started/app-platform/app-configuration/';

// How to prepare an AWS account for use with Giant Swarm.
export const cloudProviderAccountSetupAwsURL =
  'https://docs.giantswarm.io/getting-started/cloud-provider-accounts/aws/';

// How to preparte an Azure subscription for use with Giant Swarm.
export const cloudProviderAccountSetupAzureURL =
  'https://docs.giantswarm.io/getting-started/cloud-provider-accounts/azure/';

// List of points to check before an upgrade.
export const clusterUpgradeChecklistURL =
  'https://docs.giantswarm.io/platform-overview/cluster-management/cluster-upgrades/#checklist';

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
  'https://docs.giantswarm.io/support/k8s-resources/';

// All information about node pools.
export const nodePoolsURL = 'https://docs.giantswarm.io/advanced/node-pools/';

// Organization concept docs.
export const organizationsExplainedURL =
  'https://docs.giantswarm.io/vintage/platform-overview/multi-tenancy/';

export const organizationsNamingConventionsURL =
  'https://docs.giantswarm.io/vintage/platform-overview/multi-tenancy/#naming-conventions';

export const organizationAccessControlWebUI =
  'https://docs.giantswarm.io/vintage/platform-overview/web-interface/organizations/access-control/';

export const gsctlCreateKubeconfigURL =
  'https://docs.giantswarm.io/vintage/use-the-api/gsctl/create-kubeconfig/';

export const kubectlGSInstallationURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/installation/';

export const kubectlGSGetOrganizationsURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/get-organizations/';

export const kubectlGSLoginURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/login/';

export const kubectlGSGetClustersURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/get-clusters/';

export const kubectlGSUpdateClusterURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/update-cluster/';

export const kubectlGSGetCatalogsURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/get-catalogs/';

export const kubectlGSTemplateClusterURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/template-cluster/';

export const kubectlGSTemplateAppURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/template-app/';

export const kubectlGSGetNodePoolsURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/get-nodepools/';

export const kubectlGSTemplateNodePoolURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/template-nodepool/';

export const kubectlGSUpdateAppURL =
  'https://docs.giantswarm.io/vintage/use-the-api/kubectl-gs/update-app/';

// Management API introduction page
export const managementAPIIntroduction =
  'https://docs.giantswarm.io/vintage/use-the-api/management-api/';

// How to create a RoleBinding
export const kubectlCreateRoleBindingURL =
  'https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-rolebinding-em-';

// How to create a ClusterRoleBinding
export const kubectlCreateClusterRoleBindingURL =
  'https://kubernetes.io/docs/reference/generated/kubectl/kubectl-commands#-em-clusterrolebinding-em-';

// How to manage workload cluster labels via the Management API
export const labellingWorkloadClustersURL =
  'https://docs.giantswarm.io/vintage/advanced/labelling-workload-clusters/';

// GitOps restrictions in the web UI
export const gitopsRestrictions =
  'https://docs.giantswarm.io/vintage/advanced/gitops/manage-workload-clusters/#web-ui-restrictions';

// CRD names we expect to find a docs schema page for,
// grouped by publisher domain.
export const crds = {
  giantswarmio: {
    app: 'apps.application.giantswarm.io',
    organization: 'organizations.security.giantswarm.io',
    release: 'releases.release.giantswarm.io',
    catalog: 'catalogs.application.giantswarm.io/',
    appCatalogEntry: 'appcatalogentries.application.giantswarm.io',
    awsCluster: 'awsclusters.infrastructure.giantswarm.io',
    awsControlPlane: 'awscontrolplanes.infrastructure.giantswarm.io',
    g8sControlPlane: 'g8scontrolplanes.infrastructure.giantswarm.io',
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
  const baseURL =
    'https://docs.giantswarm.io/vintage/use-the-api/management-api/crd/';

  return `${baseURL}${fullName}/`;
}
