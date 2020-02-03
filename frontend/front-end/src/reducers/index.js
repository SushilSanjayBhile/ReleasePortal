import { combineReducers } from 'redux';

import auth from './auth.reducer';
import posts from './posts.reducer';
import profiles from './profiles.reducer';
import feed from './feed.reducer';

import ui from './ui';
import { releaseReducer as release } from './release.reducer';
import app from './app.reducer';
import { testcaseReducer as testcase } from './testcase.reducer';
import { featureReducer as feature } from './feature.reducer';
import { bugReducer as bug } from './bug.reducer';
import user from './user.reducer';
export default combineReducers({
  auth,
  posts,
  profiles,
  feed,
  ui,
  release,
  app,
  testcase,
  feature,
  bug,
  user
});
