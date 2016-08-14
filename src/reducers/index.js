import {combineReducers} from 'redux';
import organizations from './organizationReducer';
import modal from './modalReducer';

const rootReducer = combineReducers({
  organizations,
  modal
});

export default rootReducer;