// Here, more than any other area, I'm cutting some corners (at least,
// for now). As it stands, you're always logged in as one user. There's
// no way to create accounts or log out.
//
// Later, I may make a simplified auth system, where you can log in as
// any of the arbitrary users, to ensure that all the reducers update

import { combineReducers } from 'redux';

import {
    SAVE_BUGS
} from '../actions';

const initialState = {
    features: {}
};

// ////////////////////
// Modifiers //////////
// //////////////////

// ////////////////////
// Reducers //////////
// //////////////////
function all(state = initialState.features, action) {
    switch (action.type) {
        case SAVE_BUGS:
            let bug = action.payload.data;
            let allBugs = state[action.payload.id] ? state[action.payload.id].bug : {};
            if (bug.all) {
                allBugs = bug.all;
            }
            // state[action.payload.id] = action.payload.data;
            if (!state[action.payload.id]) {
                state[action.payload.id] = { bugCount: { all: { total: 0, open: 0, resolved: 0, others: 0 }, category: {} }, bug: allBugs }
            }
            let bugCount = state[action.payload.id].bugCount
            // if (bug) {
            let others = 0;
            if (bug.total >= 0) {
                bugCount.all.total = bug.total
            }
            if (bug.open >= 0) {
                bugCount.all.open = bug.open
            }
            if (bug.resolved >= 0) {
                bugCount.all.resolved = bug.resolved
            }
            if (bugCount.all.total > 0 && bugCount.all.open >= 0 && bugCount.all.resolved >= 0) {
                others = bugCount.all.total - (bugCount.all.open + bugCount.all.resolved);
            }
            bugCount.all.others = others;
            // bug.issues.forEach(item => {
            //     if (item.fields.status.name !== 'Duplicate') {
            //         bugCount.all.Total += 1;
            //         if (item.fields.status.name === 'Resolved') {
            //             bugCount.all.Closed += 1
            //         } else {
            //             bugCount.all.Open += 1;
            //         }
            //     }
            //     if (bugCount.category[item.fields.priority.name]) {
            //         bugCount.category[item.fields.priority.name].total += 1;
            //     } else {
            //         bugCount.category[item.fields.priority.name] = { total: 1 }
            //     }
            // })
            // }
            state[action.payload.id] = {
                bugCount: bugCount, bug: allBugs
            }
            return { ...state };

        default:
            return state;
    }
}

export const bugReducer = combineReducers({
    all,
});

// ////////////////////
// Selectors //////////
// //////////////////


