import {print} from '../import/func';
import Geolocation from '@react-native-community/geolocation';
import {loadingStart, loadingStop} from './commonReducer';
import { NavigationActions } from 'react-navigation';

// Default State
const initialState = {
    latitude : null, // 위도
    longitude : null, // 경도
    location_error : true, // 위치정보 오류
    location_err_msg : '',
};

// Actions
export const LOCATION_SUCCESS = "LOCATION_SUCCESS";
export const LOCATION_ERROR = "LOCATION_ERROR";

// Action Functions
export function locationSuccess(position){
    return {
        type : LOCATION_SUCCESS,
        latitude : position.coords.latitude,
        longitude : position.coords.longitude,
        loading : false,
    }
}

export function locationError(err){
    // print(err)
    return {
        type : LOCATION_ERROR,
        error : err,
        loading : false,
    }
}

export function getLocation(move = null) {
    return (dispatch) => {
        dispatch(loadingStart());
        Geolocation.getCurrentPosition(
            (position) => {
                print('Geolocation', position);
                dispatch(locationSuccess(position));
                dispatch(loadingStop());
                if(move != null){
                    dispatch(NavigationActions.navigate({ routeName: 'WebView' }));
                }
            },
            (error) => {
                dispatch(locationError(error.message));
                dispatch(loadingStop());
                if(move != null){
                    dispatch(NavigationActions.navigate({ routeName: 'WebView' }));
                }
            },
            { enableHighAccuracy : false, timeout : 200000, },
            // enableHighAccuracy(bool)-GPS 사용 여부를 나타내는 부울입니다. true로 설정하면 GPS 위치가 요청됩니다. false로 설정하면 WIFI 위치가 요청됩니다.
        );
    }
}
// Reducer
function reducer(state = initialState, action) {
    // print('LOCA ACTION', action.type);
    switch (action.type) {
        case LOCATION_SUCCESS:
            return {
                ...state,
                latitude : action.latitude,
                longitude : action.longitude,
                location_error : false,
            }
        case LOCATION_ERROR:
            return {
                ...state,
                location_err_msg : action.error,
                location_error : true,
            }
    }
    return state;
}

// Exports Default
export default reducer;
