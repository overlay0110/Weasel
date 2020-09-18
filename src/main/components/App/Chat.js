import React, {Component} from 'react';
import {
	View,
	Text,
	Button,
	BackHandler,
	ToastAndroid,
	Dimensions,
	ScrollView,
	RefreshControl,
	Platform,
	StyleSheet,
	TouchableOpacity,
	Image,
	TextInput,
	Animated,
	Easing,
	TouchableWithoutFeedback,
    Clipboard,
    FlatList,
    Keyboard,
	Linking,
	KeyboardAvoidingView,
} from 'react-native';
import Loading from '../../import/Loading';
import { Root, CheckBox } from "native-base";
import {print, customAlert, getConfig, aesDecode} from '../../import/func';
import {sendFcm} from '../../import/funcHTTP';
import {select, resMsg} from '../../import/funcDB';
import {getMyData, editMyData, setMyName, creUser, getUserData, creRoom, getSelTokenList, getSelRoomCode, getRoomList, resetRoom, getMsgList, updateMsg, getImgList, myImgUpdate, userNameUpdate, removeRoomUser, readYes, pinCheckUpdate, userOsUpdate} from '../../reducers/ChatReducer';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome5';
import {rn_header, rn_header2} from '../../import/appBase2';
import Modal from '../../import/CustomModal';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import RNExitApp from 'react-native-exit-app';
import strings from '../../assets/locale';
import Share from 'react-native-share';
import firebase from 'react-native-firebase';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

class Chat extends Component{
	constructor(props){
		super(props);
		this.state = {
			userList : { value : new Animated.Value(0), state : false },
			left : { value : new Animated.Value(0), state : false },
			right : { value : new Animated.Value(0), state : false },
			room : { value : new Animated.Value(0), state : false },
			icon : { value : new Animated.Value(0), state : false },
			userListSw : true,
			leftSw : true,
			rightSw : true,
			roomSw : true,
			iconSw : true,
			sendSw : false,
			msg  : '',
			modal_type : undefined,
			modal_option : undefined,
			left_search : '',
			sel_id_list : [],
		}

		this.didFocus = props.navigation.addListener("didFocus", payload => {
			BackHandler.addEventListener("hardwareBackPress", this.onBack);
            this.start();
            this._listenForNotifications();
		});
	}

	componentDidMount(){
		this.willBlur = this.props.navigation.addListener("willBlur", payload =>
			BackHandler.removeEventListener("hardwareBackPress", this.onBack),
		);

		// sendFcm();
	}

	componentWillUnmount() {
		this.didFocus.remove();
		this.willBlur.remove();
		BackHandler.removeEventListener("hardwareBackPress", this.onBack);
	}

	onBack = () => {
		if (this.exitApp == undefined || !this.exitApp) {
			ToastAndroid.show(strings.finish_mess, ToastAndroid.SHORT);
			this.exitApp = true;
			this.timeout = setTimeout(
				() => {
					this.exitApp = false;
				},
				2000    // 2초
			);
		} else {
			clearTimeout(this.timeout);
			RNExitApp.exitApp();  // 앱 종료
		}
		return true;
	}

	async start(){
		if(Platform.OS == 'ios'){
			await firebase.messaging().requestPermission();
		}

		this.props.getMyData();
		this.props.getUserData();
		this.props.getSelTokenList();
		this.props.getRoomList();
        this.props.getMsgList();
        this.props.getImgList();
        this.props.readYes();

        if(this.props.lock){
            this.modal_update('typeD', { pinType : 'check', pinResult : (result, type) => this.props.pinCheckUpdate(result, type)});
        }
	}

	setSwValue(key = ''){
		if(key == 'userList'){
			return {leftSw : true, rightSw : false, roomSw : false, iconSw : false,};
		}
		else if(key == 'left'){
			return {userListSw : true, rightSw : false, roomSw : false, iconSw : false,};
		}
		else if(key == 'right'){
			return {leftSw : false, userListSw : false, roomSw : false, iconSw : false,};
		}
		else if(key == 'room'){
			return {leftSw : false, rightSw : false, userListSw : false, iconSw : false,};
		}
		else if(key == 'icon'){
			return {leftSw : false, rightSw : false, roomSw : false, userListSw : false,};
		}

		return {userListSw : true, leftSw : true, rightSw : true, roomSw : true, iconSw : true, sel_id_list : []};
	}

