export enum MetadataPaths {
  Configuration = '/metadata.json',
}

export interface IMetadataConfiguration {
  version: {
    long: string;
    short: string;
  };
}
