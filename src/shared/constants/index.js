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
  // eslint-disable-next-line no-magic-numbers
  DEFAULT_METADATA_CHECK_PERIOD: 10 * 60 * 1000, // 10 minutes
  // eslint-disable-next-line no-magic-numbers
  DEFAULT_METADATA_UPDATE_TIMEOUT: 2 * 1000, // 2 seconds
  METADATA_UPDATE_LABEL: 'Update happa now',

  DEFAULT_NODEPOOL_NAME: 'Unnamed node pool',
  AWS_V5_VERSION: '10.0.0',
  AZURE_MULTI_AZ_VERSION: '11.1.0',
  AWS_ONDEMAND_INSTANCES_VERSION: '11.2.0',
  AWS_USE_ALIKE_INSTANCES_VERSION: '11.2.0',
  // TODO(axbarsan): Change this to the actual version
  AWS_HA_MASTERS_VERSION: '12.0.1',

  // UI labels
  CURRENT_NODES_INPOOL_EXPLANATION:
    'Current number of worker nodes in the node pool',
  DESIRED_NODES_EXPLANATION:
    'Autoscaler’s idea of how many nodes would be required for the workloads',
  MIN_NODES_EXPLANATION:
    'Lower end of the scaling range for the cluster autoscaler',
  MAX_NODES_EXPLANATION:
    'Upper end of the scaling range for the cluster autoscaler',
  SPOT_NODES_EXPLNANATION: 'Current number of spot instances in this node pool',

  KEYPAIR_DEFAULT_TTL: 24, // A day, In hours
  // eslint-disable-next-line no-magic-numbers
  KEYPAIR_MAX_SAFE_TTL: 24 * 30, // 30 days, in hours
  KEYPAIR_UNSAFE_TTL_EXPLANATION: `The desired expiry date is pretty far away. Please keep in mind that there is no way to revoke keypairs once they've been created.`,

  KVM_INGRESS_TCP_HTTP_PORT: 36000,
  KVM_INGRESS_TCP_HTTPS_PORT: 36001,

  FLATCAR_CONTAINERLINUX_SINCE: '2345.3.1',

  // Used to filter cluster labels in api responses
  RESTRICTED_CLUSTER_LABEL_KEY_SUBSTRING: 'giantswarm.io',
};