	startAni(key, value){
		if ( parseInt(value) != 0 || ( this.state.left.state == true &&  key == 'userList') ) {
			this.setState(this.setSwValue(key));
		}
		else{
			this.setState(this.setSwValue());
        }

        if(key == 'room' || key == 'icon'){
            this._scroll_bottom();
        }

		this.setState({ [key] : { value : this.state[key].value, state : !this.state[key].state } });
		Animated.timing(this.state[key].value, {
			toValue : value,
			easing: Easing.ease,
			duration: 500,
			useNativeDriver : false,
		}).start();
	}

	setDisabled(){
		let { left, right, userList, room, icon} = this.state;

		if(left.state){
			this.startAni('left', 0);
		}
		else if(right.state){
			this.startAni('right', 0);
		}
		else if(userList.state){
			this.startAni('userList', 0);
		}
		else if(room.state){
			this.startAni('room', 0);
		}
		else if(icon.state){
			this.startAni('icon', 0);
		}
	}

	startLeft(){
		// this.startAni('userList', 0);

		this.startAni('left', (Dimensions.get('window').width / 2))
	}

	leftSel = item => () => {
		if(this.state.sel_id_list.indexOf(item.id) < 0){
			this.setState({ sel_id_list : this.state.sel_id_list.concat(item.id) })
		}
		else{
			this.setState({ sel_id_list : this.state.sel_id_list.filter( id => id !== item.id )})
		}
	}

	share(){
		let { my_data } = this.props.chat;
		my_data = my_data[0];
		const options = {
	        title: 'Share',
	        url : my_data.token,
	    };
	    Share.open(options)
	        .then((res) => { print(res) })
	        .catch((err) => { err && print(err); });
	}

	modal_update(type, data=[]){
		let closeFun = () => this.setState({ modal_option : undefined });
		// console.log('modal_update ', this.props);

		let option = {
			isModalVisible : true,
			closePress : closeFun,
			crePress : (values) => this.props.creUser(values.token, values.os, closeFun),
		}

		if(data.length != 0){
			if(type == 'typeC'){
				option['typeCdatas'] = data[0];
                option['removePress'] = (values) => this.props.removeRoomUser(values, closeFun);
                option['userNamePress'] = (name, token) => this.props.userNameUpdate(name, token);
				option['userOsPress'] = (os, token) => this.props.userOsUpdate(os, token);
            }
            else if(type == 'typeA'){
                option['typeAdatas'] = data;
                option['imgUpdate'] = (value) => this.props.myImgUpdate(value, closeFun);
            }
            else if(type == 'typeD'){
                option['typeDdatas'] = data;
            }
        }

		this.setState({
			modal_type : type,
			modal_option : option,
		});
	}

	tokenToValue(token, datas, key){
		for(var i=0; i<datas.length;i++){
			if(datas[i].token == token){
				return datas[i][key];
			}
		}
	}

