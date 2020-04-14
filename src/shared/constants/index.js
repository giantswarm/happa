import * as AuthorizationTypes from './authorizationTypes';
import { CSSBreakpoints } from './cssBreakpoints';
import * as FallbackMessages from './fallbackMessages';
import * as Providers from './providers';
import * as StatusCodes from './statusCodes';

export {
  Providers,
  AuthorizationTypes,
  StatusCodes,
  FallbackMessages,
  CSSBreakpoints,
};

export const Constants = {
  DEFAULT_NODEPOOL_NAME: 'Unnamed node pool',
  AWS_V5_VERSION: '10.0.0',
  AZURE_MULTI_AZ_VERSION: '11.1.0',

  // UI labels
  CURRENT_NODES_INPOOL_EXPLANATION:
    'Current number of worker nodes in the node pool',
  DESIRED_NODES_EXPLANATION:
    'Autoscaler’s idea of how many nodes would be required for the workloads',
  MIN_NODES_EXPLANATION:
    'Lower end of the scaling range for the cluster autoscaler',
  MAX_NODES_EXPLANATION:
    'Upper end of the scaling range for the cluster autoscaler',
};
