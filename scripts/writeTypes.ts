import fs from 'fs/promises';
import path from 'path';
import { IApiGroupInfo } from './getMapiResourcesList';
import { formatInterfaceName } from './getTypesForResource';

const typesFileName = 'types';

const mapiServicesDirectory = path.resolve('src', 'model', 'services', 'mapi');

function getApiVersionDirPath(apiVersionAlias: string) {
  return path.resolve(mapiServicesDirectory, apiVersionAlias);
}

function formatTypesFileHeader(apiVersion: string): string {
  return `/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import * as metav1 from 'model/services/mapi/metav1';

export const ApiVersion = '${apiVersion}';

`;
}

export function formatResourceKindExport(resourceName: string) {
  return `export const ${resourceName} = '${resourceName}';\n`;
}

function formatListResourceName(resourceName: string): string {
  return `${resourceName}List`;
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

export async function createTypesFile(group: IApiGroupInfo, data: string) {
  const apiVersionDirPath = getApiVersionDirPath(group.apiVersionAlias);
  const header = formatTypesFileHeader(group.apiVersion);

  return fs.writeFile(
    path.resolve(apiVersionDirPath, `${typesFileName}.ts`),
    header + data
  );
}
