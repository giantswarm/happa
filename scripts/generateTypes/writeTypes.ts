import fs from 'fs/promises';
import path from 'path';
import { formatTypesFileHeader } from './templates';

export interface IResourceNames {
  kind: string;
  listKind: string;
  plural: string;
}

const typesFileName = 'types';

const mapiServicesDirectory = path.resolve('src', 'model', 'services', 'mapi');

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
