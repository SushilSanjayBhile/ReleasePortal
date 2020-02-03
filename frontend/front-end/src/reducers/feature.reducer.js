// Here, more than any other area, I'm cutting some corners (at least,
// for now). As it stands, you're always logged in as one user. There's
// no way to create accounts or log out.
//
// Later, I may make a simplified auth system, where you can log in as
// any of the arbitrary users, to ensure that all the reducers update

import { combineReducers } from 'redux';

import {
    SAVE_FEATURES, SAVE_SINGLE_FEATURE
} from '../actions';

const initialState = {
    features: {},
    single: {}
};

// ////////////////////
// Modifiers //////////
// //////////////////

// ////////////////////
// Reducers //////////
// //////////////////
function all(state = initialState.features, action) {
    switch (action.type) {
        case SAVE_FEATURES:
            state[action.payload.id] = action.payload.data;
            return { ...state };

        default:
            return state;
    }
}
function single(state = initialState.single, action) {
    switch (action.type) {
        case SAVE_SINGLE_FEATURE:
            state = action.payload.data;
            return { ...state }
        default:
            return state;
    }
}
export const featureReducer = combineReducers({
    all,
    single
});

// ////////////////////
// Selectors //////////
// //////////////////


