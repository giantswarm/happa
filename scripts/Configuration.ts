import yaml from 'js-yaml';
import dotenv from 'dotenv';

interface IOptions {
  useEnvVariables: boolean;
  envVariablePrefix: string;
}

type ConfigurationValue = string | number | boolean;

type Values = Record<string, ConfigurationValue>;

interface IConfigurationValueTypes {
  string: string;
  number: number;
  boolean: boolean;
}

export class Configuration {
  protected options: IOptions = {
    useEnvVariables: false,
    envVariablePrefix: '',
  };

  protected values: Values = {};

  public static parseBoolean(value: string): boolean {
    return value.toLowerCase() === 'true';
  }

  public static parseNumber(value: string): number {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) return 0;

    return parsed;
  }

  public async parse(fromValues: string) {
    try {
      if (fromValues.trim().length < 1) return;

      const input = yaml.load(fromValues) as Values;

      this.values = this.flattenValues([], input);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public getString(key: string): string {
    return this.getValue(key, 'string');
  }

  public getBoolean(key: string): boolean {
    return this.getValue(key, 'boolean');
  }

  public getNumber(key: string): number {
    return this.getValue(key, 'number');
  }

  public setDefault(key: string, value: ConfigurationValue) {
    if (this.values.hasOwnProperty(key)) {
      return;
    }

    this.values[key] = value;
  }

  public useEnvVariables() {
    this.options.useEnvVariables = true;
  }

  public setEnvVariablePrefix(prefix: string) {
    this.options.envVariablePrefix = prefix;
  }

  /**
   * Construct a new map of values with a maximum depth of 1,
   * where the keys are the paths to each object key (e.g. `foo.bar.baz`).
   * */
  protected flattenValues(keyPathParts: string[], values: Values): Values {
    let newValues: Values = {};
    for (const [key, value] of Object.entries(values)) {
      const pathParts = [...keyPathParts, key];

      if (typeof value === 'object' && value !== null) {
        newValues = { ...newValues, ...this.flattenValues(pathParts, value) };

        continue;
      }

      newValues[pathParts.join('.')] = value;
    }

    return newValues;
  }

  protected getEnvVariableForKey(key: string): string | undefined {
    let variableName = key.replace(/\./g, '_').toUpperCase();

    if (this.options.envVariablePrefix) {
      variableName = `${this.options.envVariablePrefix}_${variableName}`;
    }

    const envFileVars = dotenv.config().parsed;
    const environment = Object.assign({}, envFileVars, process.env);

    return environment[variableName];
  }

  protected getValue<
    V extends keyof IConfigurationValueTypes,
    T extends IConfigurationValueTypes[V]
  >(key: string, as: V): T {
    if (this.options.useEnvVariables) {
      const envVariable = this.getEnvVariableForKey(key);
      if (typeof envVariable !== 'undefined') {
        switch (as) {
          case 'boolean':
            return Configuration.parseBoolean(envVariable) as T;
          case 'number':
            return Configuration.parseNumber(envVariable) as T;
          default:
            return envVariable as T;
        }
      }
    }

    const value = this.values[key];
    switch (true) {
      case as === 'string' && typeof value !== 'string':
        return '' as T;
      case as === 'number' &&
        (typeof value !== 'number' || Number.isNaN(value)):
        return 0 as T;
      case as === 'boolean' && typeof value !== 'boolean':
        return false as T;
    }

    return value as T;
  }
}
