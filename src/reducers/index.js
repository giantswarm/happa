import { connectRouter } from 'connected-react-router';
import { combineReducers } from 'redux';

import catalogs from './catalogReducer';
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
  catalogs,
  clusters,
  credentials,
  invitations,
  organizations,
  releases,
  users,
  nodePools,
});

const rootReducer = history =>
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
