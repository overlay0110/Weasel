import React, {Component} from 'react';
import { View, Text, Button, BackHandler, ToastAndroid, Dimensions, ScrollView, RefreshControl, Platform, StyleSheet, TouchableOpacity } from 'react-native';
import Loading from '../../import/Loading';
import {print, customAlert} from '../../import/func';
import {increment} from '../../reducers/baseReducer';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import QRCodeScanner from 'react-native-qrcode-scanner';

const QrScan = props => {
	const onSuccess = (e) => {
        print(e);
    }

    return (
        <QRCodeScanner
            onRead={onSuccess}
            topContent={
                <Text style={styles.centerText}>
                Go to <Text style={styles.textBold}>wikipedia.org/wiki/QR_code</Text> on your computer and scan the QR code.
                </Text>
            }
            bottomContent={
                <TouchableOpacity style={styles.buttonTouchable}>
                    <Text style={styles.buttonText}>OK. Got it!</Text>
                </TouchableOpacity>
            }
        />
    );
}

const styles = StyleSheet.create({
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777',
    },
    textBold: {
        fontWeight: '500',
        color: '#000',
    },
    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)',
    },
    buttonTouchable: {
        padding: 16,
    },
});

function mapStateToProps (state) {
    // mapStateToProps여기에 로그 넣으면 속도 저하 발생
    return {
        state: state,
    }
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        increment: increment,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QrScan)
