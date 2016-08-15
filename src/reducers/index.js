import {combineReducers} from 'redux';
import organizations from './organizationReducer';
import modal from './modalReducer';
import flashMessages from './flashMessagesReducer';

const rootReducer = combineReducers({
  organizations,
  modal,
  flashMessages
});

export default rootReducer;