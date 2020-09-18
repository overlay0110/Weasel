import React, {Component} from 'react';
import { View, Text, Button, BackHandler, ToastAndroid, Dimensions, ScrollView, RefreshControl, Platform } from 'react-native';
import Loading from '../../import/Loading';
import {print, customAlert} from '../../import/func';
import {increment} from '../../reducers/baseReducer';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RNLockScreen from 'react-native-lock-screen';
import SocketIOClient from 'socket.io-client/dist/socket.io.js';

class List extends Component{
	constructor(props){
		super(props);
		this.state = {
			getMsg : 'None',
		}
		this.socket = SocketIOClient('http://192.168.1.18:3000');

		//bind the functions
		this._sendPing = this._sendPing.bind(this);
		this._getReply = this._getReply.bind(this);

		this.socket.on('chatMessage', this._getReply);
	}

	_sendPing(){
		//emit a dong message to socket server
		socket.emit('chatMessage', '123456');
	}

	_getReply(data){
		//get reply from socket server, log it to console
		this.setState({getMsg : data});
		console.log('Reply from server:' + data);
	}
	// return (
	// 	<RNLockScreen type={RNLockScreen.Type.Pattern} mode={RNLockScreen.Mode.Capture} onCapture={lock => {
	// 	  }} onVerified={() => {
	//
	// 	  }}
	// 	  lock={'1234'}
	// 	/>
	// );

	render(){
		return (
	        <View style={{flex:1}}>
				<Text>Get msg : {this.state.getMsg}</Text>
	            <Text>List.js</Text>
	        </View>
	    );
	}

}

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

export default connect(mapStateToProps, mapDispatchToProps)(List)
