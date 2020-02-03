// TODO: after uploading images data to server the extension of images is changed
export const GOOGLE_MAP_NOT_FOUND = 'GOOGLE_MAP_NOT_FOUND';

export const DEFAULT_MARKER_PATH = `${process.env.PUBLIC_URL}/data/fotos/App/journey.jpg`;
export const MARKER = `${process.env.PUBLIC_URL}/data/fotos/App/marker.png`;
export const APP_RESERVED_FEED_ID = 'APP_RESERVED_FEED_ID';
export const APP_RESERVED_USER_ID = 'APP_RESERVED_USER_ID';
export const APP_RESERVED_USER_NAME = 'App';
export const TOP_JOURNEY = 'top';
export const FOTO_CATEGORY = {
    FOOD: 'food',
    PLACE: 'place'
}

// ROUTES
export const journeyPathName = '/home/journey';


// MOOD
export const MOOD = {
    FOOD: 'FOOD',
    TRAVEL: 'TRAVEL',
    JOURNEY: 'JOURNEY',
    FEED: 'FEED',
    LIVE: 'LIVE'
};

export const WEATHER = {
    RAIN: 'RAIN'
}

export const EMOJI = {
    'LIVE': `${process.env.PUBLIC_URL}/live.PNG`,
    'FOOD': `${process.env.PUBLIC_URL}/hungry.PNG`,
    'TRAVEL': `${process.env.PUBLIC_URL}/travel.PNG`,
    'JOURNEY': `${process.env.PUBLIC_URL}/journey.PNG`,
    'FEED': `${process.env.PUBLIC_URL}/general.PNG`,
    'RAIN': `${process.env.PUBLIC_URL}/rain.PNG`,
};

export const TABLE_OPTIONS = {
    EDIT: 'EDIT',
    DELETE: 'DELETE',
    ADD: 'ADD'
}