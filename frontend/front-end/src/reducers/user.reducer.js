// Here, more than any other area, I'm cutting some corners (at least,
// for now). As it stands, you're always logged in as one user. There's
// no way to create accounts or log out.
//
// Later, I may make a simplified auth system, where you can log in as
// any of the arbitrary users, to ensure that all the reducers update

import { combineReducers } from 'redux';

import {
    SAVE_USER_NOTIFICATIONS,
    CLEAR_USER_DATA,
    SAVE_OPEN_WORK, SAVE_CLOSED_WORK, SAVE_USERS,
    SAVE_USER_DETAILS,
    SAVE_PENDING_APPROVAL,
    SAVE_MY_REGRESSION,
    SAVE_ASSIGN_TCS,
    SAVE_MY_PENDING_APPROVAL
} from '../actions';

const initialState = {
    users: [],
    details: [],
    pendingApproval: [],
    myPendingApproval: [],
    myRegression: [],
    assignTcs: [],
    notifications: [],
    openWork: [],
    closedWork: []
};

// ////////////////////
// Reducers //////////
// //////////////////

function notifications(state = initialState.notifications, action) {
    switch (action.type) {
        case SAVE_USER_NOTIFICATIONS:
            if (Array.isArray(action.payload)) {
                action.payload = action.payload.map(item => ({ ...item, time: new Date(item.time) }));
                action.payload.sort((a, b) => {
                    return b.time.getTime() - a.time.getTime()
                })
            }
            return action.payload

        default:
            return state;
    }
}
function clear(state, action) {
    switch (action.type) {
        case CLEAR_USER_DATA:
            state.messages = [];
            state.openWork = [];
            state.closedWork = [];
            console.log('cleared state ', state);
            return state;
        default:
            return state;
    }
}
function openWork(state = initialState.openWork, action) {
    switch (action.type) {
        case SAVE_OPEN_WORK:
            if (Array.isArray(action.payload)) {
                action.payload = action.payload.map(item => ({ ...item, time: new Date(item.time) }));
                action.payload.sort((a, b) => {
                    return b.time.getTime() - a.time.getTime()
                })
            }
            return action.payload

        default:
            return state;
    }
}
function closedWork(state = initialState.closedWork, action) {
    switch (action.type) {
        case SAVE_CLOSED_WORK:
            if (Array.isArray(action.payload)) {
                action.payload = action.payload.map(item => ({ ...item, time: new Date(item.time) }));
                action.payload.sort((a, b) => {
                    return b.time.getTime() - a.time.getTime()
                })
            }
            return action.payload

        default:
            return state;
    }
}
function users(state = initialState.users, action) {
    switch (action.type) {
        case SAVE_USERS:
            state = action.payload;
            return state;
        default:
            return state;
    }
}
function details(state = initialState.details, action) {
    switch (action.type) {
        case SAVE_USER_DETAILS:
            state = action.payload;
            return state;
        default:
            return state;
    }
}

function pendingApproval(state = initialState.pendingApproval, action) {
    switch (action.type) {
        case SAVE_PENDING_APPROVAL:
            state = action.payload;
            return state;
        default:
            return state;
    }
}
function myRegression(state = initialState.myRegression, action) {
    switch (action.type) {
        case SAVE_MY_REGRESSION:
            state = action.payload;
            return state;
        default:
            return state;
    }
}
function assignTcs(state = initialState.myRegression, action) {
    switch (action.type) {
        case SAVE_ASSIGN_TCS:
            state = action.payload;
            return state;
        default:
            return state;
    }
}
function myPendingApproval(state = initialState.myPendingApproval, action) {
    switch (action.type) {
        case SAVE_MY_PENDING_APPROVAL:
            state = action.payload;
            return state;
        default:
            return state;
    }
}


export default combineReducers({
    notifications,
    users,
    details,
    pendingApproval,
    myPendingApproval,
    myRegression,
    assignTcs
});

// ////////////////////
// Selectors /////////
// //////////////////

