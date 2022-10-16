import { IResourceInfo } from './getMapiResourcesList';
import yaml from 'js-yaml';
import fetch from 'node-fetch';
import { DeepPartial } from 'utils/helpers';
import { JSONSchema4 } from 'schema-utils/declarations/validate';
import { compile } from 'json-schema-to-typescript';
import { merge } from 'lodash';

interface ITsTypesConfig {
  kind: string;
}

function getTsTypesConfig(config: ITsTypesConfig): Record<string, JSONSchema4> {
  return {
    properties: {
      apiVersion: {
        tsType: 'typeof ApiVersion',
      },
      metadata: {
        tsType: 'metav1.IObjectMeta',
      },
      kind: {
        tsType: `typeof ${config.kind}`,
      },
    },
    required: ['apiVersion', 'metadata', 'kind'],
  };
}

function applyCustomTsTypes(
  schema: JSONSchema4,
  tsTypesConfig: Record<string, JSONSchema4>
): JSONSchema4 {
  return merge(schema, tsTypesConfig);
}

export function formatInterfaceName(resourceName: string): string {
  return `I${resourceName[0].toLocaleUpperCase()}${resourceName.slice(1)}`;
}

/**
 * Expected interface of CustomResourceDefinition
 */
interface ICRD {
  kind: 'CustomResourceDefinition';
  spec: {
    versions: { name: string; schema: { openAPIV3Schema: JSONSchema4 } }[];
  };
}

async function fetchCRDSchema(
  resource: IResourceInfo,
  resourceVersion: string
): Promise<JSONSchema4> {
  const response = await fetch(resource.crdURL);
  const data = await response.text();
  const parsedOutput = yaml.load(data) as DeepPartial<ICRD>;

  // try and get schema definition from CRD file contents
  const resourceVersionName = resourceVersion.split('/')?.[1];
  const version = parsedOutput.spec?.versions?.find(
    (v) => v?.name === resourceVersionName
  );
  if (!version) {
    return Promise.reject(
      new Error(
        `Could not find schema version ${version} for resource ${resource}`
      )
    );
  }

  const schema = version?.schema?.openAPIV3Schema;
  if (!schema) {
    return Promise.reject(
      new Error(
        `Resource ${resource} does not have an Open API v3 schema for version ${version}`
      )
    );
  }

  return schema as JSONSchema4;
}

export async function getTypesForResource(
  resource: IResourceInfo,
  resourceVersion: string
): Promise<string> {
  try {
    const schema = await fetchCRDSchema(resource, resourceVersion);

    const config = getTsTypesConfig({ kind: resource.name });

    const output = await compile(
      applyCustomTsTypes(schema, config),
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
