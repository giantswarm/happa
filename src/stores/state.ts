import { IAppCatalogsState } from 'stores/appcatalog/types';
import { IClusterState } from 'stores/cluster/types';
import { IClusterLabelsState } from 'stores/clusterlabels/types';
import { IEntityErrorState } from 'stores/entityerror/types';
import { IEntityLoadingState } from 'stores/entityloading/types';
import { IErrorState } from 'stores/error/types';
import { ILoadingState } from 'stores/loading/types';
import { IMainState } from 'stores/main/types';
import { IMetadataState } from 'stores/metadata/types';
import { IModalState } from 'stores/modal/types';
import { INodePoolState } from 'stores/nodepool/types';
import { IOrganizationState } from 'stores/organization/types';
import { IReleaseState } from 'stores/releases/types';
import { IRouterState } from 'stores/router/types';
import { IUserState } from 'stores/user/types';

export interface IState {
  router: IRouterState;
  main: IMainState;
  loadingFlags: ILoadingState;
  loadingFlagsByEntity: IEntityLoadingState;
  errors: IErrorState;
  errorsByEntity: IEntityErrorState;
  metadata: IMetadataState;
  modal: IModalState;
  entities: {
    catalogs: IAppCatalogsState;
    organizations: IOrganizationState;
    nodePools: INodePoolState;
    users: IUserState;
    clusters: IClusterState;
    releases: IReleaseState;
    clusterLabels: IClusterLabelsState;
  };
}
