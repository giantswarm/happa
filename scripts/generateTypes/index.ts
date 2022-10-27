import { error, log } from '../utils';
import {
  ClientFunctionVerbs,
  getMapiResourcesList,
  IApiGroupInfo,
} from './getMapiResourcesList';
import {
  fetchCRD,
  getTypesForResource,
  ICRDForResource,
} from './getTypesForResource';
import {
  formatListResourceExport,
  formatResourceKindExport,
} from './templates';
import { writeClientFunction } from './writeClientFunction';
import {
  writeTypes,
  ensureApiVersionFolder,
  IResourceNames,
} from './writeTypes';

function getResourceNames(crdForResource: ICRDForResource): IResourceNames {
  return {
    kind: crdForResource.resource.name,
    listKind:
      crdForResource.crd.spec?.names?.listKind ||
      `${crdForResource.resource.name}List`,
    plural:
      crdForResource.crd.spec?.names?.plural ||
      `${crdForResource.resource.name.toLocaleLowerCase()}s`,
  };
}

function getResourceScope(crdForResource: ICRDForResource): boolean {
  return (crdForResource.crd.spec?.scope ?? 'Namespaced') === 'Namespaced';
}

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
  apiVersion: string,
  crdsForResources: ICRDForResource[]
): Promise<{ resourceNamesGenerated: string[]; data: string }> {
  log(`  Generating TS types...`, false);

  const responses = await Promise.allSettled(
    crdsForResources.map((r) =>
      getTypesForResource(apiVersion, r.resource.name, r.crd)
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

    data +=
      `\n${formatResourceKindExport(crdForResource.resource.name)}` +
      `\n${response.value}\n` +
      formatListResourceExport(getResourceNames(crdForResource));

    resourceNamesGenerated.push(crdForResource.resource.name);
  }

  log(`  done.`);

  return { resourceNamesGenerated, data };
}

async function writeClientFunctions(
  apiVersionDirPath: string,
  apiGroup: string,
  crdsForTypedResources: ICRDForResource[]
): Promise<Record<string, string[]>> {
  const clientFunctionsWritten: Record<string, string[]> = {};

  const requests = crdsForTypedResources.reduce<
    {
      resourceNames: IResourceNames;
      namespaced: boolean;
      verb: ClientFunctionVerbs;
    }[]
  >((prev, curr) => {
    if (!curr.resource.verbs) return prev;
    return [
      ...prev,
      ...curr.resource.verbs.map((v) => ({
        resourceNames: getResourceNames(curr),
        namespaced: getResourceScope(curr),
        verb: v,
      })),
    ];
  }, []);

  const responses = await Promise.allSettled(
    requests.map((r) =>
      writeClientFunction(
        apiVersionDirPath,
        apiGroup,
        r.resourceNames,
        r.namespaced,
        r.verb
      )
    )
  );

  for (let i = 0; i < requests.length; i++) {
    const { resourceNames, verb } = requests[i];
    const response = responses[i];

    if (response.status === 'rejected') {
      error(
        `Could not write client function for resource ${resourceNames.kind} verb ${verb}: ${response.reason}`
      );

      continue;
    }

    clientFunctionsWritten[resourceNames.kind] ??= [];
    clientFunctionsWritten[resourceNames.kind].push(verb);
  }

  return clientFunctionsWritten;
}

async function generate(group: IApiGroupInfo): Promise<void> {
  try {
    log(`${group.apiVersionAlias} (${group.apiVersion}):`);

    const crdsForResources = await fetchCRDs(group);

    const { resourceNamesGenerated, data } = await generateTypes(
      group.apiVersion,
      crdsForResources
    );

    const apiVersionDirPath = await ensureDirs(group.apiVersionAlias);

    log(`  Writing TS types and client functions...`);

    await writeTypes(apiVersionDirPath, group.apiVersion, data);

    const crdsForTypedResources = crdsForResources.filter((r) =>
      resourceNamesGenerated.includes(r.resource.name)
    );

    const resourceClientFunctionsWritten = await writeClientFunctions(
      apiVersionDirPath,
      group.apiVersion,
      crdsForTypedResources
    );

    for (const [resourceName, verbs] of Object.entries(
      resourceClientFunctionsWritten
    )) {
      log(`    ${resourceName}: ${verbs.join(', ')}`);
    }

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
