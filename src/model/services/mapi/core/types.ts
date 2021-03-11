export interface ICoreV1ObjectReference {
  apiVersion: string;
  kind: string;
  name: string;
  namespace: string;
  resourceVersion?: string;
  uid?: string;
}
