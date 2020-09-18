import React, {Component} from 'react';
import { Platform, WebView, StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, TextInput, Clipboard, ToastAndroid, FlatList } from 'react-native';
import { Radio, Toast, Root } from "native-base";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Modal from "react-native-modal";
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { share, sha256, getCode2, getLock, pinCheckVlaue } from './func';
import { select,insert,update,del } from './funcDB';
import { PinKeyboard, PinInput } from 'react-native-awesome-pin';

export default class CustomModal extends Component {

    constructor(props){
        super(props);
        this.state = {
            toToken : '',
            selOS : 'android',
            typeCname : '',
            edit : 'no',
            pinValue : '',
            closeFun : () => null,
            closein : 'no',
            pinType : 'reset',
            resultFun : () => null,
            os : 'android',
        }
    }

    componentDidMount(){
    }

    componentWillUnmount() {
    }

    resetState(){
        this.setState({
            toToken : '',
            selOS : 'android',
        });
    }

    async paste(){
        let pasteValue = await Clipboard.getString();
        this.setState({ toToken : pasteValue });
    }

    removeEvent(setting, token){
        if (this.exitApp == undefined || !this.exitApp) {
			Toast.show({text: '한번 더 누르면 퇴장됩니다.', type : 'danger'});
			this.exitApp = true;
			this.timeout = setTimeout(
				() => {
					this.exitApp = false;
				},
				2000    // 2초
			);
		} else {
			setting.removePress(token);
		}
		return true;
    }

    async keyDown(key, setting){
        // Key pressed
        this.keyboard.clearError();

        let {pinValue} = this.state;

        if(key == null){
            return;
        }

        if(key == 'back'){
            pinValue = pinValue.slice(0,-1);
        }
        else{
            pinValue = this.state.pinValue+key;
        }

        if(pinValue.length == 4){
            let lock = await getLock();
            let num = await getCode2('num');
            this.setState({pinValue : ''});

            let pinType = setting.typeDdatas.pinType;
            let auth_code = await select('auth', '*', 'id=?', [num]);
            auth_code = auth_code[0]['F5'];

            if(pinType == 'reset'){
                if(lock){
                    if(auth_code != sha256(pinValue)){
                        this.keyboard.throwError('틀렸습니다. 다시 확인해주세요.');
                    }
                    else{
                        await update('auth', {F5 : pinCheckVlaue() }, 'id=?', [num]);
                        setting.typeDdatas.pinResult(true, pinType);
                        setting.closePress();
                    }
                }
                else{
                    await update('auth', {F5 : sha256(pinValue)}, 'id=?', [num]);
                    setting.typeDdatas.pinResult(false, pinType);
                    setting.closePress();
                }
            }
            else if(pinType == 'check'){
                if(auth_code != sha256(pinValue)){
                    this.keyboard.throwError('틀렸습니다. 다시 확인해주세요.');
                }
                else{
                    setting.typeDdatas.pinResult(true, pinType);
                    setting.closePress();
                }
            }

            return;
        }

        this.setState({pinValue : pinValue});
    }

