import fs from 'fs/promises';
import path from 'path';
import {
  formatClientFunctionCreateMethod,
  formatClientFunctionDeleteMethod,
  formatClientFunctionFileHeader,
  formatClientFunctionGetMethod,
  formatClientFunctionListMethod,
  formatClientFunctionUpdateMethod,
  getClientFunctionMethodName,
} from './templates';
import { ClientFunctionVerbs } from './getMapiResourcesList';
import { IResourceNames } from './writeTypes';

const formatFunctionsForVerbs = {
  get: formatClientFunctionGetMethod,
  list: formatClientFunctionListMethod,
  create: formatClientFunctionCreateMethod,
  update: formatClientFunctionUpdateMethod,
  delete: formatClientFunctionDeleteMethod,
};

function getClientFunctionFileName(
  resourceName: string,
  verb: ClientFunctionVerbs
) {
  return `${getClientFunctionMethodName(resourceName, verb)}.ts`;
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

  return fs.writeFile(
    path.resolve(
      apiVersionDirPath,
      getClientFunctionFileName(resourceName, verb)
    ),
    header + data
  );
}
