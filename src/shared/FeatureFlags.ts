/* global FEATURE_CLUSTER_LABELS_V0:true */
/* global FEATURE_HA_MASTERS:false */
/* global FEATURE_CP_ACCESS:false */

interface IFeatureFlags {
  FEATURE_CLUSTER_LABELS_V0: boolean;
  FEATURE_HA_MASTERS: boolean;
  FEATURE_CP_ACCESS: boolean;
}
const FeatureFlags: IFeatureFlags = {
  FEATURE_CLUSTER_LABELS_V0,
  FEATURE_HA_MASTERS,
  FEATURE_CP_ACCESS,
};

export default FeatureFlags;
