import { error, log } from '../utils';
import { getMapiResourcesList, IApiGroupInfo } from './getMapiResourcesList';
import { getTypesForResource } from './getTypesForResource';
import {
  writeTypes,
  ensureApiVersionFolder,
  formatListResourceExport,
  formatResourceKindExport,
} from './writeTypes';

async function readMapiResourcesListFile(): Promise<IApiGroupInfo[]> {
  log('Reading MAPI resources list from file... ', false);

  const mapiResources = await getMapiResourcesList();

  log('done.');

  return mapiResources;
}

async function ensureDirs(apiVersionAlias: string): Promise<void> {
  log('  Ensuring directories... ', false);

  await ensureApiVersionFolder(apiVersionAlias);

  log('done');
}

async function getTypesFileContents(
  group: IApiGroupInfo
): Promise<{ resourceNamesWritten: string[]; data: string }> {
  log(`  Getting types... `, false);

  const responses = await Promise.allSettled(
    group.resources.map((r) => getTypesForResource(r, group.apiVersion))
  );

  let data = '';
  let resourceNamesWritten = [];
  for (let i = 0; i < responses.length; i++) {
    const resource = group.resources[i];
    const response = responses[i];

    if (response.status === 'rejected') {
      error(
        `Could not get types for resource ${resource.name}: ${response.reason}`
      );

      continue;
    }

    data +=
      `\n${formatResourceKindExport(resource.name)}` +
      `\n${response.value}\n` +
      formatListResourceExport(resource.name);

    resourceNamesWritten.push(resource.name);
  }

  log('done.');

  return { resourceNamesWritten, data };
}

async function generateTypes(group: IApiGroupInfo): Promise<void> {
  try {
    log(`Generating types for ${group.apiVersion} (${group.apiVersionAlias}):`);

    const { resourceNamesWritten, data } = await getTypesFileContents(group);

    await ensureDirs(group.apiVersionAlias);

    log(`  Writing types...`);
    resourceNamesWritten.forEach((r) => log(`    ${r}`));

    await writeTypes(group, data);

    log(`  done.`);
  } catch (err) {
    error((err as Error).toString());

    return Promise.resolve();
  }
}

async function main() {
  try {
    const mapiResources = await readMapiResourcesListFile();

    const generateTypesTasks = mapiResources.map(
      (apiGroup) => () => generateTypes(apiGroup)
    );

    // Generate TS types for each API group sequentially
    async function generateNext() {
      const task = generateTypesTasks.shift();
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
