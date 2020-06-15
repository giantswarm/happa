/* global FEATURE_HA_MASTERS:true */

interface IFeatureFlags {
  FEATURE_HA_MASTERS: boolean;
}
const FeatureFlags: IFeatureFlags = {
  FEATURE_HA_MASTERS,
};

export default FeatureFlags;
