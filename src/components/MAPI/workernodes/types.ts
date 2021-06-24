import { NodePool, ProviderNodePool } from 'MAPI/types';

export interface IWorkerNodesAdditionalColumn {
  title: string;
  render: (
    nodePool?: NodePool,
    providerNodePool?: ProviderNodePool
  ) => React.ReactNode;
}
