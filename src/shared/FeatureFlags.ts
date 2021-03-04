/* global FEATURE_MAPI_ACCESS:false */

interface IFeatureFlags {
  FEATURE_MAPI_ACCESS: boolean;
}

const FeatureFlags: IFeatureFlags = {
  FEATURE_MAPI_ACCESS,
};

export default FeatureFlags;
