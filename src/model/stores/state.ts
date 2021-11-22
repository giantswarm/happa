import { IAppCatalogsState } from 'model/stores/appcatalog/types';
import { IClusterState } from 'model/stores/cluster/types';
import { IClusterLabelsState } from 'model/stores/clusterlabels/types';
import { IEntityErrorState } from 'model/stores/entityerror/types';
import { IEntityLoadingState } from 'model/stores/entityloading/types';
import { IErrorState } from 'model/stores/error/types';
import { ILoadingState } from 'model/stores/loading/types';
import { IMainState } from 'model/stores/main/types';
import { IMetadataState } from 'model/stores/metadata/types';
import { IModalState } from 'model/stores/modal/types';
import { INodePoolState } from 'model/stores/nodepool/types';
import { IOrganizationState } from 'model/stores/organization/types';
import { IReleaseState } from 'model/stores/releases/types';
import { IRouterState } from 'model/stores/router/types';
import { IUserState } from 'model/stores/user/types';

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
