import fs from 'fs/promises';
import path from 'path';
import { ClientFunctionVerbs } from './getMapiResourcesList';
import {
  formatGeneratedFileExport,
  formatTypesFileHeader,
  formatClientFunctionCreateMethod,
  formatClientFunctionDeleteMethod,
  formatClientFunctionFileHeader,
  formatClientFunctionGetMethod,
  formatClientFunctionListMethod,
  formatClientFunctionUpdateMethod,
  getClientFunctionMethodName,
} from './templates';

export interface IResourceNames {
  kind: string;
  listKind: string;
  plural: string;
}

const typesFileName = 'types';

const mapiServicesDirectory = path.resolve('src', 'model', 'services', 'mapi');

const formatFunctionsForVerbs = {
  get: formatClientFunctionGetMethod,
  list: formatClientFunctionListMethod,
  create: formatClientFunctionCreateMethod,
  update: formatClientFunctionUpdateMethod,
  delete: formatClientFunctionDeleteMethod,
};

function getApiVersionDirPath(apiVersionAlias: string) {
  return path.resolve(mapiServicesDirectory, apiVersionAlias);
}

export async function ensureApiVersionFolder(
  apiVersionAlias: string
): Promise<string> {
  const apiVersionDirPath = getApiVersionDirPath(apiVersionAlias);

  try {
    await fs.mkdir(apiVersionDirPath, { recursive: true });
  } catch {
    return Promise.resolve(apiVersionDirPath);
  }

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

export async function writeClientFunction(
  apiVersionDirPath: string,
  apiVersion: string,
  resourceNames: IResourceNames,
  namespaced: boolean,
  verb: ClientFunctionVerbs
) {
  const resourceName =
    verb === 'list' ? resourceNames.listKind : resourceNames.kind;

  const header = formatClientFunctionFileHeader(resourceName, verb);
  const data: string =
    '\n' +
    formatFunctionsForVerbs[verb](
      apiVersion,
      resourceName,
      resourceNames.plural,
      namespaced,
      verb
    );

  const clientFunctionFileName = getClientFunctionMethodName(
    resourceName,
    verb
  );

  await fs.writeFile(
    path.resolve(apiVersionDirPath, `${clientFunctionFileName}.ts`),
    header + data
  );

  return clientFunctionFileName;
}

export async function writeExports(
  apiVersionDirPath: string,
  fileNames: string[]
) {
  let fileContents = await fs.readFile(
    path.resolve(apiVersionDirPath, 'index.ts'),
    'utf8'
  );

  // export types
  if (!fileContents.includes(`'./${typesFileName}'`)) {
    fileContents += formatGeneratedFileExport(typesFileName);
  }

  // export client functions
  for (const name of fileNames) {
    if (fileContents.includes(`'./${name}'`)) continue;
    fileContents += formatGeneratedFileExport(name);
  }

  await fs.writeFile(path.resolve(apiVersionDirPath, 'index.ts'), fileContents);
}
