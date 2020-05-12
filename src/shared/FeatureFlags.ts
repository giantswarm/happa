/* global FEATURE_CLUSTER_LABELS_V0:false */
interface IFeatureFlags {
  FEATURE_CLUSTER_LABELS_V0: boolean;
}
const FeatureFlags: IFeatureFlags = {
  // @ts-ignore
  FEATURE_CLUSTER_LABELS_V0,
};

export default FeatureFlags;
