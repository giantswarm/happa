export interface IObjectReference {
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
  resourceVersion?: string;
  uid?: string;
}
