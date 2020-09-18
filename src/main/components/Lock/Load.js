import React, {Component, useState, useEffect} from 'react';
import { View, Text, Button, BackHandler, ToastAndroid, Dimensions, ScrollView, RefreshControl, Platform } from 'react-native';
import Loading from '../../import/Loading';
import {print, customAlert, getConfigLog, getConfig} from '../../import/func';
import {userSet, select} from '../../import/funcDB';
import {setConfigLog, setFcmToken, setCode, setLock} from '../../reducers/commonReducer';
import {getSelRoomCode} from '../../reducers/ChatReducer';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { StackActions, NavigationActions } from 'react-navigation';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';

const Load = props => {
    useEffect(() => {
        start();
    }, []);

    const start = async () => {
		// config 호출 App.js로 변경하기
        let configInfo = getConfig();
        //let configLogInfo = await getConfigLog();
        props.setCode();
        props.setLock();

        if(configInfo.CONFIG_CALL){
            let configLogInfo = await getConfigLog();
            props.setConfigLog(configLogInfo);
            root_check = configLogInfo.ROOT_CHECK;
        }

        props.getSelRoomCode();

        // const fcmToken = await firebase.messaging().getToken();
        // print('token : ', fcmToken);
        // props.setFcmToken(fcmToken);
        // await userSet({token : fcmToken});

        await firebase.messaging().onTokenRefresh( async fcmToken => {
            print('token : ', fcmToken);
            props.setFcmToken(fcmToken);
            await userSet({token : fcmToken});

            if(Platform.OS == 'ios'){
                SplashScreen.hide();
            }
    
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({ routeName: configInfo.FIRST_SCREEN })],
            });
            props.navigation.dispatch(resetAction);
        });
    }

    return null;
}

function mapStateToProps (state) {
    // mapStateToProps여기에 로그 넣으면 속도 저하 발생
    return {
        state: state,
    }
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        setConfigLog: setConfigLog,
        setFcmToken : setFcmToken,
        getSelRoomCode : getSelRoomCode,
        setCode : setCode,
        setLock : setLock,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Load)
