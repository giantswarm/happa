import fs from 'fs/promises';

import yaml from 'js-yaml';

export function replacer(_: any, value: any) {
  if (typeof value === 'string') {
    return value.replace(/\'/g, '&apos;').replace(/\"/g, '&quot;');
  }
  return value;
}

/**
 * This function fetches the contents of the permissions use cases
 * file from the given path and returns its contents as stringified
 * JSON under the `permissions-use-cases-json` key.
 */
export default async function getPermissionsUseCasesConfig(
  filePath: string
): Promise<string> {
  const useCasesFileContents = await fs.readFile(filePath);
  const useCases = yaml.load(useCasesFileContents.toString()) as Record<
    string,
    any
  >;

  const useCasesObject = {
    'permissions-use-cases-json': JSON.stringify(
      useCases['useCases'],
      replacer
    ),
  };

  return yaml.dump(useCasesObject);
}
