import { IConfigurationValues } from './getConfigurationValues';
import ejs from 'ejs';

/**
 * Template the index file with given configuration values
 * */
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
