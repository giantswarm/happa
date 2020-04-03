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
  DESIRED_NODES_EXPLANATION:
    'Autoscaler’s idea of how many nodes would be required for the workloads',
};
