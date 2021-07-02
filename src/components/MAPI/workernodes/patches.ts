import { NodePool, ProviderNodePool } from 'MAPI/types';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';

export type NodePoolPatch = (
  nodePool: NodePool,
  providerNodePool: ProviderNodePool
) => void;

export interface INodePoolPropertyValue {
  patch: NodePoolPatch;
  isValid: boolean;
}

export interface INodePoolPropertyProps {
  id: string;
  nodePool: NodePool;
  providerNodePool: ProviderNodePool;
  onChange: (value: INodePoolPropertyValue) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function withNodePoolDescription(newDescription: string): NodePoolPatch {
  return (nodePool: NodePool) => {
    if (nodePool.kind === capiexpv1alpha3.MachinePool) {
      nodePool.metadata.annotations ??= {};
      nodePool.metadata.annotations[
        capiexpv1alpha3.annotationMachinePoolDescription
      ] = newDescription;
    }
  };
}
