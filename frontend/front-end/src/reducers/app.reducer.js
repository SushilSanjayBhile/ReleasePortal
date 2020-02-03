// Here, more than any other area, I'm cutting some corners (at least,
// for now). As it stands, you're always logged in as one user. There's
// no way to create accounts or log out.
//
// Later, I may make a simplified auth system, where you can log in as
// any of the arbitrary users, to ensure that all the reducers update

import { combineReducers } from 'redux';
import navigation from '../_nav';
import {
    UPDATE_NAV,
    REMOVE_FROM_NAV,
    RELEASE_STATUS_PAGE,
    SAVE_MULTI_PENDING_APPROVAL
} from '../actions';

const initialState = {
    navigation: navigation,
    statusPage: null,
    multiPendingApproval: {}
};


// ////////////////////
// Modifiers //////////
// //////////////////

// ////////////////////
// Reducers //////////
// //////////////////
function navs(state = initialState.navigation, action) {
    switch (action.type) {
        case UPDATE_NAV:
            let existing = state.items[0].children.filter(item => item.name === action.payload.id);
            if (!existing.length) {
                state.items[0].children.push({
                    name: action.payload.id,
                    url: '/release/' + action.payload.id,
                    icon: 'icon-puzzle',
                })
            }
            return { ...state };
        case REMOVE_FROM_NAV:
            let found = null;
            existing = state.items[0].children;
            existing.forEach((item, index) => {
                if (item.ReleaseNumber === action.payload.id) {
                    found = index;
                }
            });
            if (found !== null) {
                existing.splice(found, 1);
            }
            state.items[0].children = existing;
            return [...state];
        default:
            return state;
    }
}
function statusPage(state = initialState.statusPage, action) {
    switch (action.type) {
        case RELEASE_STATUS_PAGE:
            return { ...action.payload };

        default:
            return state;
    }
}
function multiPendingApproval(state = initialState.multiPendingApproval, action) {
    switch (action.type) {
        case SAVE_MULTI_PENDING_APPROVAL:
            return { ...state, ...action.payload };

        default:
            return state;
    }
}

export default combineReducers({
    navs,
    statusPage,
    multiPendingApproval
});

