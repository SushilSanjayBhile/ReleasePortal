/* eslint-disable no-unused-vars */
import { take, call, put, fork, takeEvery, takeLatest } from 'redux-saga/effects';

import * as http from '../utils/http.utils';
import {
    FETCH_USER_NOTIFICATIONS,
    saveUserNotifications
} from '../actions';

function* updateUserNotificationsSaga({ email, startTime }) {
    try {
        const updates = yield call(http.updateUserNotifications, { email, startTime });
        yield put(saveUserNotifications(updates.data));
    } catch (error) {
        console.log('getting error')
        yield put(saveUserNotifications([]));
    }
}

// ///////////////////
// WATCHERS /////////
// /////////////////
function* watchUpdate() {
    yield takeLatest(FETCH_USER_NOTIFICATIONS, updateUserNotificationsSaga);
}

export default function () {
    return [fork(watchUpdate)]
}
