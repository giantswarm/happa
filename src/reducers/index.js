import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import FeatureFlags from 'shared/FeatureFlags';
import catalogs from 'stores/appcatalog/reducer';
import clusters from 'stores/cluster/reducer';
import clusterLabels from 'stores/clusterlabels/reducer';
import cpAuth from 'stores/cpauth/reducer';
import errorReducer from 'stores/error/reducer';
import metadata from 'stores/metadata/reducer';
import nodePools from 'stores/nodepool/reducer';
import releases from 'stores/releases/reducer';
import users from 'stores/user/reducer';

import credentials from './credentialReducer';
import errorsByEntity from './entityErrorReducer';
import loadingFlagsByEntity from './entityLoadingReducer';
import invitations from './invitationReducer';
import loadingFlags from './loadingReducer';
import makeMainReducer from './mainReducer';
import modal from './modalReducer';
import organizations from './organizationReducer';

const entities = combineReducers({
  cpAuth: FeatureFlags.FEATURE_CP_ACCESS && cpAuth,
  catalogs,
  clusterLabels,
  clusters,
  credentials,
  invitations,
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
    loadingFlags,
    loadingFlagsByEntity,
    errors: errorReducer,
    errorsByEntity,
  });

export default rootReducer;
