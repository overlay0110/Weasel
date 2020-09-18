import React, {Component} from 'react';
import { View, Text, Button, BackHandler, ToastAndroid, StatusBar, Platform } from 'react-native';
import { urlChange } from '../../reducers/webViewReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { WebView } from 'react-native-webview';
import { print } from '../../import/func';
import RNExitApp from 'react-native-exit-app';
import strings from '../../assets/locale';
import { getStatusBarHeight } from "react-native-status-bar-height";
import { isIphoneX, getBottomSpace } from "react-native-iphone-x-helper";

// 아이폰 상단바 높이 설정
const Height = () => {
    if (isIphoneX()) {
        return getBottomSpace();
    } else {
        return getStatusBarHeight(true);
    }
};

const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? Height() : 0;
const STATUS_BAR_COLOR = "#f3f3f4";
// const STATUS_BAR_COLOR = "#000000";

class Screen extends Component {
    constructor(props){
		super(props);
		this.state = {
		}
		this.didFocus = props.navigation.addListener("didFocus", payload => {
			BackHandler.addEventListener("hardwareBackPress", this.onBack);
		});
        var webview = null;
	}

    componentDidMount(){
		this.willBlur = this.props.navigation.addListener("willBlur", payload =>
			BackHandler.removeEventListener("hardwareBackPress", this.onBack),
		);
	}

	componentWillUnmount() {
		this.exitApp = false;
		this.didFocus.remove();
		this.willBlur.remove();
		BackHandler.removeEventListener("hardwareBackPress", this.onBack);
	}

    onBack = () => {
        if(this.props.state.access_url == this.props.configLog.URL){
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
        else{
            this.webview && this.webview.goBack();
            return true;
        }
	}

    render() {
        //print(this.props.state.access_url);
		//print(this.props.configLog)
		
		let iosHeader = null;
		let iosFooter = null;

		if(Platform.OS == 'ios'){
			iosHeader = (
				<View style={{width: "100%",height: STATUS_BAR_HEIGHT,backgroundColor:STATUS_BAR_COLOR}}>
					<StatusBar backgroundColor={STATUS_BAR_COLOR} barStyle={'dark-content'}/>
				</View>
			);

			if (isIphoneX()) {
				iosFooter = (
					<View style={{width:"100%",height:25,backgroundColor:STATUS_BAR_COLOR}}/>
				);
			}			
		}

        webViewSet = {
            ref : r => {this.webview = r},
            source : { uri: this.props.configLog.URL },
            onNavigationStateChange : this.props.urlChange,
        }
        return (
			<View style={{flex:1}}>
				{iosHeader}
				<WebView {...webViewSet} />
				{iosFooter}
			</View>
        );
    }
}

// Reducer 데이터를 props로 변환
function mapStateToProps(state){
    return {
        state: state.webViewReducer,
        configLog : state.commonReducer.configLogInfo,
    };
}

// Actions을 props로 변환
function matchDispatchToProps(dispatch){
    return bindActionCreators({
        urlChange : urlChange,
    }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(Screen);
