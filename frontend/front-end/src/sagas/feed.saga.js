/* eslint-disable no-unused-vars */
import { take, call, put, fork, select, takeEvery, takeLatest } from 'redux-saga/effects';

import * as API from '../utils/API.utils';
import {
    FETCH_USER_FEED,
    FETCH_RELATED_USER_FEED_LIST,
    FETCH_RELATED_USER_FEED,
    fetchUserFeedSuccess,
    fetchUserFeedFailure,
    fetchRelatedUserFeedListSuccess,
    fetchRelatedUserFeedListFailure,
    fetchRelatedUserFeedSuccess,
    fetchRelatedUserFeedFailure
} from '../actions';

const getUserFeedFromIndexDb = (userId) => {
  // TODO: return the saved feed from indexDb else return null; Also check the time expiry of the feed.
  return null;
}
const getRelatedUserFeedListFromIndexDb = (userId, feedId) => {
  return null;
}
const getRelatedUserFeedFromIndexDb = (userId, feedId) => {
  return null;
}
function* fetchUserFeed({ userId }) {
  try {
    let feed = getUserFeedFromIndexDb(userId);
    if(!feed) {
      feed = yield call(API.fetchUserFeed, { userId });
    }
    yield put(fetchUserFeedSuccess({ userId, feed }));
  } catch (error) {
    yield put(fetchUserFeedFailure({ userId, error }));
  }
}

function* fetchRelatedUserFeedList({ userId, feedId }) {
  try {
    let relatedFeedList = getRelatedUserFeedListFromIndexDb(userId, feedId);
    if(!relatedFeedList) {
      relatedFeedList = yield call(API.fetchRelatedUserFeedList, { userId, feedId });
    }
    yield put(fetchRelatedUserFeedListSuccess({ userId, feedId, relatedFeedList }));
  } catch (error) {
    yield put(fetchRelatedUserFeedListFailure({ userId, feedId, error }));
  }
}

function* fetchRelatedUserFeed({ userId, fotoId, feedId, originalFeedId }) {
  try {
    let relatedFeed = getRelatedUserFeedFromIndexDb(userId, fotoId, feedId);
    if(!relatedFeed) {
      relatedFeed = yield call(API.fetchRelatedUserFeed, { userId, fotoId, feedId });
      relatedFeed = {...relatedFeed, feedId: originalFeedId, fotoId: fotoId}
    }
    yield put(fetchRelatedUserFeedSuccess({ userId, feedId, relatedFeed }));
  } catch (error) {
    yield put(fetchRelatedUserFeedFailure({ userId, feedId, error }));
  }
}


// /////////////////// 
// WATCHERS /////////
// /////////////////
function* watchUserFeed() {
  yield takeEvery(FETCH_USER_FEED, fetchUserFeed);
}
function* watchRelatedUserFeed() {
  yield takeLatest(FETCH_RELATED_USER_FEED, fetchRelatedUserFeed);
}

function* watchRelatedUserFeedList() {
  yield takeLatest(FETCH_RELATED_USER_FEED_LIST, fetchRelatedUserFeedList);
}

export default function () {
return [fork(watchUserFeed), fork(watchRelatedUserFeedList), fork(watchRelatedUserFeed)];
}
