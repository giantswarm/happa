export interface IFeatureFlag {
  enabled: boolean;
  experimentName?: string;
}

export type Feature = 'CustomerSSO';

const flags: Record<Feature, IFeatureFlag> = {
  CustomerSSO: {
    enabled: true,
    experimentName: 'Customer Single Sign-On',
  },
};

function init() {
  flags.CustomerSSO.enabled = window.featureFlags.FEATURE_MAPI_AUTH;
}

export default {
  ...flags,
  all: Object.values(flags),
  init,
};
