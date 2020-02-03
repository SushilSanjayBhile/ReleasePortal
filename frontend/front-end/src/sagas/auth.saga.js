/* eslint-disable no-unused-vars */
import { take, call, put, fork, select, takeEvery, takeLatest } from 'redux-saga/effects';

import * as API from '../utils/API.utils';
import {
  LOG_IN_REQUEST,
  logInSuccess,
  logInFailure,
  USER_NOTIFICATION_UPDATE
} from '../actions';


function* authenticateUser({ authToken }) {
  try {
    const user = yield call(API.authenticateUser, { authToken });
    yield put(logInSuccess({ user }));
  } catch (error) {
    yield put(logInFailure({ error }));
  }
}

function* updateUserNotifications({ authToken }) {
  try {
    const user = yield call(API.authenticateUser, { authToken });
    yield put(logInSuccess({ user }));
  } catch (error) {
    yield put(logInFailure({ error }));
  }
}

// ///////////////////
// WATCHERS /////////
// /////////////////
function* watchLogin() {
  yield takeEvery(LOG_IN_REQUEST, authenticateUser);
}

export default function () {
  return [fork(watchLogin)]
}