	async send(type='text', id=0){
		let {msg} = this.state;
        let {sel_room_token_list, sel_room_code, my_name, my_data} = this.props.chat;
        let msgType = 'text';
        let fcmMsg = msg;
        let config = getConfig();
		let user = [];

        let serverKey = aesDecode(config.SERVER_KEY_FCM, this.props.code);

        if(type == 'emoticon'){
            msg = id;
            msgType = 'emoticon';
            fcmMsg = '[이모티콘]';
        }

        if(sel_room_code == 'None'){
            customAlert('대화 상대가 없습니다. 대화 상대를 추가해주세요.');
            this.setState({msg : '', sendSw : false});
            Keyboard.dismiss();
            return;
        }

		this.props.updateMsg(msg, msgType);
        let tokens = sel_room_token_list.concat(my_data[0].token);
		let result = [];
		let option = {};

        for(var i=0;i<tokens.length;i++){
            user = await select('user', '*', 'token=?', [tokens[i]]);

            if(user.length != 0){
                user[0]['name'] = aesDecode(user[0]['name'], this.props.code);
                result.push(user[0]);
			}
        }

		for(var i=0;i<tokens.length;i++){
			user = await select('user', '*', 'token=?', [tokens[i]]);

			if(tokens[i] != my_data[0].token){
				option = {
					registration_ids : [ tokens[i] ],
					data : {
						title : my_name,
						body : fcmMsg,
						room_code : sel_room_code,
						tokens : tokens,
						toToken : my_data[0].token,
						users : result,
						os : user.length != 0 ? user[0].os : 'android',
						msgType : type,
						msg : msg,
					}
				};

				sendFcm(option, serverKey);
			}
		}

		// sendFcm({ registration_ids : sel_room_token_list, data : {title : my_name, body : fcmMsg, room_code : sel_room_code, tokens : tokens, toToken : my_data[0].token, users : result, msgType : type, msg : msg} }, serverKey);
		this.setState({msg : '', sendSw : false});
    }

    _scroll_bottom(){
        let timer = setInterval(() => {
            this.scrollView && this.scrollView.scrollToEnd({animated: true});
            clearInterval(timer);
        }, 1000);
    }

