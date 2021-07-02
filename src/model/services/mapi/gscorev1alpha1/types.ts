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

export interface ISparkSpec {
  values?: Record<string, string>;
}

export interface ISparkStatusVerification {
  hash: string;
  algorithm: string;
}

export interface ISparkStatus {
  dataSecretName: string;
  failureReason: string;
  failureMessage: string;
  ready: boolean;
  verification: ISparkStatusVerification;
}

export const Spark = 'Spark';

export interface ISpark {
  apiVersion: 'core.giantswarm.io/v1alpha1';
  kind: typeof Spark;
  metadata: metav1.IObjectMeta;
  spec: ISparkSpec;
  status: ISparkStatus;
}

export const SparkList = 'SparkList';

export interface ISparkList extends metav1.IList<ISpark> {
  apiVersion: 'core.giantswarm.io/v1alpha1';
  kind: typeof SparkList;
}
