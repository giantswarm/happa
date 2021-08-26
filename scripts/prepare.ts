#!/usr/bin/env ts-node

import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';

import {
  getConfigurationValues,
  IConfigurationValues,
} from './getConfigurationValues';
import { templateIndex } from './templateIndex';

const indexTemplatePath = path.resolve('www', 'index.ejs');
const indexOutputPath = path.resolve('www', 'index.html');

const metadataPath = path.resolve('www', 'metadata.json');

interface IMetadataContent {
  version: string;
}

async function createMetadataTemplate(
  withValues: IConfigurationValues
): Promise<void> {
  const content: IMetadataContent = {
    version: withValues.happaVersion,
  };

  return fs.writeFile(metadataPath, JSON.stringify(content));
}

async function createIndexTemplate(
  withValues: IConfigurationValues
): Promise<void> {
  const indexFile = await fs.readFile(indexTemplatePath);

  const output = await templateIndex(indexFile.toString(), withValues);

  return fs.writeFile(indexOutputPath, output);
}

async function $(command: string) {
  return new Promise<void>((resolve, reject) => {
    const args = command.split(' ');
    if (args.length < 1) return Promise.resolve();

    process.stdout.write(`Running '${command}'\n`);

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
  await $(`gzip -f -9 -k ${indexOutputPath}`);
  await $(`gzip -f -9 -k ${metadataPath}`);
}

async function tryReadConfigFile(): Promise<string> {
  const configPath = process.env.CONFIG_PATH;
  if (!configPath) return Promise.resolve('');

  const configFile = await fs.readFile(configPath);

  return configFile.toString();
}

async function main(): Promise<void> {
  try {
    const configContent = await tryReadConfigFile();
    const values = await getConfigurationValues(configContent);

    await createIndexTemplate(values);
    await createMetadataTemplate(values);

    await gzipFiles();
  } catch (err) {
    process.stderr.write('\n');
    process.stderr.write(err.toString());

    process.exit(1);
  }
}

main();
