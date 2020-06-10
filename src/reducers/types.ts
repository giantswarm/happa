import { ICPAuthState } from 'stores/cpauth/types';

// Giving state a generic type for now, until whole state is typed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface IState extends Record<string, any> {
  entities: {
    cpAuth: ICPAuthState;
    clusterLabels: {
      requestInProgress: string;
      error: Error | null;
    };
  };
}
