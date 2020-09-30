import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import FeatureFlags from 'shared/FeatureFlags';
import catalogs from 'stores/appcatalog/reducer';
import clusters from 'stores/cluster/reducer';
import clusterLabels from 'stores/clusterlabels/reducer';
import cpAuth from 'stores/cpauth/reducer';
import entityError from 'stores/entityerror/reducer';
import entityLoading from 'stores/entityloading/reducer';
import error from 'stores/error/reducer';
import loading from 'stores/loading/reducer';
import metadata from 'stores/metadata/reducer';
import modal from 'stores/modal/reducer';
import nodePools from 'stores/nodepool/reducer';
import organizations from 'stores/organization/reducer';
import releases from 'stores/releases/reducer';
import users from 'stores/user/reducer';

import makeMainReducer from './mainReducer';

const entities = combineReducers({
  cpAuth: FeatureFlags.FEATURE_CP_ACCESS && cpAuth,
  catalogs,
  clusterLabels,
  clusters,
  nodePools,
  organizations,
  releases,
  users,
});

const rootReducer = (history) =>
  combineReducers({
    cpAuth: FeatureFlags.FEATURE_CP_ACCESS && cpAuth,
    router: connectRouter(history),
    main: makeMainReducer(),
    metadata,
    entities,
    modal,
    loadingFlags: loading,
    loadingFlagsByEntity: entityLoading,
    errors: error,
    errorsByEntity: entityError,
  });

export default rootReducer;
