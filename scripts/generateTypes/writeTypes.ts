import fs from 'fs/promises';
import path from 'path';

export interface IResourceNames {
  kind: string;
  listKind: string;
  plural: string;
}

const typesFileName = 'types';

const mapiServicesDirectory = path.resolve('src', 'model', 'services', 'mapi');

function formatTypesFileHeader(apiVersion: string): string {
  return `/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import * as metav1 from 'model/services/mapi/metav1';

export const ApiVersion = '${apiVersion}';\n`;
}

export function formatInterfaceName(resourceName: string): string {
  return `I${resourceName[0].toLocaleUpperCase()}${resourceName.slice(1)}`;
}

export function formatResourceKindExport(resourceName: string) {
  return `export const ${resourceName} = '${resourceName}';\n`;
}

export function formatListResourceExport(
  resourceNames: IResourceNames
): string {
  const resourceInterfaceName = formatInterfaceName(resourceNames.kind);
  const listResourceInterfaceName = formatInterfaceName(resourceNames.listKind);

  return `${formatResourceKindExport(resourceNames.listKind)}
export interface ${listResourceInterfaceName} extends metav1.IList<${resourceInterfaceName}> {
  apiVersion: typeof ApiVersion;
  kind: typeof ${resourceNames.listKind};
}\n`;
}

function getApiVersionDirPath(apiVersionAlias: string) {
  return path.resolve(mapiServicesDirectory, apiVersionAlias);
}

export async function ensureApiVersionFolder(
  apiVersionAlias: string
): Promise<string> {
  const apiVersionDirPath = getApiVersionDirPath(apiVersionAlias);

  try {
    await fs.mkdir(apiVersionDirPath);
  } catch {
    return Promise.resolve(apiVersionDirPath);
  }

  await fs.writeFile(
    path.resolve(apiVersionDirPath, 'index.ts'),
    `export * from './${typesFileName}';\n`
  );

  return apiVersionDirPath;
}

export async function writeTypes(
  apiVersionDirPath: string,
  apiVersion: string,
  data: string
) {
  const header = formatTypesFileHeader(apiVersion);

  return fs.writeFile(
    path.resolve(apiVersionDirPath, `${typesFileName}.ts`),
    header + data
  );
}
