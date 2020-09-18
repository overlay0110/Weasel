import { combineReducers } from 'redux';
import ChatReducer from './ChatReducer';
import locationReducers from './locationReducers';
import commonReducer from './commonReducer';
import webViewReducer from './webViewReducer';
import countReducer from './baseReducer.js';

const allReducers = combineReducers({
    ChatReducer,
    locationReducers,
    commonReducer,
    webViewReducer,
    countReducer,
});

export default allReducers;
