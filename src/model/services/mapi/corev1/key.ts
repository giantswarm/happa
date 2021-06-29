import * as metav1 from 'model/services/mapi/metav1';

import { IObjectReference } from './types';

export const conditionTrue = 'True';
export const conditionFalse = 'False';
export const conditionUnknown = 'Unknown';

export const labelApp = 'app';

export function getObjectReference(resource: {
  apiVersion: string;
  kind: string;
  metadata: metav1.IObjectMeta;
}): IObjectReference {
  return {
    apiVersion: resource.apiVersion,
    kind: resource.kind,
    name: resource.metadata.name,
    namespace: resource.metadata.namespace,
  };
}
