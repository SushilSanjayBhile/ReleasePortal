import { all, take, call, put, fork, select, takeEvery, takeLatest } from 'redux-saga/effects';
import profileSaga from './profile.saga';
import authSaga from './auth.saga';
import feedSaga from './feed.saga';
import journeySaga from './journey.saga';
import travelSaga from './travel.saga';
import userSaga from './user.saga';
// import releaseSaga from './release.saga';

export default function* rootSaga() {
  yield all([...authSaga(), ...profileSaga(), ...feedSaga(), ...journeySaga(), ...travelSaga(), ...userSaga()])
}