    async _listenForNotifications(){
        // onNotificationDisplayed - ios only

        this.notificationListener = firebase.notifications().onNotification((notification) => {
            print('onNotification', notification);
        });

        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            print('onNotificationOpened', notificationOpen);
        });

		// background message listener
        this.messageListener = firebase.messaging().onMessage(async (message) => {
            // Process your message as required
            // This listener is called with the app activated
            print('onMessage', message);
            resMsg(message._data, this.start.bind(this));
        });

        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            print('getInitialNotification', notificationOpen);
        }
    }

	render(){
		let {userList, left, right, room, icon, msg, modal_type, modal_option, left_search} = this.state;
		let { my_data, my_name, user_data, sel_room_token_list, room_list, msg_list, img_list } = this.props.chat;
		let headerSet = {
			title : (<><Text>{sel_room_token_list.length}명</Text> <Icon name={ userList.state ? 'caret-up' : 'caret-down'} size={16}/></>),
			left : { type : 'icon', text: left.state ? 'angle-double-left' : 'angle-double-right', show : this.state.leftSw,},
			right : { type : 'icon', text : right.state ? 'angle-double-right' : 'angle-double-left', show : this.state.rightSw,},
			titleFunc : () => { if(this.state.userListSw){ this.startAni('userList', userList.state ? 0 : 100) } },
			leftFunc : () => this.startAni('left', left.state ? 0 : (Dimensions.get('window').width / 2)),
			rightFunc : () => this.startAni('right', right.state ? 0 : (Dimensions.get('window').width / 2)),
        }

		my_data = my_data[0];
        // print('modal ', modal_type, modal_option);

        let disabledBtn = true;
        if(left.state || right.state || userList.state || room.state || icon.state){
			disabledBtn = false;
		}

		return (
			<View style={styles.container}>

				<Modal type={modal_type} option={modal_option} />
				{/* left content */}
				<Animated.View style={{width : left.value }}>
					<View style={{justifyContent : 'center', height : 50,}}>
						<TextInput style={[{ backgroundColor : '#d0d0d0', alignItems: 'center', color : '#fff', borderRadius : 50, paddingLeft : 15, margin : 5 },Platform.OS == 'ios' ? {paddingTop : 10, paddingBottom : 10} : {}]} placeholder="Write your user" placeholderTextColor="#fff" value={left_search} onChangeText={(left_search) => {this.setState({left_search}); this.props.getUserData(left_search);}}/>
					</View>

					<ScrollView>
						{user_data.map((item, i) =>
							<TouchableOpacity style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}} onPress={this.leftSel(item)}>
								<View style={{width : 50, height : 50, borderRadius : 50, marginBottom : 5,}}>
									{this.state.sel_id_list.indexOf(item.id) < 0 ? null : (<View style={{width : '100%', height : '100%', backgroundColor : 'rgba(0,0,0,0.5)', position : 'absolute', borderRadius : 50, justifyContent : 'center', alignItems : 'center', zIndex : 9}}><Icon name={'check'} size={30} style={{color : '#7EE9D1'}}/></View>) }
									<Image source = {{ uri: item.img_url }} style={{width : 50, height : 50, borderRadius : 50, marginBottom : 5}} />
								</View>
								<Text numberOfLines={1} style={{textAlign : 'center', fontWeight: 'bold'}}>{item.name}</Text>
							</TouchableOpacity>
						)}
						{/*
						<TouchableOpacity style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}}>
							<View style={{width : 50, height : 50, borderRadius : 50, marginBottom : 5,}}>

								<View style={{width : '100%', height : '100%', backgroundColor : 'rgba(0,0,0,0.5)', position : 'absolute', borderRadius : 50, justifyContent : 'center', alignItems : 'center', zIndex : 9}}><Icon name={'check'} size={30} style={{color : '#7EE9D1'}}/></View>
								<Image source = {{ uri: 'https://source.unsplash.com/QAB-WJcbgJk/60x60' }} style={{width : 50, height : 50, borderRadius : 50, marginBottom : 5}} />
							</View>
							<Text style={{textAlign : 'center', fontWeight: 'bold'}}>name</Text>
						</TouchableOpacity>
						*/}

						<TouchableOpacity style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}} onPress={()=>this.modal_update('typeB')}>
							<View style={{width : 50, height : 50, borderRadius : 50, backgroundColor : '#7EE9D1', justifyContent : 'center', alignItems : 'center', marginBottom : 5}}>
								<Icon name={'plus'} size={16} style={{color : '#fff'}}/>
							</View>
							<Text style={{textAlign : 'center', fontWeight: 'bold'}}>상대 등록</Text>
						</TouchableOpacity>
					</ScrollView>

					<TouchableOpacity style={{ backgroundColor : '#7EE9D1', justifyContent : 'center', alignItems : 'center', height : 100 }} onPress={() => this.state.sel_id_list.length != 0 ? this.props.creRoom(this.state.sel_id_list) : customAlert('선택된 대화상대가 없습니다. 다시 확인 후 시도해 주세요.')}>
						<Icon name={'plus'} size={30} style={{color : '#fff'}}/>

						<View style={{marginBottom : 0}}/>

						<Text style={{color : '#fff', fontWeight: 'bold'}}>대화 상대 추가</Text>
					</TouchableOpacity>
				</Animated.View>
				{/* left content end */}

				{/* width 50% */}
				<View style={{
					flex : 1,
				}}>
					{rn_header2(headerSet)}
					{/* User list */}
					<Animated.View style={{height : userList.value, backgroundColor : '#efefef', zIndex : 1}}>
						<ScrollView horizontal={true}>

							{sel_room_token_list.map((item, i) =>
								<TouchableOpacity style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}} onPress={()=>this.modal_update('typeC', [{img : this.tokenToValue(item, user_data, 'img_url'), name : this.tokenToValue(item, user_data, 'name'), token : item , os : this.tokenToValue(item, user_data, 'os')}])}>
									<Image source = {{ uri: this.tokenToValue(item, user_data, 'img_url') }} style={{width : 50, height : 50, borderRadius : 50, marginBottom : 5}} />
									<Text numberOfLines={1} style={{textAlign : 'center', fontWeight: 'bold', width : 70}}>{this.tokenToValue(item, user_data, 'name')}</Text>
								</TouchableOpacity>
							)}

							{/*
							<TouchableOpacity style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}}>
								<Image source = {{ uri: 'https://source.unsplash.com/QAB-WJcbgJk/60x60' }} style={{width : 50, height : 50, borderRadius : 50, marginBottom : 5}} />
								<Text style={{textAlign : 'center', fontWeight: 'bold'}}>name</Text>
							</TouchableOpacity>
							*/}

							<TouchableOpacity style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}} onPress={this.startLeft.bind(this)}>
								<View style={{width : 50, height : 50, borderRadius : 50, backgroundColor : '#7EE9D1', justifyContent : 'center', alignItems : 'center', marginBottom : 5}}>
									<Icon name={'plus'} size={16} style={{color : '#fff'}}/>
								</View>
								<Text style={{textAlign : 'center', fontWeight: 'bold'}}>상대 추가</Text>
							</TouchableOpacity>

						</ScrollView>
					</Animated.View>

					{/* User list end */}

					<TouchableWithoutFeedback onPress={this.setDisabled.bind(this)} disabled={disabledBtn}>
					{/* chat */}
					<KeyboardAvoidingView style={{flex : 1}} behavior={Platform.OS == "ios" ? "padding" : "height"} keyboardVerticalOffset = {20}> 
						{/* msg */}
						<ScrollView ref={ref => this.scrollView = ref} onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}>
							<View style={{marginBottom : 20}}/>

							{msg_list.map( (item,i) => {
								let msg_date = item.date.substr(0,10);
								let dateTag = null;

								if(item.is_date == 'yes'){
									dateTag = (<Text style={{color : '#cccaca', textAlign : 'center', fontWeight : 'bold', marginTop : 10, marginBottom : 50}}>{msg_date}</Text>);
								}

								if(item.type == 'emoticon' && item.state == 'my'){
									return (
										<>
										{dateTag}
										<View style={{alignItems : 'flex-end', marginBottom : 20,}}>
											<Image source = {{ uri: item.eicon_url }} style={{width : 100, height : 100, borderRadius : 0, marginBottom : 5}} />
										</View>
										</>
									);
								}
								else if(item.type == 'emoticon' && item.state == 'user'){
									return (
										<>
										{dateTag}
										<View style={{flexDirection: 'row', alignItems: 'center', marginBottom : 20,}}>
											<View style={{position: 'absolute'}}>
												<Image source = {{ uri: item.img_url }} style={{width : 50, height : 50, borderRadius : 50, marginLeft : 10}} />
												<Text style={{textAlign : 'center', fontWeight: 'bold',marginLeft : 10}}>{item.name}</Text>
											</View>

											<View style={{marginLeft : 70}}>
												<Image source = {{ uri: item.eicon_url }} style={{width : 100, height : 100, borderRadius : 0, marginBottom : 5}} />
											</View>
										</View>
										</>
									);
								}

								if(item.state == 'my'){
									return (
										<>
										{dateTag}
										<View style={{alignItems : 'flex-end', marginBottom : 20,}}>
											<View style={{backgroundColor : '#7EE9D1', padding : 15, borderRadius : 20, textAlign : 'left', margin : 10}}>
												<Text style={{fontWeight : 'bold', marginBottom : 5, color : '#fff'}}>{item.msg}</Text>
												<Text style={{color : '#efefef'}}>{item.date}</Text>
											</View>
										</View>
										</>
									);
								}
								else if(item.state == 'user'){
									return (
										<>
										{dateTag}
										<View style={{flexDirection: 'row', alignItems: 'center', marginBottom : 20,}}>
											<View style={{position: 'absolute'}}>
												<Image source = {{ uri: item.img_url }} style={{width : 50, height : 50, borderRadius : 50, marginLeft : 10}} />
												<Text style={{textAlign : 'center', fontWeight: 'bold',marginLeft : 10}}>{item.name}</Text>
											</View>

											<View style={{backgroundColor : '#fff', padding : 15, borderRadius : 20, textAlign : 'left', margin : 10,  marginLeft : 70 }}>
												<Text style={{fontWeight : 'bold', marginBottom : 5, color : '#676a6c' }}>{item.msg}</Text>
												<Text style={{color: '#ababab'}}>{item.date}</Text>
											</View>
										</View>
										</>
									);
								}
							})}



						</ScrollView>


						{/* input */}
						<View style={{height : 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal : 5 }}>
							<TouchableOpacity disabled={!this.state.roomSw} onPress={() => this.startAni('room', room.state ? 0 : 250)} style={{ backgroundColor : !this.state.roomSw ? '#efefef' : '#d0d0d0', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
								<Icon name={room.state ? 'angle-double-down' : 'angle-double-up'} size={16} style={{color : '#fff'}}/>
							</TouchableOpacity>

							<View style={{flex : 1, margin : 5, justifyContent : 'center', backgroundColor : '#d0d0d0', borderRadius : 50}}>
								<TextInput multiline={true} style={[{ alignItems: 'center', color : '#fff', borderRadius : 50, paddingLeft : 15, marginRight : 25,},Platform.OS == 'ios' ? {paddingTop : 10, paddingBottom : 10} : {}]} placeholder="메시지를 입력하세요." placeholderTextColor="#fff" value={msg} onChangeText={(msg) => this.setState({msg : msg, sendSw : msg.trim().length < 1 ? false : true})} onFocus={(event) => { this._scroll_bottom() }}/>

								<TouchableOpacity disabled={!this.state.iconSw} onPress={() => this.startAni('icon', icon.state ? 0 : 250)} style={{ position: 'absolute', right : 0,  padding : 10 }}>
									<Icon name={'plus'} size={16} style={{color : '#fff'}}/>
								</TouchableOpacity>
							</View>

							<TouchableOpacity onPress={this.send.bind(this)} disabled={!this.state.sendSw} style={{ backgroundColor : !this.state.sendSw ? '#efefef' : '#7EE9D1', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
								<Icon name={'paper-plane'} size={16} style={{color : '#fff'}}/>
							</TouchableOpacity>
						</View>
						{/* input end */}

					</KeyboardAvoidingView>
					{/* chat end */}
                    </TouchableWithoutFeedback >



					{/* bottom box */}
					<Animated.View style={{height : room.value, paddingHorizontal : 10}}>
						<ScrollView>

							<View style={{marginBottom : 0}}/>

							{room_list.map((item, i) =>
								<TouchableOpacity onPress={() => this.props.resetRoom(item.room_code)} style={{flexDirection: 'row', alignItems: 'center', marginBottom : 0, borderBottomWidth:1, borderColor: '#d0d0d0', }}>
									<View style={{position: 'absolute'}}>
										{
											item.len == 1 ?
											(<Image source = {{ uri: item.img_url }} style={{width : 50, height : 50, borderRadius : 50}} />)
											:
											(<View style={{width : 50, height : 50, borderRadius : 50, backgroundColor : '#7EE9D1', justifyContent : 'center', alignItems : 'center', marginBottom : 5}}>
												<Icon name={'users'} size={16} style={{color : '#fff'}}/>
											</View>)
										}

                                        {
                                            item.msgCnt != 0 ?
                                            (<View style={{position: 'absolute', backgroundColor: '#ed5565', width : 25, height : 25, alignItems: 'center', justifyContent : 'center', borderRadius : 50, left : 30, bottom : 30}}>
                                                <Text style={{fontSize : 13, color : '#fff', fontWeight : 'bold'}}>{item.msgCnt}</Text>
                                            </View>) : null
                                        }
									</View>
									<View style={{ padding : 15, textAlign : 'left', margin : 10,  marginLeft : 60, flex : 1}}>
										<Text numberOfLines={1} style={{ fontWeight : 'bold', fontSize : 16 }}>{item.len == 1 ? item.name : item.roomCnt}</Text>
										<Text numberOfLines={1} style={{width : '50%', color : '#b3b3b3'}}>{item.msg}</Text>
										<Text numberOfLines={1} style={{color : '#b3b3b3'}}>{item.date}</Text>
									</View>
								</TouchableOpacity>
							)}


							{/*
							<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginBottom : 0, borderBottomWidth:1, borderColor: '#d0d0d0', }}>
								<View style={{position: 'absolute'}}>
									<Image source = {{ uri: 'https://source.unsplash.com/QAB-WJcbgJk/60x60' }} style={{width : 50, height : 50, borderRadius : 50}} />

									<View style={{position: 'absolute', backgroundColor: '#ed5565', width : 25, height : 25, alignItems: 'center', justifyContent : 'center', borderRadius : 50, left : 30, bottom : 30}}>
										<Text style={{fontSize : 13, color : '#fff', fontWeight : 'bold'}}>1</Text>
									</View>
								</View>
								<View style={{ padding : 15, textAlign : 'left', margin : 10,  marginLeft : 60, flex : 1}}>
									<Text numberOfLines={1} style={{ fontWeight : 'bold', fontSize : 16 }}>친구1</Text>
									<Text numberOfLines={1} style={{width : '50%', color : '#b3b3b3'}}>msg</Text>
									<Text numberOfLines={1} style={{color : '#b3b3b3'}}>2020-07-16</Text>
								</View>
							</TouchableOpacity>

							<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginBottom : 0, borderBottomWidth:1, borderColor: '#d0d0d0', }}>
								<View style={{position: 'absolute'}}>
									<View style={{width : 50, height : 50, borderRadius : 50, backgroundColor : '#7EE9D1', justifyContent : 'center', alignItems : 'center', marginBottom : 5}}>
										<Icon name={'users'} size={16} style={{color : '#fff'}}/>
									</View>

									<View style={{position: 'absolute', backgroundColor: '#ed5565', width : 25, height : 25, alignItems: 'center', justifyContent : 'center', borderRadius : 50, left : 30, bottom : 30}}>
										<Text style={{fontSize : 13, color : '#fff', fontWeight : 'bold'}}>19</Text>
									</View>
								</View>
								<View style={{ padding : 15, textAlign : 'left', margin : 10,  marginLeft : 60, flex : 1}}>
									<Text numberOfLines={1} style={{ fontWeight : 'bold', fontSize : 16 }}>3명</Text>
									<Text numberOfLines={1} style={{width : '50%', color : '#b3b3b3'}}>msg</Text>
									<Text numberOfLines={1} style={{color : '#b3b3b3'}}>2020-07-16</Text>
								</View>
							</TouchableOpacity>

							*/}

							<TouchableOpacity onPress={() => this.props.resetRoom()} style={{flexDirection: 'row', justifyContent : 'center', alignItems: 'center', marginBottom : 0, borderBottomWidth:1, borderColor: '#d0d0d0', }}>
								<View style={{padding : 30}}>
									<Icon name={'plus'} size={60} style={{color : '#b3b3b3'}}/>
								</View>
							</TouchableOpacity>

							<View style={{marginBottom : 20}}/>

						</ScrollView>
					</Animated.View>
					{/* bottom box end */}


					{/* icon send box */}
					<Animated.View style={{height : icon.value, paddingHorizontal : 10}}>
						<ScrollView>

							<View style={{marginBottom : 0}}/>

							<TouchableOpacity onPress={() => Linking.openURL('https://www.google.com/intl/ko_ALL/drive/')} style={{flexDirection: 'row', justifyContent : 'center', alignItems: 'center', marginBottom : 0, borderBottomWidth:1, borderColor: '#d0d0d0', }}>
								<View style={{padding : 30, flexDirection: 'row', alignItems: 'center',}}>
									<Icon name={'paperclip'} size={60} style={{color : '#b3b3b3'}}/>
									<Text style={{fontSize : 16, margin : 15}}>파일 링크 올리기</Text>
								</View>
							</TouchableOpacity>

							{img_list.map((item, i) =>
								<View style={{flexDirection: 'row', justifyContent : 'center'}}>
									{item.map((d, i) => {
										if(d.type == 'i'){
											return (
												<TouchableOpacity onPress={() => this.send('emoticon', d.id)}>
													<Image source = {{ uri: d.base_code }} style={{width : scale(80), height : verticalScale(80), flex : 1, margin : moderateScale(10)}} />
												</TouchableOpacity>
											);
										}
									})}
								</View>
							)}


							<View style={{marginBottom : 20}}/>

						</ScrollView>
					</Animated.View>
					{/* icon send box end */}

				</View>
				{/* width 50% end */}


				{/* My */}
				<Animated.View style={{width : right.value, backgroundColor : '#efefef' }}>
					<Text style={{fontSize : 30, margin : 5, fontWeight : 'bold', }}>My</Text>
					<ScrollView>
						<View style={{paddingHorizontal : 15}}>

							<View style={{marginBottom : 20}}/>

							<TouchableOpacity onPress={()=>this.modal_update('typeA', img_list)} style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}}>
								<Image source = {{ uri: my_data.img_url }} style={{width : 100, height : 100, borderRadius : 50, marginBottom : 5}} />
							</TouchableOpacity>

							<TextInput style={{textAlign : 'center', color : '#000' }} value={my_name} onChangeText={(name) => this.props.setMyName(name)}/>

							<View style={{flexDirection : 'row', alignItems : 'center'}}>
								<Text style={{fontSize : 16, fontWeight : 'bold', margin : 5}}>Token</Text>
								<TouchableOpacity disabled={false} onPress={() => {Clipboard.setString(my_data.token); Platform.OS == 'android' ? ToastAndroid.show('복사되었습니다.', ToastAndroid.SHORT) : customAlert('복사되었습니다.')}} style={{ backgroundColor : false ? '#efefef' : '#7EE9D1', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
									<Icon name={'copy'} size={16} style={{color : '#fff'}}/>
								</TouchableOpacity>
								<TouchableOpacity disabled={false} onPress={this.share.bind(this)} style={{ backgroundColor : false ? '#efefef' : '#7EE9D1', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
									<Icon name={'share-alt'} size={16} style={{color : '#fff'}}/>
								</TouchableOpacity>
							</View>

							<View>
								<Text style={{fontSize : 16}}>{my_data.token}</Text>
							</View>

							<View style={{marginBottom : 20}}/>

                            <TouchableOpacity onPress={()=>this.modal_update('typeD', { pinType : 'reset', pinResult : (result, type) => this.props.pinCheckUpdate(result, type)})} style={{ flexDirection : 'row', alignItems : 'center', justifyContent:'flex-start'}}>
                                <CheckBox onPress={()=>this.modal_update('typeD',{ pinType : 'reset', pinResult : (result, type) => this.props.pinCheckUpdate(result, type)})} checked={this.props.view_lock} style={{left : 0}} color="#7EE9D1"/>
                                <View style={{marginLeft : 10}}>
                                    <Text>재시작하면 메시지 숨김</Text>
                                </View>
                            </TouchableOpacity>

						</View>

					</ScrollView>
				</Animated.View>
				{/* My end */}



			</View>

		);
	}

}
// 1개 50%, 2개 50%, 3개 33%, 4개 25%, 5개 20%
const styles = StyleSheet.create({
    container: {
        flex : 1,
		backgroundColor : '#f3f3f4',
		flexDirection: 'row',
    },
});


function mapStateToProps (state) {
    // mapStateToProps여기에 로그 넣으면 속도 저하 발생
    return {
        chat : state.ChatReducer,
        code : state.commonReducer.code,
        lock : state.commonReducer.lock,
        view_lock : state.commonReducer.view_lock,
    }
}

function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        getMyData: getMyData,
		editMyData : editMyData,
		setMyName : setMyName,
		creUser : creUser,
		getUserData : getUserData,
		creRoom : creRoom,
		getSelTokenList : getSelTokenList,
		getSelRoomCode : getSelRoomCode,
		getRoomList : getRoomList,
		resetRoom : resetRoom,
        getMsgList : getMsgList,
        updateMsg : updateMsg,
        getImgList : getImgList,
        myImgUpdate : myImgUpdate,
        userNameUpdate : userNameUpdate,
        removeRoomUser : removeRoomUser,
        readYes : readYes,
        pinCheckUpdate : pinCheckUpdate,
		userOsUpdate : userOsUpdate,
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
