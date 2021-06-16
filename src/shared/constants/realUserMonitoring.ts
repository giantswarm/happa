export const enum RUMActions {
  WindowResize = 'WINDOW_RESIZE',
  WindowLoad = 'WINDOW_LOAD',
  WebVitals = 'WEB_VITALS',

  ClickMainNavLogo = 'CLICK_MAINNAV_LOGO',

  SelectRelease = 'SELECT_RELEASE',

  ToggleAZ = 'TOGGLE_AZ',

  SelectAZSelection = 'SELECT_AZ_SELECTION',

  SelectMasterAZSelection = 'SELECT_MASTER_AZ_SELECTION',

  CreateClusterSubmit = 'CREATE_CLUSTER_SUBMIT',
  CreateClusterCancel = 'CREATE_CLUSTER_CANCEL',

  SelectInstanceType = 'SELECT_INSTANCE_TYPE',

  AddNodePool = 'ADD_NODEPOOL',
  RemoveNodePool = 'REMOVE_NODEPOOL_FORM',

  ExpandInstanceTypes = 'EXPAND_INSTANCE_TYPES',
  CollapseInstanceTypes = 'COLLAPSE_INSTANCE_TYPES',

  ShowReleaseDetails = 'SHOW_RELEASE_DETAILS',
  HideReleaseDetails = 'HIDE_RELEASE_DETAILS',

  ExpandReleases = 'EXPAND_RELEASES',
  CollapseReleases = 'COLLAPSE_RELEASES',

  IncrementNumber = 'INCREMENT_NUMBER',
  DecrementNumber = 'DECREMENT_NUMBER',

  SpotInstancesMaximumPrice = 'SPOT_INSTANCES_MAX_PRICE',
}
