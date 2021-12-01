import { Constants } from 'model/constants';

export function getCurrentInstallationContextName(): string {
  const codeName = window.config.info.general.installationName;

  return `gs-${codeName}`;
}

export type KubectlGSCommandModifier = (
  parts: readonly string[]
) => readonly string[];

/**
 * Construct a `kubectl gs` command example.
 *
 * You can use modifiers to add arguments or flags to the command.
 * */
export function makeKubectlGSCommand(
  ...modifiers: KubectlGSCommandModifier[]
): string {
  let commandParts = ['kubectl', 'gs'];

  // Compose a single function that applies all the modifiers.
  const makeParts = modifiers.reduce<KubectlGSCommandModifier>(
    (f, g) => (parts) => g(f(parts)),
    (parts) => parts
  );

  commandParts.push(...makeParts([]));

  // Filter out parts that only contain whitespace.
  commandParts = commandParts.filter((part) => part.trim().length !== 0);

  return commandParts.join(' ');
}

/**
 * Apply a `kubectl` context to a command.
 * */
export function withContext(context: string): KubectlGSCommandModifier {
  return (parts) => ['--context', context, ...parts];
}

/**
 * Relevant configuration options supported by the
 * `get apps` command.
 * */
export interface IKubectlGSGetAppsCommandConfig {
  namespace?: string;
  allNamespaces?: boolean;
  output?: string;
}

/**
 * Generate modifier for constructing the
 * `kubectl gs get apps` command.
 * */
export function withGetApps(
  config: IKubectlGSGetAppsCommandConfig
): KubectlGSCommandModifier {
  return (parts) => {
    const newParts = [...parts, 'get', 'apps'];

    if (config.namespace) {
      newParts.push('--namespace', config.namespace);
    }

    if (config.allNamespaces) {
      newParts.push('--all-namespaces');
    }

    if (config.output) {
      newParts.push('--output', `"${config.output}"`);
    }

    return newParts;
  };
}

/**
 * All the configuration options supported by the
 * `get clusters` command.
 * Taken from:
 * {@link https://github.com/giantswarm/kubectl-gs/blob/master/cmd/get/clusters/flag.go#L14}
 * */
export interface IKubectlGSGetClustersCommandConfig {
  namespace?: string;
  allNamespaces?: boolean;
  name?: string;
  output?: string;
}

/**
 * Generate modifier for constructing the
 * `kubectl gs get clusters` command.
 * */
export function withGetClusters(
  config: IKubectlGSGetClustersCommandConfig
): KubectlGSCommandModifier {
  return (parts) => {
    const newParts = [...parts, 'get', 'clusters'];

    if (config.name) {
      newParts.push(config.name);
    }

    if (config.namespace) {
      newParts.push('--namespace', config.namespace);
    }

    if (config.allNamespaces) {
      newParts.push('--all-namespaces');
    }

    if (config.output) {
      newParts.push('--output', `"${config.output}"`);
    }

    return newParts;
  };
}

/**
 * All the configuration options supported by the
 * `login` command.
 * Taken from:
 * {@link https://github.com/giantswarm/kubectl-gs/blob/master/cmd/login/flag.go}
 * */
export interface IKubectlGSLoginCommandConfig {
  managementCluster: string;
  workloadCluster?: string;
  workloadClusterOrganization?: string;
  certificateGroup?: string[];
  certificateTTL?: string;
}

/**
 * Generate modifier for constructing the
 * `kubectl gs login` command.
 * */
export function withLogin(
  config: IKubectlGSLoginCommandConfig
): KubectlGSCommandModifier {
  return (parts) => {
    const newParts = [...parts, 'login', config.managementCluster];

    if (config.workloadCluster) {
      newParts.push('--workload-cluster', config.workloadCluster);
    }

    if (config.workloadClusterOrganization) {
      newParts.push('--organization', config.workloadClusterOrganization);
    }

    if (config.certificateGroup) {
      for (const group of config.certificateGroup) {
        newParts.push('--certificate-group', group);
      }
    }

    if (config.certificateTTL) {
      newParts.push('--certificate-ttl', config.certificateTTL);
    }

    return newParts;
  };
}

/**
 * All the configuration options supported by the
 * `template cluster` command.
 * Taken from:
 * {@link https://github.com/giantswarm/kubectl-gs/blob/master/cmd/template/cluster/flag.go#L14}
 * */
export interface IKubectlGSTemplateClusterCommandConfig {
  provider: string;
  organization: string;
  release?: string;
  name?: string;
  description?: string;
  labels?: Record<string, string>;
  controlPlaneAZs?: string[];
  output?: string;
}

/**
 * Generate modifier for constructing the
 * `kubectl gs template cluster` command.
 * */
export function withTemplateCluster(
  config: IKubectlGSTemplateClusterCommandConfig
): KubectlGSCommandModifier {
  return (parts) => {
    const newParts = [
      ...parts,
      'template',
      'cluster',
      '--provider',
      config.provider,
      '--organization',
      config.organization,
    ];

    if (config.name) {
      newParts.push('--name', config.name);
    }

    if (config.description) {
      newParts.push('--description', `"${config.description}"`);
    }

    if (config.release) {
      newParts.push('--release', config.release);
    }

    if (config.labels) {
      for (const [key, value] of Object.entries(config.labels)) {
        newParts.push('--label', `"${key}=${value}"`);
      }
    }

    if (config.controlPlaneAZs) {
      for (const controlPlaneAZ of config.controlPlaneAZs) {
        newParts.push('--control-plane-az', controlPlaneAZ);
      }
    }

    if (config.output) {
      newParts.push('--output', `"${config.output}"`);
    }

    return newParts;
  };
}

