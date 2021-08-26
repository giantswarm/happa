import { IConfigurationValues } from './getConfigurationValues';
import fs from 'fs/promises';
import ejs from 'ejs';

export async function templateIndex(
  input: string,
  withValues: IConfigurationValues
): Promise<string> {
  const template = ejs.compile(input, {
    openDelimiter: '{',
    closeDelimiter: '}',
    delimiter: '!',
  });

  return template(withValues);
}
