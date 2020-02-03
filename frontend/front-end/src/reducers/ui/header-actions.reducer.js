import {
  TOGGLE_FLYOUT, CHANGE_MOOD
} from '../../actions';
import { MOOD } from '../../constants';


const initialState = {
  activeFlyout: null,
  mood: MOOD.FEED
};

// ////////////////////
// Reducers //////////
// //////////////////
export default function headerActions(state = initialState, action) {
  switch (action.type) {
    case TOGGLE_FLYOUT:
      // If we clicked the same button that opened the flyout, it should close.
      const newFlyoutValue =  action.flyout !== state.activeFlyout
        ? action.flyout
        : null;

      return {
        ...state,
        activeFlyout: newFlyoutValue,
      };

    case CHANGE_MOOD:
      return {
        ...state, 
        mood: action.mood
      }

    default:
      return state;
  }
}


// ////////////////////
// Selectors /////////
// //////////////////
