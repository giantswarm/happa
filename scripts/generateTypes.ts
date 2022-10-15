import fs from 'fs/promises';
import yaml from 'js-yaml';
import fetch from 'node-fetch';
import path from 'path';
import { compile } from 'json-schema-to-typescript';
import { DeepPartial } from 'utils/helpers';
import { log } from './utils';

interface IResourceInfo {
  /**
   * name if the name of the resource - this will be used as the name
   * for the generated TS interface.
   * Important: this should be give in PascalCase, e.g. `MachinePool`.
   */
  name: string;
  /**
   * crdURL is the URL at which the .yaml file of the CRD can be found.
   */
  crdURL: string;
}

interface IAPIGroupVersion {
  /**
   * apiVersionAlias is the folder name for the api version, e.g. `capiv1beta1`.
   */
  apiVersionAlias: string;
  /**
   * apiVersion is the resources' apiVersion, e.g. `cluster.x-k8s.io/v1beta1`.
   */
  apiVersion: string;
  /**
   * resources specifies a list of resources for this API group and version.
   */
  resources: IResourceInfo[];
}

const mapiResources: IAPIGroupVersion[] = [
  {
    apiVersionAlias: 'capav1beta1',
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    resources: [
      {
        name: 'AWSClusterRoleIdentity',
        crdURL:
          'https://raw.githubusercontent.com/kubernetes-sigs/cluster-api-provider-aws/main/config/crd/bases/infrastructure.cluster.x-k8s.io_awsclusterroleidentities.yaml',
      },
      {
        name: 'AWSCluster',
        crdURL:
          ' https://raw.githubusercontent.com/kubernetes-sigs/cluster-api-provider-aws/main/config/crd/bases/infrastructure.cluster.x-k8s.io_awsclusters.yaml',
      },
    ],
  },
];

const bannerComment = `
/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */
`;

// Expected interface of CustomResourceDefinition (incomplete)
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
    const response = await fetch(resource.crdURL);
    const data = await response.text();
    const parsedOutput = yaml.load(data) as DeepPartial<ICRD>;

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

    // Type
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
    await fs.appendFile(path.resolve(typesDirPath, 'index.ts'), exportLine);
  }
}

export async function generateTypes() {
  // -1. If force function is on, will force fetch and overwrite all existing files
  //x 0. Gather list of resources and fetch all resources (by API group) + convert to types data simultaneously
  //x For each resource
  //x 1. If promise is not resolved or there's an exception log error and continue to next resource
  // 2. Create folder structure:
  //x   a. Check for api group dir (e.g. capav1beta1)
  //x      - if not exist, create it, create index.ts and echo "export * from './types';"
  //x      - if exists do nothing
  //x   b. Check in api group dir if /types exists
  //x      - if not exist, create it, create index.ts and echo "export const apiVersion ..."
  //x   c. Check if resource file exists (e.g. awscluster.ts)
  //x     - if exists, we know it has already been typed; log and continue to next resource
  //x     - if not exist, create it and echo types data; echo "export * from './RESOURCE' in index.ts"

  // TODO: how to overwrite apiVersion and meta fields?
  // TODO: write interface for list of resource

  for (const entry of mapiResources) {
    log(`Generating types for ${entry.apiVersion}:`);

    const requests = entry.resources.map((r) =>
      fetchTypesForResource(r, entry.apiVersion)
    );
    const responses = await Promise.allSettled(requests);

    log(`  Ensuring directories... `, false);
    // Create apiGroupVersion folder (e.g. /capiv1beta1) and export
    await ensureApiVersionFolder(entry.apiVersionAlias);

    const typesDirPath = path.resolve(
      mapiServicesDirectory,
      entry.apiVersionAlias,
      'types'
    );
    // Create types subfolder and export 'ApiVersion' const
    await ensureTypesFolder(typesDirPath, entry.apiVersion);
    log('done.');

    log(`  Writing types:`);
    for (let i = 0; i < requests.length; i++) {
      const resource = entry.resources[i];
      log(`    ${resource.name}... `, false);

      const response = responses[i];
      if (response.status === 'rejected') {
        log(`could not get types: ${response.reason}`);

        continue;
      }

      // Create resource type file and export types from the types folder
      await ensureResourceTypeFile(typesDirPath, resource.name, response.value);
      log(`done.`);
    }
  }

  try {
  } catch (err) {
    log((err as Error).toString());
  }
}

generateTypes();
