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

/**
 * A helper class used for loading configuration values from
 * the environment, or from a given string.
 * */
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

  /**
   * Parse configuration values from a template.
   * */
  public async parse(fromValues: string) {
    try {
      if (fromValues.trim().length < 1) return;

      const input = yaml.load(fromValues) as Values;

      this.values = this.flattenValues([], input);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  /**
   * Parse a string value from the environment.
   * @defaults to `''` if the key is unknown.
   * */
  public getString(key: string): string {
    return this.getValue(key, 'string');
  }

  /**
   * Parse a boolean value from the environment.
   * @defaults to `false` if the key is unknown.
   * */
  public getBoolean(key: string): boolean {
    return this.getValue(key, 'boolean');
  }

  /**
   * Parse a number value from the environment.
   * @defaults to `0` if the key is unknown.
   * */
  public getNumber(key: string): number {
    return this.getValue(key, 'number');
  }

  /**
   * Set a default value for a given key.
   *
   * This value will be used if the key is
   * not found in the parsed configuration values.
   * */
  public setDefault(key: string, value: ConfigurationValue) {
    if (this.values.hasOwnProperty(key)) {
      return;
    }

    this.values[key] = value;
  }

  /**
   * Whether to use environmental variables for configuration values.
   *
   * Note: Environmental variables have higher precedence than
   * configuration values parsed from a string.
   * */
  public useEnvVariables() {
    this.options.useEnvVariables = true;
  }

  /**
   * Whether to set a prefix for all environmental variables (e.g. `MY_`).
   * */
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
      /**
       * If there is an environmental variable with this name,
       * parse a supported type of value from it.
       * */
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

    // Retrieve the configuration value or pass defaults.
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
