import { IAppCatalogsState } from 'stores/appcatalog/types';
import { ICPAuthState } from 'stores/cpauth/types';

// Giving state a generic type for now, until whole state is typed
export interface IState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  entities: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
    cpAuth: ICPAuthState;
    clusterLabels: {
      requestInProgress: string;
      error: Error | null;
    };
    catalogs: IAppCatalogsState;
  };
}
