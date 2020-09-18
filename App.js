/**
* Sample React Native App
* https://github.com/facebook/react-native
*
* @format
* @flow strict-local
*/

import React, { useState, useEffect } from 'react';
import { View, Text, Platform, StatusBar } from 'react-native';
import NetInfo from "@react-native-community/netinfo";

import Screen from "./src/main/";
import allReducers from './src/main/reducers';
import strings from './src/main/assets/locale';
import {print, actionAlert, getConfig, getNow} from './src/main/import/func';
import {select, insert, update} from './src/main/import/funcDB';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import JailMonkey from 'jail-monkey';
import RNExitApp from 'react-native-exit-app';
import SplashScreen from 'react-native-splash-screen';
import { getStatusBarHeight } from "react-native-status-bar-height";
import { isIphoneX, getBottomSpace } from "react-native-iphone-x-helper";

// 하단 노란 박스 안나오게 하기
console.disableYellowBox = true;

const store = createStore(allReducers, applyMiddleware(thunk));

function PlatformSelectStatusBar(props){
    let hei = 0;
    if (isIphoneX()) {
        hei = getBottomSpace();
    } else {
        hei = getStatusBarHeight(true);
    }

    if(Platform.OS === "android"){
        return (
            <StatusBar backgroundColor={getConfig().STATUS_BAR_COLOR} barStyle={getConfig().STATUS_BAR_STYLE}/>
        );
    }
    else if(Platform.OS === "ios"){
        return (
            <View style={{height : hei, backgroundColor : getConfig().STATUS_BAR_COLOR}}>
                <StatusBar backgroundColor={getConfig().STATUS_BAR_COLOR} barStyle={getConfig().STATUS_BAR_STYLE}/>
            </View>
        )
    }
}

const App: () => React$Node = () => {
    const [check, setCheck] = useState('');

    useEffect(() => {
        start();
    },[]);

    const start = async () => {
        let time = 1000;


        // IOS 탈옥검사 , Android 루팅검사
        if(JailMonkey.isJailBroken() && getConfig().ROOT_CHECK != false){
            if(Platform.OS == 'ios'){
                SplashScreen.hide();
            }
            actionAlert(strings.root_mess, () => RNExitApp.exitApp() );
            return false;
        }


        if(Platform.OS === 'android'){}

        // 네트워크 연결 여부
        const netInfo = await NetInfo.fetch();
        print(
            'isConnected: ' + netInfo.isConnected
        );

        if(!netInfo.isConnected){
            if(Platform.OS == 'ios'){
                SplashScreen.hide();
            }
            actionAlert(strings.internet_error, () => RNExitApp.exitApp() );
            return false;
        }

        let timer = setInterval(() => { setCheck('Yes'); clearInterval(timer); }, time);
    }

    if(check == 'Yes'){
        return (
            <Provider store={store}>
                <PlatformSelectStatusBar/>
                <Screen />
            </Provider>
        );
    }
    else{
        return null;
    }
};

export default App;
