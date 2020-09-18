// Default State
const initialState = {
    count: 0
};

// Actions
export const INCREMENT = "Increment";
export const DECREMENT = "Decrement";

// Action Functions
export function increment(){
    return {
        type: INCREMENT
    };
}
export function decrement(){
    return {
        type: DECREMENT
    };
}

export function sampleAsyncFun(){
    return async (dispatch, getState) => {
        // let state = getState();
        // const {user_data} = state.ChatReducer;
        // let tokenCheck = await select('user', '*');
        // dispatch(getUserData());
    };
}

// Reducer
function reducer(state = initialState, action) {
    switch (action.type) {
        case INCREMENT:
            return {
                ...state,
                count: state.count + 1
            }
        case DECREMENT:
            return {
                count: state.count - 1
            }
    }
    return state;
}

// Exports Default
export default reducer;
