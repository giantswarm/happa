import { IInstallationInfo } from 'model/services/giantSwarm/types';
import { IAppCatalogsState } from 'stores/appcatalog/types';
import { IClusterState } from 'stores/cluster/types';
import { ICPAuthState } from 'stores/cpauth/types';
import { IErrorState } from 'stores/error/types';
import { IMetadataState } from 'stores/metadata/types';
import { IModalState } from 'stores/modal/types';
import { INodePoolState } from 'stores/nodepool/types';
import { IOrganizationState } from 'stores/organization/types';
import { IUserState } from 'stores/user/types';

// Giving state a generic type for now, until whole state is typed.
export interface IState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  main: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    loggedInUser: ILoggedInUser;
    info: IInstallationInfo;
    selectedOrganization: string | null;
    firstLoadComplete: boolean;
    selectedClusterID?: string;
  };
  errors: IErrorState;
  metadata: IMetadataState;
  modal: IModalState;
  entities: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    cpAuth: ICPAuthState;
    catalogs: IAppCatalogsState;
    organizations: IOrganizationState;
    nodePools: INodePoolState;
    users: IUserState;
    cluster: IClusterState;
  };
}
