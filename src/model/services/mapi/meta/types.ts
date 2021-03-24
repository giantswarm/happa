export interface IMetaV1ObjectMeta {
  name: string;
  namespace?: string;
  resourceVersion?: string;
  selfLink?: string;
  uid?: string;
  creationTimestamp?: string;
  finalizers?: string[];
  generation?: number;
  annotations?: Record<string, string>;
  deletionTimestamp?: string;
  labels?: Record<string, string>;
}

export interface IMetaV1TypeMeta {
  resourceVersion: string;
  selfLink: string;
}

export interface IMetaV1List<T> {
  apiVersion: string;
  kind: string;
  metadata: IMetaV1TypeMeta;
  items: T[];
}
