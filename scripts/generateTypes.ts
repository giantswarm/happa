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
import { JSONSchema4 } from 'schema-utils/declarations/validate';

/**
 * Expected interface of CustomResourceDefinition
 */
interface ICRD {
  kind: 'CustomResourceDefinition';
  spec: {
    versions: { name: string; schema: { openAPIV3Schema: JSONSchema4 } }[];
  };
}

const mapiServicesDirectory = path.resolve('src', 'model', 'services', 'mapi');

const defaultTsTypesConfig: Record<string, JSONSchema4> = {
  apiVersion: {
    tsType: 'typeof ApiVersion',
  },
  metadata: {
    tsType: 'metav1.IObjectMeta',
  },
};

function formatTypesFileHeader(apiVersion: string): string {
  return `/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */
  
import * as metav1 from 'model/services/mapi/metav1';

export const ApiVersion = '${apiVersion}';

`;
}

function formatResourceKindDeclaration(resourceName: string): string {
  return `export const ${resourceName} = '${resourceName}';

`;
}

function formatInterfaceName(resourceName: string): string {
  return `I${resourceName[0].toLocaleUpperCase()}${resourceName.slice(1)}`;
}

function applyCustomTsTypes(
  schema: JSONSchema4,
  defaultTsTypesConfig: Record<string, JSONSchema4>
): JSONSchema4 {
  return {
    ...schema,
    properties: {
      ...schema.properties,
      ...defaultTsTypesConfig,
    },
  };
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
    const config = {
      ...defaultTsTypesConfig,
      kind: {
        tsType: `typeof ${resource.name}`,
      },
    };
    const output = await compile(
      applyCustomTsTypes(schema as JSONSchema4, config),
      formatInterfaceName(resource.name),
      {
        additionalProperties: false,
        bannerComment: '',
        style: { singleQuote: true },
      }
    );

    return output;
  } catch (err) {
    return Promise.reject(err);
  }
}

async function ensureApiVersionFolder(apiVersionDirPath: string) {
  try {
    await fs.mkdir(apiVersionDirPath);
  } catch {
    return Promise.resolve();
  }

  await fs.writeFile(
    path.resolve(apiVersionDirPath, 'index.ts'),
    `export * from './types';\n`
  );
}

async function createTypesFile(
  apiVersionDirPath: string,
  header: string,
  data: string
) {
  return fs.writeFile(
    path.resolve(apiVersionDirPath, 'types.ts'),
    header + data
  );
}

async function readMapiResourcesListFile() {
  log('Reading MAPI resources list from file... ', false);

  const mapiResources = await getMapiResourcesList();

  log('done.');

  return mapiResources;
}

async function generateTypes(group: IApiGroupInfo) {
  log(`Generating types for ${group.apiVersion}:`);

  const requests = group.resources.map((r) =>
    fetchTypesForResource(r, group.apiVersion)
  );
  const responses = await Promise.allSettled(requests);

  log(`  Ensuring directories... `, false);
  const apiVersionDirPath = path.resolve(
    mapiServicesDirectory,
    group.apiVersionAlias
  );
  await ensureApiVersionFolder(apiVersionDirPath);
  log('done.');

  let data = '';
  let resourceNamesWritten = [];
  for (let i = 0; i < requests.length; i++) {
    const resource = group.resources[i];
    const response = responses[i];

    if (response.status === 'rejected') {
      error(
        `Could not get types for resource ${resource.name}: ${response.reason}`
      );

      continue;
    }
    data +=
      formatResourceKindDeclaration(resource.name) + response.value + '\n';
    resourceNamesWritten.push(resource.name);
  }

  log(`  Writing types...`);
  resourceNamesWritten.forEach((r) => log(`    ${r}`));
  await createTypesFile(
    apiVersionDirPath,
    formatTypesFileHeader(group.apiVersion),
    data
  );
  log(`  done.`);
}

export async function main() {
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
