import { IResourceInfo } from './getMapiResourcesList';
import yaml from 'js-yaml';
import fetch from 'node-fetch';
import { JSONSchema4 } from 'schema-utils/declarations/validate';
import { compile } from 'json-schema-to-typescript';
import { merge } from 'lodash';
import { DeepPartial } from 'redux';
import { formatInterfaceName } from './writeTypes';

/**
 * Partial interface of CustomResourceDefinition
 */
interface ICRDPartial {
  kind: 'CustomResourceDefinition';
  spec: {
    versions: { name: string; schema: { openAPIV3Schema: JSONSchema4 } }[];
    names: { kind: string; listKind: string; plural: string; singular: string };
    scope: 'Namespaced' | 'Cluster';
  };
}

export interface ICRD extends DeepPartial<ICRDPartial> {}

export interface ICRDForResource {
  resource: IResourceInfo;
  crd: ICRD;
}

/**
 * Provide custom TS types for specified fields
 * @param config
 */
function getTsTypesConfig(config: { kind: string }): JSONSchema4 {
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

function getCRDSchemaForVersion(
  resourceVersion: string,
  resourceName: string,
  CRD: ICRD
): JSONSchema4 {
  // try and get schema definition from CRD file contents
  const resourceVersionNumber = resourceVersion.split('/')?.[1];
  const crdVersion = CRD.spec?.versions?.find(
    (v) => v?.name === resourceVersionNumber
  );
  if (!crdVersion) {
    return Promise.reject(
      new Error(
        `Could not find schema version ${resourceVersionNumber} for resource ${resourceName}`
      )
    );
  }

  // "With apiextensions.k8s.io/v1 the definition of a structural schema is mandatory for CustomResourceDefinitions."
  // https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/#specifying-a-structural-schema
  const schema = crdVersion?.schema?.openAPIV3Schema;
  if (!schema) {
    return Promise.reject(
      new Error(
        `Resource ${resourceName} does not have an Open API v3 schema for version ${resourceVersionNumber}`
      )
    );
  }

  return schema;
}

export async function fetchCRD(URL: string): Promise<ICRD> {
  const response = await fetch(URL);
  const data = await response.text();
  return yaml.load(data) as ICRD;
}

export async function getTypesForResource(
  version: string,
  resourceName: string,
  CRD: ICRD
): Promise<string> {
  try {
    const schema = getCRDSchemaForVersion(version, resourceName, CRD);

    const config = getTsTypesConfig({ kind: resourceName });

    const output = await compile(
      merge(schema, config),
      formatInterfaceName(resourceName),
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
