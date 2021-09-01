import { execSync } from 'child_process';
import yaml from 'js-yaml';

/**
 * This function fetches the production `ConfigMap` using the
 * given `kubectl` context.
 * */
export async function getProdConfiguration(context: string): Promise<string> {
  const output = execSync(
    `kubectl --context ${context} get configmaps happa-configmap --namespace giantswarm --output yaml`,
    { encoding: 'utf-8' }
  );

  const parsedOutput = yaml.load(output.toString()) as Record<string, any>;

  return parsedOutput.data['config.yaml'];
}
