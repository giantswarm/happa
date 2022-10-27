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
  let resourceName = resourceNames.kind;
  let data: string = '\n';

  switch (verb) {
    case 'get':
      data += formatClientFunctionGetMethod(
        apiVersion,
        resourceName,
        resourceNames.plural,
        namespaced,
        verb
      );
      break;
    case 'list':
      resourceName = resourceNames.listKind;

      data += formatClientFunctionListMethod(
        apiVersion,
        resourceName,
        resourceNames.plural,
        namespaced,
        verb
      );
      break;
    case 'create':
      data += formatClientFunctionCreateMethod(
        apiVersion,
        resourceName,
        resourceNames.plural,
        namespaced,
        verb
      );
      break;
    case 'update':
      data += formatClientFunctionUpdateMethod(
        apiVersion,
        resourceName,
        resourceNames.plural,
        namespaced,
        verb
      );
      break;
    case 'delete':
      data += formatClientFunctionDeleteMethod(
        apiVersion,
        resourceName,
        resourceNames.plural,
        namespaced,
        verb
      );
      break;
  }

  const header = formatClientFunctionFileHeader(resourceName, verb);

  return fs.writeFile(
    path.resolve(
      apiVersionDirPath,
      getClientFunctionFileName(resourceName, verb)
    ),
    header + data
  );
}
