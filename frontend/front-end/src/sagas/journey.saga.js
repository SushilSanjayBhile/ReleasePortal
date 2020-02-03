import { take, call, put, fork, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { GOOGLE_MAP_NOT_FOUND, DEFAULT_MARKER_PATH, APP_RESERVED_FEED_ID, APP_RESERVED_USER_ID, APP_RESERVED_USER_NAME,
    FOTO_CATEGORY } from '../constants';
import * as API from '../utils/API.utils';
import {
    FETCH_USER_JOURNEY,
    fetchUserJourneySuccess,
    fetchUserJourneyFailure,
} from '../actions';

const getJourneyFromIndexDB = (userId, places) => {
    // TODO: return the saved jounrye from the local IndexDb else return null. Also check the time expiry of the journey.
    return null;
}
const getPlaces = (search) => {
    let places = search.split('&');
    const fetchPlaces = [];
    places.forEach(place => fetchPlaces.push(place.split('=')[1]))
    return fetchPlaces;
}
const sortJourney = (feed) => {
    let combined = [], combinedFood = [];
    feed.forEach(item => {
        combined = combined.concat(item.fotos.map(foto => ({ ...item.user, ...foto })))
    });
    combined.sort((a, b) => (b.likes - a.likes));
    combinedFood = combined.filter(item => item.category === FOTO_CATEGORY.FOOD).sort((a, b) => (b.likes - a.likes))
    return {
        default: feed,
        top: {
            id: APP_RESERVED_FEED_ID,
            user: {
                uid: APP_RESERVED_USER_ID,
                username: APP_RESERVED_USER_NAME,
                userpic: DEFAULT_MARKER_PATH
            },
            combined, combinedFood
        }
    }
}

function* fetchUserJourney({ userId, search }) {
    let places = null;
    try {
        places = getPlaces(search);
        // TODO: if the journey is present in indexDB, then return saved journey else fetch frm the server
        let journies = getJourneyFromIndexDB(userId, places);
        if(!journies) {
            journies = yield call(API.fetchJourney, { userId, places });
            journies = { places: journies.places, feed: sortJourney(journies.feed) }
        }
        yield put(fetchUserJourneySuccess({ userId, places, journies }));
    } catch (error) {
        yield put(fetchUserJourneyFailure({ userId, places, error }));
    }
}

// /////////////////// 
// WATCHERS /////////
// /////////////////
function* watchUserJourney() {
    yield takeLatest(FETCH_USER_JOURNEY, fetchUserJourney);
}

export default function () {
    return [fork(watchUserJourney)];
}