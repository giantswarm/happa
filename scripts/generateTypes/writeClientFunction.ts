import fs from 'fs/promises';
import path from 'path';
import { ClientFunctionVerbs } from './getMapiResourcesList';
import { formatInterfaceName, IResourceNames } from './writeTypes';

const genericMethodNames: Record<ClientFunctionVerbs, string> = {
  get: 'getResource',
  list: 'getListResource',
  delete: 'deleteResource',
  create: 'createResource',
  update: 'updateResource',
};

function getClientFunctionMethodName(
  resourceName: string,
  verb: ClientFunctionVerbs
) {
  return `${verb}${resourceName}`;
}

function formatClientFunctionFileHeader(
  resourceName: string,
  verb: ClientFunctionVerbs
): string {
  return `import { IHttpClient } from 'model/clients/HttpClient';
import { ${genericMethodNames[verb]} } from 'model/services/mapi/generic/${
    genericMethodNames[verb]
  }';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { ${formatInterfaceName(resourceName)} } from '.';\n`;
}

function formatClientFunctionGetMethod(
  apiVersion: string,
  resourceName: string,
  resourceNamePlural: string,
  verb: ClientFunctionVerbs
): string {
  return `export function ${getClientFunctionMethodName(resourceName, verb)}(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: '${apiVersion}',
    kind: '${resourceNamePlural.toLocaleLowerCase()}',
    namespace,
    name,
  });

  return ${genericMethodNames[verb]}<${formatInterfaceName(
    resourceName
  )}>(client, auth, url.toString());
}

export function ${getClientFunctionMethodName(
    resourceName,
    verb
  )}Key(namespace: string, name: string) {
  return \`${getClientFunctionMethodName(
    resourceName,
    verb
  )}/\${namespace}/\${name}\`;
}\n`;
}

export async function writeClientFunction(
  apiVersionDirPath: string,
  apiVersion: string,
  resourceNames: IResourceNames,
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
