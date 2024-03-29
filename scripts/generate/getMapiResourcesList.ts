import yaml from 'js-yaml';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.resolve('scripts', 'generate', 'mapi-resources.yaml');

export type ClientFunctionVerbs =
  | 'get'
  | 'list'
  | 'update'
  | 'create'
  | 'delete';

export interface IResourceInfo {
  /**
   * name of the name of the resource - this will be used as the name
   * for the generated TS interface.
   * Important: this should be give in PascalCase, e.g. `MachinePool`.
   */
  name: string;
  /**
   * apiVersion is the resource's apiVersion, e.g. `cluster.x-k8s.io/v1beta1`.
   */
  apiVersion: string;
  /**
   * crdURL is the URL at which the .yaml file of the CRD can be found.
   */
  crdURL: string;
  /**
   * verbs specifies the methods we wish to interact with the verb. Corresponding
   * client functions will be generated based on the verbs specified.
   */
  verbs?: ClientFunctionVerbs[];
}

export interface IApiGroupInfo {
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

export async function getMapiResourcesList(): Promise<IApiGroupInfo[]> {
  const contents = await fs.readFile(filePath);
  const data = yaml.load(contents.toString()) as IApiGroupInfo[];

  return data;
}
