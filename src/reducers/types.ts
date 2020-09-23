import { IInstallationInfo } from 'model/services/giantSwarm/types';
import { IAppCatalogsState } from 'stores/appcatalog/types';
import { ICPAuthState } from 'stores/cpauth/types';
import { IErrorState } from 'stores/error/types';
import { IMetadataState } from 'stores/metadata/types';

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
  entities: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    cpAuth: ICPAuthState;
    catalogs: IAppCatalogsState;
  };
}
