import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';
import catalogs from 'stores/appcatalog/reducer';
import clusterLabels from 'stores/clusterlabels/reducer';
import cpAuth from 'stores/cpauth/reducer';

import clusters from './clusterReducer';
import credentials from './credentialReducer';
import errorsByEntity from './entityErrorReducer';
import loadingFlagsByEntity from './entityLoadingReducer';
import errors from './errorReducer';
import invitations from './invitationReducer';
import loadingFlags from './loadingReducer';
import makeMainReducer from './mainReducer';
import modal from './modalReducer';
import nodePools from './nodePoolReducer';
import organizations from './organizationReducer';
import releases from './releaseReducer';
import users from './userReducer';

const entities = combineReducers({
  cpAuth,
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
    router: connectRouter(history),
    main: makeMainReducer(),
    entities,
    modal,
    loadingFlags,
    loadingFlagsByEntity,
    errors,
    errorsByEntity,
  });

export default rootReducer;
