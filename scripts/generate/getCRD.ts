import yaml from 'js-yaml';
import fetch from 'node-fetch';
import { JSONSchema4 } from 'schema-utils/declarations/validate';
import { DeepPartial } from 'redux';
import { IResourceInfo } from './getMapiResourcesList';

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

export async function fetchCRD(URL: string): Promise<ICRD> {
  const response = await fetch(URL);
  const data = await response.text();
  return yaml.load(data) as ICRD;
}
