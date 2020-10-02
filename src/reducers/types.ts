import { IAppCatalogsState } from 'stores/appcatalog/types';
import { IClusterState } from 'stores/cluster/types';
import { IClusterLabelsState } from 'stores/clusterlabels/types';
import { ICPAuthState } from 'stores/cpauth/types';
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
import { IUserState } from 'stores/user/types';

// Giving state a generic type for now, until whole state is typed.
export interface IState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  main: IMainState;
  loadingFlags: ILoadingState;
  loadingFlagsByEntity: IEntityLoadingState;
  errors: IErrorState;
  errorsByEntity: IEntityErrorState;
  metadata: IMetadataState;
  modal: IModalState;
  entities: {
    cpAuth: ICPAuthState;
    catalogs: IAppCatalogsState;
    organizations: IOrganizationState;
    nodePools: INodePoolState;
    users: IUserState;
    clusters: IClusterState;
    releases: IReleaseState;
    clusterLabels: IClusterLabelsState;
  };
}
