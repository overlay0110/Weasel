// Default State
const initialState = {
    access_url: '',
};

// Actions
export const URL_CHANGE = "URL_CHANGE";

// Action Functions
export function urlChange(e){
    return {
        type: URL_CHANGE,
        url : e.url,
    };
}


// Reducer
function reducer(state = initialState, action) {
    switch (action.type) {
        case URL_CHANGE:
            return {
                ...state,
                access_url: action.url
            }
    }
    return state;
}

// Exports Default
export default reducer;
