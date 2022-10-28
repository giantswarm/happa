import fs from 'fs/promises';
import path from 'path';
import { IApiGroupInfo } from './getMapiResourcesList';

const typesFileName = 'types';

const mapiServicesDirectory = path.resolve('src', 'model', 'services', 'mapi');

function formatTypesFileHeader(apiVersion: string): string {
  return `/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import * as metav1 from 'model/services/mapi/metav1';

export const ApiVersion = '${apiVersion}';\n`;
}

function formatListResourceName(resourceName: string): string {
  return `${resourceName}List`;
}

export function formatInterfaceName(resourceName: string): string {
  return `I${resourceName[0].toLocaleUpperCase()}${resourceName.slice(1)}`;
}

export function formatResourceKindExport(resourceName: string) {
  return `export const ${resourceName} = '${resourceName}';\n`;
}

export function formatListResourceExport(resourceName: string): string {
  const resourceInterfaceName = formatInterfaceName(resourceName);

  const listResourceName = formatListResourceName(resourceName);
  const listResourceInterfaceName = formatInterfaceName(listResourceName);

  return `${formatResourceKindExport(listResourceName)}
export interface ${listResourceInterfaceName} extends metav1.IList<${resourceInterfaceName}> {
  apiVersion: typeof ApiVersion;
  kind: typeof ${listResourceName};
}\n`;
}

function getApiVersionDirPath(apiVersionAlias: string) {
  return path.resolve(mapiServicesDirectory, apiVersionAlias);
}

export async function ensureApiVersionFolder(apiVersionAlias: string) {
  const apiVersionDirPath = getApiVersionDirPath(apiVersionAlias);

  try {
    await fs.mkdir(apiVersionDirPath);
  } catch {
    return Promise.resolve();
  }

  await fs.writeFile(
    path.resolve(apiVersionDirPath, 'index.ts'),
    `export * from './${typesFileName}';\n`
  );
}

export async function writeTypes(group: IApiGroupInfo, data: string) {
  const apiVersionDirPath = getApiVersionDirPath(group.apiVersionAlias);
  const header = formatTypesFileHeader(group.apiVersion);

  return fs.writeFile(
    path.resolve(apiVersionDirPath, `${typesFileName}.ts`),
    header + data
  );
}
