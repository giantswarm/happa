/* global FEATURE_CLUSTER_LABELS_V0:true */
/* global FEATURE_HA_MASTERS:false */

interface IFeatureFlags {
  FEATURE_CLUSTER_LABELS_V0: boolean;
  FEATURE_HA_MASTERS: boolean;
}
const FeatureFlags: IFeatureFlags = {
  FEATURE_CLUSTER_LABELS_V0,
  FEATURE_HA_MASTERS,
};

export default FeatureFlags;
