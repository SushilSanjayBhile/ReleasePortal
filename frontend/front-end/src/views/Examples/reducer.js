export const initialState={count:0}
export const exampleReducer = (state, action) => {
    switch(action.type) {
        case 'add':
            return {count: state.count + 1, text: action.text}
        case 'subtract':
            return {count: state.count -1, text: action.text}
        default:
            return state;
    }
}