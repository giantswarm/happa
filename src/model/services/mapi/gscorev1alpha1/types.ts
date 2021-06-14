import * as metav1 from '../metav1';

export interface IStorageConfigSpecStorage {
  data: Record<string, string>;
}

export interface IStorageConfigSpec {
  storage: IStorageConfigSpecStorage;
}

export const StorageConfig = 'StorageConfig';

export interface IStorageConfig {
  apiVersion: 'core.giantswarm.io/v1alpha1';
  kind: typeof StorageConfig;
  metadata: metav1.IObjectMeta;
  spec: IStorageConfigSpec;
}

export const StorageConfigList = 'StorageConfigList';

export interface IStorageConfigList extends metav1.IList<IStorageConfig> {
  apiVersion: 'core.giantswarm.io/v1alpha1';
  kind: typeof StorageConfigList;
}
