/* eslint-disable no-unused-vars */
import { take, call, put, fork, select, takeEvery, takeLatest } from 'redux-saga/effects';

import * as API from '../utils/API.utils';
import {
    FETCH_USER_TRAVEL,
    fetchUserTravelSuccess,
    fetchUserTravelFailure,
} from '../actions';

const getUserTravelFromIndexDb = (userId) => {
  // TODO: return the saved feed from indexDb else return null; Also check the time expiry of the feed.
  return null;
}
function* fetchUserTravel({ userId }) {
  try {
    let travel = getUserTravelFromIndexDb(userId);
    if(!travel) {
      travel = yield call(API.fetchUserTravel, { userId });
    }
    yield put(fetchUserTravelSuccess({ userId, travel }));
  } catch (error) {
    yield put(fetchUserTravelFailure({ userId, error }));
  }
}


// /////////////////// 
// WATCHERS /////////
// /////////////////
function* watchUserTravel() {
  yield takeEvery(FETCH_USER_TRAVEL, fetchUserTravel);
}

export default function () {
return [fork(watchUserTravel)];
}
