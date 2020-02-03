
import { combineReducers } from 'redux';
import {
    FETCH_USER_FEED_SUCCESS, UPDATE_ACTIVE_FEED,
    FETCH_RELATED_USER_FEED_LIST_SUCCESS,
    FETCH_RELATED_USER_FEED_LIST_FAILURE,
    FETCH_RELATED_USER_FEED_SUCCESS,
    FETCH_RELATED_USER_FEED_FAILURE,
    FETCH_USER_JOURNEY_SUCCESS,
    FETCH_USER_TRAVEL_SUCCESS
} from '../actions';

const initialState = {
    all: null,
    journey: null,
    travel: null,
    recommended: null,

    activeFeed: null,
    relatedFeedList: null,
    relatedFeed: null,
    loading: false
};
// ////////////////////
// Modifiers //////////
// //////////////////
const saveUserFeedToIndexDB = (feed, userId, latestFeed) => {
    // TODO: arrange in descending order of time the incoming feed and save only maximum latest 30 posts in local IndexDb
    // and local state.
    return latestFeed; 
}
const saveRelatedUserFeedListToIndexDb = (relatedFeedList, userId, feedId, latestRelatedFeedList) => {
    // TODO: replace saved related feed list with the latest one
    return latestRelatedFeedList;
}
const saveRelatedUserFeedToIndexDb = (relatedFeed, userId, feedId, latestRelatedFeed) => {
    // TODO: replace saved related feed with the latest one
    return latestRelatedFeed;
}

const saveUserJourneyToIndexDB = (journey, userId, latestJournies) => {
    // TODO: arrange in descending order of time the incoming feed and save only maximum latest 30 posts in local IndexDb
    // and local state.
    return latestJournies; 
}

const saveUserTravelToIndexDB = (travel, userId, latestTravel) => {
    // TODO: arrange in descending order of time the incoming feed and save only maximum latest 30 posts in local IndexDb
    // and local state.
    console.log('travel ', latestTravel);
    return latestTravel; 
}


// ////////////////////
// Reducers //////////
// //////////////////
function all(state = initialState.all, action) {
    switch (action.type) {
        case FETCH_USER_FEED_SUCCESS:
            return saveUserFeedToIndexDB(state, action.userId, action.feed);
        default:
            return state
    }
}
function journey(state = initialState.journey, action) {
    switch (action.type) {
        case FETCH_USER_JOURNEY_SUCCESS:
            return saveUserJourneyToIndexDB(state, action.userId, action.journies);
        default:
            return state
    }
}
function travel(state = initialState.travel, action) {
    switch (action.type) {
        case FETCH_USER_TRAVEL_SUCCESS:
            return saveUserTravelToIndexDB(state, action.userId, action.travel);
        default:
            return state
    }
}
function activeFeed(state = initialState.activeFeed, action) {
    switch (action.type) {
        case UPDATE_ACTIVE_FEED:
            return action.payload;

        default:
            return state;
    }
}
function relatedFeedList(state = initialState.relatedFeedList, action) {
    switch(action.type) {
        case FETCH_RELATED_USER_FEED_LIST_SUCCESS:
            return saveRelatedUserFeedListToIndexDb(state, action.userId, action.feedId, action.relatedFeedList);
        case FETCH_RELATED_USER_FEED_LIST_FAILURE:
            return saveRelatedUserFeedListToIndexDb(state, action.userId, action.feedId, null);
        default:
            return state;
    }
}
function relatedFeed(state = initialState.relatedFeed, action) {
    switch(action.type) {
        case FETCH_RELATED_USER_FEED_SUCCESS:
            return saveRelatedUserFeedToIndexDb(state, action.userId, action.feedId, action.relatedFeed);
        case FETCH_RELATED_USER_FEED_FAILURE:
            return saveRelatedUserFeedToIndexDb(state, action.userId, action.feedId, null);
        default:
            return state;
    }
}

export default combineReducers({
    all,
    journey,
    travel,
    activeFeed,
    relatedFeedList,
    relatedFeed
});


// ////////////////////
// Selectors //////////
// //////////////////