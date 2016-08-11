import {combineReducers} from 'redux';
import organizations from './organizationReducer';

const rootReducer = combineReducers({
  organizations
});

export default rootReducer;