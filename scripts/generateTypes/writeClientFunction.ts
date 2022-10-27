import fs from 'fs/promises';
import path from 'path';
import {
  formatClientFunctionFileHeader,
  formatClientFunctionGetMethod,
  getClientFunctionMethodName,
} from './templates';
import { ClientFunctionVerbs } from './getMapiResourcesList';
import { IResourceNames } from './writeTypes';

export async function writeClientFunction(
  apiVersionDirPath: string,
  apiVersion: string,
  resourceNames: IResourceNames,
  namespaced: boolean,
  verb: ClientFunctionVerbs
) {
  const header = formatClientFunctionFileHeader(resourceNames.kind, verb);
  let data: string = '';

  switch (verb) {
    case 'get':
      data += `\n${formatClientFunctionGetMethod(
        apiVersion,
        resourceNames.kind,
        resourceNames.plural,
        namespaced,
        verb
      )}`;
      break;
  }

  return fs.writeFile(
    path.resolve(
      apiVersionDirPath,
      `${getClientFunctionMethodName(resourceNames.kind, verb)}.ts`
    ),
    header + data
  );
}
