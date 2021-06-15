import * as metav1 from '../metav1';

export interface IObjectReference {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
  resourceVersion?: string;
  uid?: string;
}

export interface ILocalObjectReference {
  name?: string;
}

export const ServiceAccount = 'ServiceAccount';

export interface IServiceAccount {
  apiVersion: 'v1';
  kind: typeof ServiceAccount;
  metadata: metav1.IObjectMeta;
  secrets?: IObjectReference[];
  imagePullSecrets?: ILocalObjectReference[];
  automountServiceAccountToken?: boolean;
}

export const ServiceAccountList = 'ServiceAccountList';

export interface IServiceAccountList extends metav1.IList<IServiceAccount> {
  apiVersion: 'v1';
  kind: typeof ServiceAccountList;
}

export const ConfigMap = 'ConfigMap';

export interface IConfigMap {
  apiVersion: 'v1';
  kind: typeof ConfigMap;
  metadata: metav1.IObjectMeta;
  immutable?: boolean;
  data?: Record<string, string>;
  binaryData?: Record<string, string>;
}

export interface INodeAddress {
  type: string;
  address: string;
}

export type SecretType = string;

export const Secret = 'Secret';

export interface ISecret {
  apiVersion: 'v1';
  kind: typeof Secret;
  metadata: metav1.IObjectMeta;
  immutable?: boolean;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
  type?: SecretType;
}

export const SecretList = 'SecretList';

export interface ISecretList extends metav1.IList<ISecret> {
  apiVersion: 'v1';
  kind: typeof SecretList;
}
