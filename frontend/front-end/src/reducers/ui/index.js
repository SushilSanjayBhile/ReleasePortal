import { combineReducers } from 'redux';

import headerActions from './header-actions.reducer';
import mapActions from './map-actions.reducer';


export default combineReducers({
  headerActions,
  mapActions
});
