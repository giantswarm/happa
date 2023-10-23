import { error, log } from '../utils';
import { fetchCRD, ICRDForResource } from './getCRD';
import { getMapiResourcesList, IApiGroupInfo } from './getMapiResourcesList';
import { getTypesForResource } from './getTypes';
import { formatListResourceExport, formatResourceExport } from './templates';
import {
  writeTypes,
  ensureApiVersionFolder,
  writeExports,
  writeClientFunction,
  getResourceNames,
  getWriteClientFunctionRequests,
} from './write';

async function readMapiResourcesListFile(): Promise<IApiGroupInfo[]> {
  log('Reading MAPI resources list from file... ', false);

  const mapiResources = await getMapiResourcesList();

  log('done.');

  return mapiResources;
}

async function ensureDirs(apiVersionAlias: string): Promise<string> {
  log('  Ensuring directories... ', false);

  const apiDirPath = await ensureApiVersionFolder(apiVersionAlias);

  log('done.');

  return apiDirPath;
}

async function fetchCRDs(group: IApiGroupInfo): Promise<ICRDForResource[]> {
  log(`  Fetching CRDs...`, false);

  const responses = await Promise.allSettled(
    group.resources.map((r) => fetchCRD(r.crdURL))
  );

  let crdsForResources = [];
  for (let i = 0; i < responses.length; i++) {
    const resource = group.resources[i];
    const response = responses[i];

    if (response.status === 'rejected') {
      error(
        `Could not fetch CRD for resource ${resource.name}: ${response.reason}`
      );

      continue;
    }

    crdsForResources.push({ resource: resource, crd: response.value });
  }

  log(`  done.`);

  return crdsForResources;
}

async function generateTypes(
  crdsForResources: ICRDForResource[]
): Promise<{ resourceNamesGenerated: string[]; data: string }> {
  log(`  Generating TS types...`, false);

  const responses = await Promise.allSettled(
    crdsForResources.map((r) =>
      getTypesForResource(r.resource.apiVersion, r.resource.name, r.crd)
    )
  );

  let data = '';
  let resourceNamesGenerated = [];
  for (let i = 0; i < responses.length; i++) {
    const crdForResource = crdsForResources[i];
    const response = responses[i];

    if (response.status === 'rejected') {
      error(
        `Could not generate types for resource ${crdForResource.resource.name}: ${response.reason}`
      );

      continue;
    }

    data += `
${formatResourceExport(
  getResourceNames(crdForResource),
  crdForResource.resource.apiVersion,
  response.value
)}
${formatListResourceExport(
  getResourceNames(crdForResource),
  crdForResource.resource.apiVersion
)}`;

    resourceNamesGenerated.push(crdForResource.resource.name);
  }

  log(`  done.`);

  return { resourceNamesGenerated, data };
}

async function writeClientFunctions(
  apiVersionDirPath: string,
  crdsForTypedResources: ICRDForResource[]
) {
  const requests = getWriteClientFunctionRequests(crdsForTypedResources);

  const responses = await Promise.allSettled(
    requests.map((r) =>
      writeClientFunction(
        apiVersionDirPath,
        r.resourceApiVersion,
        r.resourceNames,
        r.namespaced,
        r.verb
      )
    )
  );

  const data: string[] = [];
  const clientFunctionsWritten: Record<string, string[]> = {};
  for (let i = 0; i < requests.length; i++) {
    const { resourceNames, verb } = requests[i];
    const response = responses[i];

    if (response.status === 'rejected') {
      error(
        `Could not write client function for resource ${resourceNames.kind} verb ${verb}: ${response.reason}`
      );

      continue;
    }

    data.push(response.value);

    clientFunctionsWritten[resourceNames.kind] ??= [];
    clientFunctionsWritten[resourceNames.kind].push(verb);
  }

  return { clientFunctionsWritten, data };
}

async function generate(group: IApiGroupInfo): Promise<void> {
  try {
    log(`${group.apiVersionAlias} (${group.apiVersion}):`);

    const crdsForResources = await fetchCRDs(group);

    const { resourceNamesGenerated, data: typesData } = await generateTypes(
      crdsForResources
    );

    const apiVersionDirPath = await ensureDirs(group.apiVersionAlias);

    log(`  Writing TS types and client functions...`);

    await writeTypes(apiVersionDirPath, group.apiVersion, typesData);

    const crdsForTypedResources = crdsForResources.filter((r) =>
      resourceNamesGenerated.includes(r.resource.name)
    );

    const { clientFunctionsWritten, data: clientFnData } =
      await writeClientFunctions(apiVersionDirPath, crdsForTypedResources);

    for (const [resourceName, verbs] of Object.entries(
      clientFunctionsWritten
    )) {
      log(`    ${resourceName}: ${verbs.join(', ')}`);
    }

    await writeExports(apiVersionDirPath, clientFnData);

    log(`  done.`);
  } catch (err) {
    error((err as Error).toString());

    return Promise.resolve();
  }
}

async function main() {
  try {
    const mapiResources = await readMapiResourcesListFile();

    const generateTasks = mapiResources.map(
      (apiGroup) => () => generate(apiGroup)
    );

    // Generate TS types and client functions for each API group sequentially
    async function generateNext() {
      const task = generateTasks.shift();
      if (!task) return;

      await task();
      await generateNext();
    }
    await generateNext();
  } catch (err) {
    error((err as Error).toString());
  }
}

main();
