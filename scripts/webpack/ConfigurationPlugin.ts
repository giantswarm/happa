import webpack from 'webpack';

import {
  getConfigurationValues,
  IConfigurationValues,
} from '../getConfigurationValues';
import { templateIndex } from '../templateIndex';

interface IConfigurationPluginOptions {
  filename: string;
  outputFilename: string;
  overrides?: Partial<IConfigurationValues>;
}

export class ConfigurationPlugin implements webpack.WebpackPluginInstance {
  public constructor(protected options: IConfigurationPluginOptions) {}

  public apply(compiler: webpack.Compiler) {
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
      async (assets) => {
        const asset = assets[this.options.filename] as
          | webpack.sources.RawSource
          | undefined;

        if (!asset) return Promise.resolve();

        const contents = asset.buffer().toString();

        // Template the file.
        let values = await getConfigurationValues();
        if (this.options.overrides) {
          values = Object.assign({}, values, this.options.overrides);
        }

        const transformedContents = await templateIndex(contents, values);

        // Create the new templated file.
        const modifiedSource = new webpack.sources.RawSource(
          transformedContents,
          false
        );
        compilation.emitAsset(this.options.outputFilename, modifiedSource);
      }
    );
  }
}
