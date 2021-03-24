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
