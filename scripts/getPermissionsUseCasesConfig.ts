import fs from 'fs/promises';

import yaml from 'js-yaml';

/**
 * This function fetches the contents of the permissions use cases
 * file from the given path and returns its contents as stringified
 * JSON under the `permissionsUseCasesJson` key.
 */
export default async function getPermissionsUseCasesConfig(
  filePath: string
): Promise<string> {
  const useCasesFileContents = await fs.readFile(filePath);
  const useCases = yaml.load(useCasesFileContents.toString(), {
    schema: yaml.JSON_SCHEMA,
  }) as Record<string, any>;

  const useCasesObject = {
    'permissions-use-cases-json': JSON.stringify(useCases['useCases'])
      .replace(/\'/g, '&apos;')
      .replace(/\\"/g, '\\\\"'),
  };

  return yaml.dump(useCasesObject);
}
