import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import catalogs from 'model/stores/appcatalog/reducer';
import clusters from 'model/stores/cluster/reducer';
import clusterLabels from 'model/stores/clusterlabels/reducer';
import entityError from 'model/stores/entityerror/reducer';
import entityLoading from 'model/stores/entityloading/reducer';
import error from 'model/stores/error/reducer';
import loading from 'model/stores/loading/reducer';
import makeMainReducer from 'model/stores/main/reducer';
import metadata from 'model/stores/metadata/reducer';
import modal from 'model/stores/modal/reducer';
import nodePools from 'model/stores/nodepool/reducer';
import organizations from 'model/stores/organization/reducer';
import releases from 'model/stores/releases/reducer';
import { IState } from 'model/stores/state';
import users from 'model/stores/user/reducer';
import { combineReducers, ReducersMapObject } from 'redux';

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
