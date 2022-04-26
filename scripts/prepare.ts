#!/usr/bin/env ts-node

import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

import {
  getConfigurationValues,
  IConfigurationValues,
} from './getConfigurationValues';
import { templateIndex } from './templateIndex';
import yaml from 'js-yaml';

const indexTemplatePath = path.resolve('www', 'index.ejs');
const indexOutputPath = path.resolve('www', 'index.html');

const metadataPath = path.resolve('www', 'metadata.json');

const permissionsUseCasesPath = path.resolve(
  'scripts',
  'permissions-use-cases.yaml'
);

interface IMetadataContent {
  version: string;
}

function log(message: string): void {
  process.stdout.write(`${message}\n`);
}

async function createMetadataTemplate(
  withValues: IConfigurationValues
): Promise<void> {
  const content: IMetadataContent = {
    version: withValues.happaVersion,
  };

  log(`Writing metadata file to path '${metadataPath}'.`);
  await fs.writeFile(metadataPath, JSON.stringify(content));
  log('Wrote metadata file successfully.');
}

async function createIndexTemplate(
  withValues: IConfigurationValues
): Promise<void> {
  log(`Reading index template at '${indexTemplatePath}'.`);
  const indexFile = await fs.readFile(indexTemplatePath);
  log('Read index template successfully.');

  log('Templating index');
  const output = await templateIndex(indexFile.toString(), withValues);
  log(`Templated index successfully.`);

  log(`Writing index file to path '${indexTemplatePath}'.`);
  await fs.writeFile(indexOutputPath, output);
  log('Wrote index file successfully.');
}

async function $(command: string) {
  return new Promise<void>((resolve, reject) => {
    const args = command.split(' ');
    if (args.length < 1) return Promise.resolve();

    log(`Running '${command}'`);

    const proc = spawn(args[0], args.slice(1), {
      shell: true,
      windowsHide: true,
    });

    proc.stdout.on('data', (buf) => process.stdout.write(buf));
    proc.stderr.on('data', (buf) => process.stderr.write(buf));

    proc.on('exit', (code) => {
      proc.on('close', () => {
        if (code === 0) return resolve();

        return reject(new Error('Execution failed.'));
      });
    });
  });
}

async function gzipFiles(): Promise<void> {
  log('Gzipping files');
  await $(`gzip -f -9 -k ${indexOutputPath}`);
  await $(`gzip -f -9 -k ${metadataPath}`);
  log('Gzipped files successfully');
}

async function tryReadConfigFile(): Promise<string> {
  log('Trying to read config file.');

  const configPath = process.env.HAPPA_CONFIG_PATH;
  if (!configPath) {
    log(`The '$HAPPA_CONFIG_PATH' environmental variable is not set.`);
    log('Continuing without a configuration file.');

    return Promise.resolve('');
  }

  log(`Attempting to read config file from path '${configPath}'.`);

  const configFile = await fs.readFile(configPath);

  log('Read config file successfully.');

  return configFile.toString();
}

async function readPermissionsUseCasesFile(): Promise<string> {
  log(
    `Reading permissions use cases file from path '${permissionsUseCasesPath}'.`
  );

  const useCasesFileContents = await fs.readFile(permissionsUseCasesPath);
  const useCases = yaml.load(useCasesFileContents.toString(), {
    schema: yaml.JSON_SCHEMA,
  }) as Record<string, any>;

  const useCasesObject = {
    'permissions-use-cases-json': JSON.stringify(useCases['useCases'])
      .replace(/\'/g, '&apos;')
      .replace(/\\"/g, '\\\\"'),
  };

  log('Read permissions use cases file successfully.');

  return yaml.dump(useCasesObject);
}

async function main(): Promise<void> {
  try {
    const configContent = await tryReadConfigFile();

    const useCasesFileContent = await readPermissionsUseCasesFile();

    log('Computing the configuration values.');
    const values = await getConfigurationValues(
      configContent + useCasesFileContent
    );
    log('Computed the configuration values successfully.');

    await createIndexTemplate(values);
    await createMetadataTemplate(values);

    await gzipFiles();
  } catch (err) {
    process.stderr.write('\n');
    process.stderr.write((err as Error).toString());

    process.exit(1);
  }
}

main();