    render() {
        // typeA, typeB, typeC ...
        let {option, type} = this.props;
        let {edit, closein} = this.state;

        if(type == undefined){
            type = 'typeA';
        }

        let setting = {
            closePress : () => null,
            crePress : ({}) => null,
            removePress : () => null,
            isModalVisible : false,
            buttons : [
                {title : "닫기", onPress : () => null},
            ],
            isBackdropPress : true,
            typeCdatas : {img : 'https://source.unsplash.com/QAB-WJcbgJk/60x60', name : '', token : '토큰을 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.'},
            typeAdatas : [],
            typeDdatas : [],
            imgUpdate : () => null,
            userNamePress : () => null,
        }

        for(var key in option){
            setting[key] = option[key];
        }

        if(type == 'typeC' && edit == 'no'){
            this.setState({ typeCname : setting.typeCdatas.name, edit : 'yes', os : setting.typeCdatas.os });
        }

        let para = {onBackButtonPress : setting.closePress, onBackdropPress : setting.isBackdropPress ? setting.closePress : () => null };

        if(type == 'typeA'){
            return (
                <Modal isVisible={setting.isModalVisible} style={styles.modal} {...para}>
                    <View style={styles.mContent}>
                        <ScrollView>
                            <View style={{marginBottom : 10}} />

                            <FlatList
                                data={setting.typeAdatas}
                                renderItem={ ({item}) => {
                                    return (
                                        <View style={{flexDirection: 'row', justifyContent : 'center'}}>
                                            {item.map((d, i) => {
                                                if(d.type == 'p'){
                                                    return (
                                                        <TouchableOpacity onPress={() => setting.imgUpdate(d.id)}>
                                                            <Image source = {{ uri: d.base_code }} style={{width : scale(70), height : verticalScale(70), flex : 1, margin : moderateScale(5)}} />
                                                        </TouchableOpacity>
                                                    );
                                                }
                                            })}
                                        </View>
                                    );
                                }}
                                keyExtractor={(item, index) => index.toString() }
                            />

                            <View style={{marginBottom : 10}} />

                        </ScrollView>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent : 'center'}}>
                        <TouchableOpacity onPress={() => {setting.closePress(); this.resetState();}} style={{flex : 1, justifyContent : 'center', backgroundColor : '#7EE9D1', alignItems : 'center', height : 50,}}>
                            <Text style={{color : '#fff', fontSize : 16, fontWeight : 'bold'}}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            );
        }
        else if(type == 'typeB'){
            return (
                <Modal isVisible={setting.isModalVisible} style={styles.modal} {...para}>

                    <View style={{flexDirection: 'row', justifyContent : 'center'}}>
                        <View style={{flex : 1, justifyContent : 'center', backgroundColor : '#7EE9D1', alignItems : 'center', height : 50,}}>
                            <Text style={{color : '#fff', fontSize : 16, fontWeight : 'bold'}}>상대 등록</Text>
                        </View>
                    </View>
                    <View style={styles.mContent}>
                        <ScrollView>

                            <View style={{flexDirection : 'row', alignItems : 'center'}}>
								<Text style={{fontSize : 16, fontWeight : 'bold', margin : 5}}>Token</Text>
								<TouchableOpacity onPress={this.paste.bind(this)} disabled={false} style={{ backgroundColor : false ? '#efefef' : '#7EE9D1', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
									<Icon name={'paste'} size={16} style={{color : '#fff'}}/>
								</TouchableOpacity>
							</View>

							<View style={{marginBottom : 20, }}>
                                <TextInput style={{fontSize : 16, backgroundColor : '#f3f4f4', color : '#000' }} multiline={true} value={this.state.toToken} onChangeText={(toToken) => this.setState({toToken})}/>
							</View>

                            <View style={{flexDirection : 'row', alignItems : 'center'}}>
                                <TouchableOpacity style={{flexDirection : 'row', alignItems : 'center', flex : 1}} onPress={() => this.setState({selOS : 'android'})}>
                                    <Radio selected={this.state.selOS == 'android' ? true : false} selectedColor={'#7EE9D1'} onPress={() => this.setState({selOS : 'android'})} />
                                    <Text style={{marginLeft : 10}}>Android</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={{flexDirection : 'row', alignItems : 'center', flex : 1}} onPress={() => this.setState({selOS : 'ios'})}>
                                    <Radio selected={this.state.selOS == 'ios' ? true : false} selectedColor={'#7EE9D1'} onPress={() => this.setState({selOS : 'ios'})} />
                                    <Text style={{marginLeft : 10}}>IOS</Text>
                                </TouchableOpacity>
                            </View>


                        </ScrollView>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent : 'center'}}>
                        <TouchableOpacity onPress={() => setting.crePress({token : this.state.toToken, os : this.state.selOS})} style={{flex : 1, justifyContent : 'center', backgroundColor : '#333333', alignItems : 'center', height : 50,}}>
                            <Text style={{color : '#fff', fontSize : 16, fontWeight : 'bold'}}>등록</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => {setting.closePress(); this.resetState();}} style={{flex : 1, justifyContent : 'center', backgroundColor : '#7EE9D1', alignItems : 'center', height : 50,}}>
                            <Text style={{color : '#fff', fontSize : 16, fontWeight : 'bold'}}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            );
        }
        else if(type == 'typeC'){
            return (
                <Modal isVisible={setting.isModalVisible} style={styles.modal} {...para}>

                    <View style={{flexDirection: 'row', justifyContent : 'center'}}>
                        <View style={{flex : 1, justifyContent : 'center', backgroundColor : '#7EE9D1', alignItems : 'center', height : 50,}}>
                            <Text style={{color : '#fff', fontSize : 16, fontWeight : 'bold'}}>상대 정보</Text>
                        </View>
                    </View>

                    <View style={styles.mContent}>
                        <Root>
                            <ScrollView>
                                <View style={{marginBottom : 10}} />

                                <View style={{ margin : 10, justifyContent : 'center', alignItems : 'center'}}>
    								<Image source = {{ uri: setting.typeCdatas.img }} style={{width : 100, height : 100, borderRadius : 50, marginBottom : 5}} />

                                    <View style={{flexDirection : 'row', alignItems : 'center'}}>
                                        <TextInput style={{textAlign : 'center', color : '#000'}} value={this.state.typeCname} onChangeText={(name) => {this.setState({ typeCname : name }); setting.userNamePress(name, setting.typeCdatas.token); }}/>
                                        <TouchableOpacity onPress={() => this.removeEvent(setting, setting.typeCdatas.token)}  disabled={false} style={{ backgroundColor : false ? '#efefef' : '#ed5565', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
        									<Icon name={'minus'} size={16} style={{color : '#fff'}}/>
        								</TouchableOpacity>
                                    </View>
    							</View>

    							<View style={{flexDirection : 'row', alignItems : 'center'}}>
    								<Text style={{fontSize : 16, fontWeight : 'bold', margin : 5}}>Token</Text>
    								<TouchableOpacity disabled={false} onPress={() => {Clipboard.setString(setting.typeCdatas.token); Platform.OS == 'android' ? ToastAndroid.show('복사되었습니다.', ToastAndroid.SHORT) : customAlert('복사되었습니다.')}} style={{ backgroundColor : false ? '#efefef' : '#7EE9D1', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
    									<Icon name={'copy'} size={16} style={{color : '#fff'}}/>
    								</TouchableOpacity>
    								<TouchableOpacity disabled={false} onPress={() => share(setting.typeCdatas.token)} style={{ backgroundColor : false ? '#efefef' : '#7EE9D1', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
    									<Icon name={'share-alt'} size={16} style={{color : '#fff'}}/>
    								</TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setting.userOsPress(this.state.os == 'android' ? 'ios' : 'android', setting.typeCdatas.token); this.setState({ os : this.state.os == 'android' ? 'ios' : 'android'}); } } style={{ backgroundColor : false ? '#efefef' : '#7EE9D1', alignItems: 'center', justifyContent : 'center', margin : 5, borderRadius : 50, width : 40, height : 40 }}>
                                        <Icon name={this.state.os == 'android' ? 'android' : 'apple'} size={16} style={{color : '#fff'}}/>
                                    </TouchableOpacity>
    							</View>

    							<View>
    								<Text style={{fontSize : 16}}>{setting.typeCdatas.token}</Text>
    							</View>

                                <View style={{marginBottom : 10}} />

                            </ScrollView>
                        </Root>
                    </View>

                    <View style={{flexDirection: 'row', justifyContent : 'center'}}>
                        <TouchableOpacity onPress={() => {setting.closePress(); this.resetState();}} style={{flex : 1, justifyContent : 'center', backgroundColor : '#7EE9D1', alignItems : 'center', height : 50,}}>
                            <Text style={{color : '#fff', fontSize : 16, fontWeight : 'bold'}}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            );
        }
        else if(type == 'typeD'){
            return (
                <Modal isVisible={setting.isModalVisible} style={styles.modal} {...para}>
                    <View style={[styles.mContent,{padding : 0, backgroundColor : '#7EE9D1'}]}>
                        <View style={{backgroundColor : '#7EE9D1', alignItems : 'center'}}>
                            <PinInput
                                onRef={ref => (this.pins = ref)}
                                numberOfPins={4}
                                numberOfPinsActive={this.state.pinValue.length}
                            />
                        </View>
                        <PinKeyboard
                            onRef={ref => (this.keyboard = ref)}
                            keyDown={(key) => this.keyDown(key, setting)}
                        />
                    </View>

                    <View style={{flexDirection: 'row', justifyContent : 'center'}}>
                        <TouchableOpacity onPress={() => {setting.closePress(); this.resetState();}} style={{flex : 1, justifyContent : 'center', backgroundColor : '#7EE9D1', alignItems : 'center', height : 50,}}>
                            <Text style={{color : '#fff', fontSize : 16, fontWeight : 'bold'}}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            );

        }

    }
}

const styles = StyleSheet.create({
    modal: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    mContent: {
        width:'100%',
        height : '50%',
        backgroundColor: 'white',
        justifyContent: 'center',
        // alignItems: 'center',
        padding : 10,
        alignItems: 'stretch',
    },
});
