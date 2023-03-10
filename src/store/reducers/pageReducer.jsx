import TYPES from "store/types";

const initialState = {
    theme: "light",
    headerTitle: "Loading",
};

function pageReducer(state = initialState, action) {
    switch (action.type) {
        case TYPES.PAGE_CHANGE_HEADER_TITLE:
            return {
                ...state,
                headerTitle: action.payload,
            };
        case TYPES.PAGE_CHANGE_THEME:
            return {
                ...state,
                theme: action.payload,
            };
        case TYPES.SHOW_TOAST:
            return {
                ...state,
                alert: action.payload,
            };
        default:
            return state;
    }
}

export default pageReducer;
