import { IState } from 'stores/state';

export function getCurrentInstallationContextName(state: IState): string {
  const codeName = state.main.info.general.installation_name;

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
 * All the configuration options supported by the
 * `template cluster` command.
 * Taken from:
 * {@link https://github.com/giantswarm/kubectl-gs/blob/master/cmd/template/cluster/flag.go#L14}
 * */
export interface IKubectlGSTemplateClusterCommandConfig {
  provider: string;
  owner: string;
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
      '--owner',
      config.owner,
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
 * All the configuration options supported by the
 * `template cluster` command.
 * Taken from:
 * {@link https://github.com/giantswarm/kubectl-gs/blob/master/cmd/get/clusters/flag.go#L14}
 * */
export interface IKubectlGSGetClustersCommandConfig {
  namespace?: string;
  allNamespaces?: boolean;
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

    if (config.namespace) {
      newParts.push('--namespace', config.namespace);
    }

    if (config.allNamespaces) {
      newParts.push('--all-namespaces');
    }

    return newParts;
  };
}

function isFlag(value: string): boolean {
  return value.startsWith('--');
}

// The delimiter used between each line of a multi-line command.
const formattingLineBreak = ' \\\n    ';

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
