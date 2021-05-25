import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers, ReducersMapObject } from 'redux';
import catalogs from 'stores/appcatalog/reducer';
import clusters from 'stores/cluster/reducer';
import clusterLabels from 'stores/clusterlabels/reducer';
import entityError from 'stores/entityerror/reducer';
import entityLoading from 'stores/entityloading/reducer';
import error from 'stores/error/reducer';
import loading from 'stores/loading/reducer';
import makeMainReducer from 'stores/main/reducer';
import metadata from 'stores/metadata/reducer';
import modal from 'stores/modal/reducer';
import nodePools from 'stores/nodepool/reducer';
import organizations from 'stores/organization/reducer';
import releases from 'stores/releases/reducer';
import { IState } from 'stores/state';
import users from 'stores/user/reducer';

const entityReducers: ReducersMapObject<IState['entities']> = {
  catalogs,
  clusterLabels,
  clusters,
  nodePools,
  organizations,
  releases,
  users,
};
const entities = combineReducers(entityReducers);

const rootReducer = (history: History<History.LocationState>) =>
  combineReducers<IState>({
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