/**
 * Configuration options supported by the `template nodepool` command.
 * {@link https://github.com/giantswarm/kubectl-gs/blob/master/cmd/template/nodepool/flag.go#L13}
 * */
export interface IKubectlGSTemplateNodePoolCommandConfig {
  provider: string;
  organization: string;
  clusterName: string;
  clusterReleaseVersion: string;
  description?: string;
  azureVMSize?: string;
  awsInstanceType?: string;
  nodePoolAZs?: string[];
  azureUseSpotVMs?: boolean;
  azureSpotVMsMaxPrice?: number;
  nodesMin?: number;
  nodesMax?: number;
  awsOnDemandPercentageAboveBaseCapacity?: number;
  awsOnDemandBaseCapacity?: number;
  output?: string;
}

/**
 * Generate a modifier for constructing the
 * `kubectl gs template nodepool` command.
 * */
export function withTemplateNodePool(
  config: IKubectlGSTemplateNodePoolCommandConfig
): KubectlGSCommandModifier {
  return (parts) => {
    const newParts = [
      ...parts,
      'template',
      'nodepool',
      '--provider',
      config.provider,
      '--organization',
      config.organization,
      '--cluster-name',
      config.clusterName,
      '--release',
      config.clusterReleaseVersion,
    ];

    if (config.description) {
      newParts.push('--description', `"${config.description}"`);
    }

    if (config.azureVMSize) {
      newParts.push('--azure-vm-size', config.azureVMSize);
    }

    if (config.awsInstanceType) {
      newParts.push('--aws-instance-type', config.awsInstanceType);
    }

    if (config.nodePoolAZs && config.nodePoolAZs.length > 0) {
      newParts.push('--availability-zones', config.nodePoolAZs.join(','));
    }

    if (config.azureUseSpotVMs) {
      newParts.push('--azure-spot-vms', '');
    }

    if (config.azureSpotVMsMaxPrice && config.azureSpotVMsMaxPrice > -1) {
      newParts.push(
        '--azure-spot-vms-max-price',
        `${config.azureSpotVMsMaxPrice}`
      );
    }

    if (typeof config.awsOnDemandBaseCapacity !== 'undefined') {
      newParts.push(
        '--on-demand-base-capacity',
        String(config.awsOnDemandBaseCapacity)
      );
    }

    if (typeof config.awsOnDemandPercentageAboveBaseCapacity !== 'undefined') {
      newParts.push(
        '--on-demand-percentage-above-base-capacity',
        String(config.awsOnDemandPercentageAboveBaseCapacity)
      );
    }

    if (
      typeof config.nodesMin !== 'undefined' &&
      config.nodesMin !== Constants.NP_DEFAULT_MIN_SCALING
    ) {
      newParts.push('--nodes-min', `${config.nodesMin}`);
    }

    if (
      typeof config.nodesMax !== 'undefined' &&
      config.nodesMax !== Constants.NP_DEFAULT_MAX_SCALING
    ) {
      newParts.push('--nodes-max', `${config.nodesMax}`);
    }

    if (config.output) {
      newParts.push('--output', `"${config.output}"`);
    }

    return newParts;
  };
}

/**
 * Configuration options supported by the `template organization` command.
 * {@link https://github.com/giantswarm/kubectl-gs/blob/master/cmd/template/organization/flag.go}
 * */
export interface IKubectlGSTemplateOrganizationCommandConfig {
  name: string;
  output?: string;
}

/**
 * Generate a modifier for constructing the
 * `kubectl gs template organization` command.
 * */
export function withTemplateOrganization(
  config: IKubectlGSTemplateOrganizationCommandConfig
): KubectlGSCommandModifier {
  return (parts) => {
    const newParts = [
      ...parts,
      'template',
      'organization',
      '--name',
      config.name,
    ];

    if (config.output) {
      newParts.push('--output', `"${config.output}"`);
    }

    return newParts;
  };
}

function isFlag(value: string): boolean {
  return value.startsWith('--');
}

// The delimiter used between each line of a multi-line command.
const formattingLineBreak = ' \\\n  ';

/**
 * Format a command output in a more user-friendly way.
 * Check out the tests for examples.
 *
 * Note: This should only be used as the last modifier in the list.
 * */
export function withFormatting(
  // eslint-disable-next-line no-magic-numbers
  lineBreakThreshold: number = 30
): KubectlGSCommandModifier {
  return (parts) => {
    const totalLength = parts.join(' ').length;
    if (totalLength <= lineBreakThreshold) return parts;

    const newParts = [];

    let hasFlags = false;
    let hasArgs = false;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const peekPart = parts[i + 1];
      const peekNextPart = parts[i + 2];

      if (isFlag(part)) {
        hasFlags = true;

        if (i > 0) {
          newParts.push(formattingLineBreak);
        }

        newParts.push(part);

        // If the flag has a value, add it to the output.
        if (peekPart && !isFlag(peekPart)) {
          newParts.push(' ', peekPart);
          i++;
        }

        // If after the flag value we have an argument, add a line break.
        if (peekNextPart && !isFlag(peekNextPart)) {
          newParts.push(formattingLineBreak);
        }

        continue;
      }

      hasArgs = true;
      newParts.push(part);
      // If the next value is not a flag, add an argument delimiter.
      if (peekPart && !isFlag(peekPart)) {
        newParts.push(' ');
      }
    }

    if (hasFlags && !hasArgs) {
      newParts.unshift(formattingLineBreak);
    }

    return [newParts.join('').trim()];
  };
}
