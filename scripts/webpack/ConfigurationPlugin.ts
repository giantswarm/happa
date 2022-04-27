import { getProdConfiguration } from '../getProdConfiguration';
import webpack from 'webpack';

import {
  getConfigurationValues,
  IConfigurationValues,
} from '../getConfigurationValues';
import { templateIndex } from '../templateIndex';
import { createProxy } from '../createProxy';
import path from 'path';
import getPermissionsUseCasesConfig from '../getPermissionsUseCasesConfig';
interface IConfigurationPluginOptionsProxy {
  port: number;
  host: (configValues: IConfigurationValues) => string;
}

interface IConfigurationPluginOptions {
  /**
   * The path of the file to template.
   * */
  filename: string;
  /**
   * Where to save the templated file
   * */
  outputFilename: string;
  /**
   * Set custom template values that override the
   * ones computed from the environment.
   * */
  overrides?: Partial<IConfigurationValues>;
  /**
   * Spawn proxies for some of the configured endpoints.
   * */
  proxies?: IConfigurationPluginOptionsProxy[];
}

type Logger = webpack.Compilation['logger'];

/**
 * This `webpack` plugin will template a given file with
 * configuration values computed from the environment.
 *
 * If a `kubectl` context is configured using the `HAPPA_KUBECTL_CONTEXT`
 * environmental variable, then that context will be used for fetching
 * the production configuration. This configuration will be used to template
 * the index file, and external endpoints will be proxied, to bypass CORS rules.
 * */
export class ConfigurationPlugin implements webpack.WebpackPluginInstance {
  protected configurationValues: Partial<IConfigurationValues> = {};

  public constructor(protected options: IConfigurationPluginOptions) {}

  public apply(compiler: webpack.Compiler) {
    const logger = compiler.getInfrastructureLogger('ConfigurationPlugin');

    compiler.hooks.environment.tap(
      'ConfigurationPlugin',
      this.handlePrepareEnvironment.bind(this, logger)
    );
    compiler.hooks.thisCompilation.tap(
      'ConfigurationPlugin',
      this.handleCompilation.bind(this)
    );
  }

  protected handleCompilation(compilation: webpack.Compilation) {
    compilation.hooks.processAdditionalAssets.tapPromise(
      {
        name: 'ConfigurationPlugin',
        stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_INLINE,
      },
      this.handleTemplateIndex.bind(this, compilation)
    );
  }

  protected async handleTemplateIndex(
    compilation: webpack.Compilation
  ): Promise<void> {
    const logger = compilation.getLogger('ConfigurationPlugin');

    logger.info('Looking for configuration template');
    const asset = compilation.assets[this.options.filename] as
      | webpack.sources.RawSource
      | undefined;

    if (!asset) return Promise.resolve();

    const contents = asset.buffer().toString();

    logger.info('Templating configuration file');
    // Template the file with the configuration values.
    const transformedContents = await templateIndex(
      contents,
      this.configurationValues as IConfigurationValues
    );

    logger.info('Emitting configuration file asset');
    // Create the new templated file.
    const modifiedSource = new webpack.sources.RawSource(
      transformedContents,
      false
    );

    compilation.emitAsset(this.options.outputFilename, modifiedSource);
  }

  protected async handlePrepareEnvironment(logger: Logger): Promise<void> {
    let config: string | undefined;

    const providedKubectlContext = process.env.hasOwnProperty(
      'HAPPA_KUBECTL_CONTEXT'
    );

    if (providedKubectlContext) {
      logger.info(
        `Fetching production configuration using kubectl context '${process.env.HAPPA_KUBECTL_CONTEXT}'`
      );
      config = await getProdConfiguration(process.env.HAPPA_KUBECTL_CONTEXT!);
    }

    const permissionsUseCasesFilePath = path.resolve(
      'scripts',
      'permissions-use-cases.yaml'
    );
    logger.info(
      `Fetching permissions use cases configuration from ${permissionsUseCasesFilePath}`
    );
    config ??= '';
    config += await getPermissionsUseCasesConfig(permissionsUseCasesFilePath);

    logger.info('Computing configuration values');
    this.configurationValues = await getConfigurationValues(config);

    if (providedKubectlContext) {
      logger.info('Creating proxies for backend endpoints');
      this.handleProxyEndpoints(logger);
    }

    // Apply configuration value overrides, if any.
    if (this.options.overrides) {
      logger.info('Overriding configuration values with provided values');
      this.configurationValues = Object.assign(
        {},
        this.configurationValues,
        this.options.overrides
      );
    }
  }

  protected handleProxyEndpoints(logger: Logger) {
    if (!this.options.proxies) return;

    for (const proxy of this.options.proxies) {
      const host = proxy.host(this.configurationValues as IConfigurationValues);

      logger.info(`Creating proxy for '${host}' on 'localhost:${proxy.port}'`);

      createProxy(host, proxy.port, (req) =>
        logger.log(`Request Proxied -> ${req.method.toUpperCase()} ${req.url}`)
      );
    }
  }
}
