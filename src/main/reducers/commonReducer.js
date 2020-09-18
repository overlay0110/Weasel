import {getConfig, getPoints, getCode2, pinCheckVlaue} from '../import/func';
import {select, insert, update, del} from '../import/funcDB';

// Default State
const initialState = {
    configLogInfo : null,
    fcmToken : '',
    loading : false,
    code : '3ed7b43a471352c60cd3a68455573c16f44c1dfe98866e75c0ada1e7cd3b7467',
    lock : false,
    view_lock : false,
};

// Actions
export const SET_CONFIGLOG = "SET_CONFIGLOG";
export const LOADING_START = "LOADING_START";
export const LOADING_STOP = "LOADING_STOP";
export const GET_FCM_TOKEN = "GET_FCM_TOKEN";
export const SET_CODE = "SET_CODE";
export const SET_LOCK_START = "SET_LOCK_START";
export const SET_LOCK = "SET_LOCK";
export const SET_VIEW_LOCK = "SET_VIEW_LOCK";

// Action Functions
export function setViewLock(value){
    return {
        type: SET_VIEW_LOCK,
        view_lock : value,
    }
}
export function setLock(value = false){
    return async (dispatch, getState) => {
        let check = pinCheckVlaue();
        let auth_code = ''

        if(auth_code != check){
            value = true;
        }

        dispatch({
            type: SET_LOCK_START,
            lock : value,
            view_lock : value,
        });
    };
}

export function updateLock(value = false){
    return {
        type: SET_LOCK,
        lock : value
    }
}

export function setCode(){
    return async (dispatch, getState) => {
        let value = await getCode2();

        dispatch({
            type: SET_CODE,
            code : value
        });
    };
}
export function setConfigLog(value){
    return {
        type: SET_CONFIGLOG,
        configLog : value
    };
}

export function loadingStart(){
    return {
        type : LOADING_START,
    }
}

export function loadingStop(){
    return {
        type : LOADING_STOP,
    }
}

export function setFcmToken(token){
    return {
        type : GET_FCM_TOKEN,
        token : token,
    };
}

// Reducer
function reducer(state = initialState, action) {
    switch (action.type) {
        case SET_CONFIGLOG:
            return {
                ...state,
                configLogInfo: action.configLog
            }
		case LOADING_START:
            return {
                ...state,
                loading: true,
            }
        case LOADING_STOP:
            return {
                ...state,
                loading: false,
            }
        case GET_FCM_TOKEN:
            return {
                ...state,
                fcmToken : action.token,
            }
        case SET_CODE:
            return {
                ...state,
                code : action.code,
            }
        case SET_LOCK_START:
            return {
                ...state,
                lock : action.lock,
                view_lock : action.view_lock,
            }
        case SET_LOCK:
            return {
                ...state,
                lock : action.lock,
            }
        case SET_VIEW_LOCK:
            return {
                ...state,
                view_lock : action.view_lock,
            }
    }
    return state;
}

// Exports Default
export default reducer;
