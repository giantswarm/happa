import fs from 'fs/promises';
import yaml from 'js-yaml';
import fetch from 'node-fetch';
import path from 'path';
import { compile } from 'json-schema-to-typescript';
import { DeepPartial } from 'utils/helpers';
import { error, log } from './utils';
import {
  getMapiResourcesList,
  IApiGroupInfo,
  IResourceInfo,
} from './getMapiResourcesList';

const bannerComment = `
/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */
`;

/**
 * Expected interface of CustomResourceDefinition (incomplete)
 */
interface ICRD {
  kind: 'CustomResourceDefinition';
  spec: {
    versions: { name: string; schema: { openAPIV3Schema: Object } }[];
  };
}

function formatInterfaceName(resourceName: string): string {
  return `I${resourceName[0].toLocaleUpperCase()}${resourceName.slice(1)}`;
}

async function fetchTypesForResource(
  resource: IResourceInfo,
  resourceVersion: string
): Promise<string> {
  try {
    // fetch
    const response = await fetch(resource.crdURL);
    const data = await response.text();
    const parsedOutput = yaml.load(data) as DeepPartial<ICRD>;

    // try and get schema definition from CRD file contents
    const resourceVersionName = resourceVersion.split('/')?.[1];
    const version = parsedOutput.spec?.versions?.find(
      (v) => v?.name === resourceVersionName
    );
    if (!version) {
      throw new Error(
        `Could not find schema version ${version} for resource ${resource}`
      );
    }

    const schema = version?.schema?.openAPIV3Schema;
    if (!schema) {
      throw new Error(
        `Resource ${resource} does not have an Open API v3 schema for version ${version}`
      );
    }

    // generate TS types
    const output = await compile(schema, formatInterfaceName(resource.name), {
      additionalProperties: false,
      bannerComment,
      style: { singleQuote: true },
    });

    return output;
  } catch (err) {
    return Promise.reject(err);
  }
}

const mapiServicesDirectory = path.resolve('src', 'model', 'services', 'mapi');

async function ensureApiVersionFolder(apiVersionAlias: string) {
  const apiGroupVersionDirPath = path.resolve(
    mapiServicesDirectory,
    apiVersionAlias
  );
  try {
    await fs.mkdir(apiGroupVersionDirPath);
  } catch {
    return Promise.resolve();
  }

  await fs.writeFile(
    path.resolve(apiGroupVersionDirPath, 'index.ts'),
    `export * from './types';\n`
  );
}

async function ensureTypesFolder(typesDirPath: string, apiVersion: string) {
  try {
    await fs.mkdir(typesDirPath);
  } catch {
    return Promise.resolve();
  }

  // export `ApiVersion` constant
  await fs.writeFile(
    path.resolve(typesDirPath, 'index.ts'),
    `export const ApiVersion = '${apiVersion}';\n`
  );
}

async function ensureResourceTypeFile(
  typesDirPath: string,
  resourceName: string,
  data: string
) {
  const resourceFileName = `${resourceName.toLocaleLowerCase()}.ts`;

  await fs.writeFile(path.resolve(typesDirPath, resourceFileName), data);

  const exportLine = `export * from './${resourceName.toLocaleLowerCase()}';\n`;
  let contents;
  try {
    contents = await fs.readFile(path.resolve(typesDirPath, 'index.ts'));
  } catch {}

  if (!contents?.toString().includes(exportLine)) {
    // export types
    await fs.appendFile(path.resolve(typesDirPath, 'index.ts'), exportLine);
  }
}

async function readMapiResourcesListFile() {
  log('Reading MAPI resources list from file...');

  const mapiResources = await getMapiResourcesList();

  log('Read MAPI resources list file successfully.');

  return mapiResources;
}

async function generateTypes(group: IApiGroupInfo) {
  log(`Generating types for ${group.apiVersion}:`);

  const requests = group.resources.map((r) =>
    fetchTypesForResource(r, group.apiVersion)
  );
  const responses = await Promise.allSettled(requests);

  log(`  Ensuring directories... `, false);
  // Create apiGroupVersion folder (e.g. /capiv1beta1) and export
  await ensureApiVersionFolder(group.apiVersionAlias);

  const typesDirPath = path.resolve(
    mapiServicesDirectory,
    group.apiVersionAlias,
    'types'
  );

  // Create types subfolder and export 'ApiVersion' const
  await ensureTypesFolder(typesDirPath, group.apiVersion);
  log('done.');

  log(`  Writing types:`);
  for (let i = 0; i < requests.length; i++) {
    const resource = group.resources[i];
    log(`    ${resource.name}... `, false);

    const response = responses[i];

    if (response.status === 'rejected') {
      error(`Could not get types: ${response.reason}`);

      continue;
    }

    // Create resource type file and export types
    await ensureResourceTypeFile(typesDirPath, resource.name, response.value);
    log(`done.`);
  }
}

export async function main() {
  // TODO: how to overwrite apiVersion and metadata fields?
  // TODO: write interface for list of resource
  try {
    const mapiResources = await readMapiResourcesListFile();

    for (const group of mapiResources) {
      await generateTypes(group);
    }
  } catch (err) {
    error((err as Error).toString());
  }
}

main();
