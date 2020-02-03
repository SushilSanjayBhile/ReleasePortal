import {
    UPDATE_MAP
  } from '../../actions';
  
  
  const initialState = {
    isFullLayout: false,
    isHidden: false,
    route: null
  };
  
  // ////////////////////
  // Reducers //////////
  // //////////////////
  export default function mapActions(state = initialState, action) {
    switch (action.type) {
      case UPDATE_MAP:
        // If we clicked the same button that opened the flyout, it should close.
        return {
            ...state,
            ...action.payload
        }
      
      default:
        return state;
    }
  }
  
  
  // ////////////////////
  // Selectors /////////
  // //////////////////
  