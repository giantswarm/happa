export interface IObjectMeta {
  name: string;
  namespace: string;
  resourceVersion: string;
  selfLink: string;
  uid: string;
  creationTimestamp: string;
  finalizers: string[];
  generation: number;
  annotations?: Record<string, string>;
  deletionTimestamp?: string;
  labels?: Record<string, string>;
}

export interface ITypeMeta {
  resourceVersion: string;
  selfLink: string;
}

export interface IList<T> {
  apiVersion: string;
  kind: string;
  metadata: ITypeMeta;
  items: T[];
}
