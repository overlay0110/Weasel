import React, {Component} from 'react';
import { View, Text, Button, ToastAndroid, BackHandler } from 'react-native';
import strings from '../../assets/locale';
import RNExitApp from 'react-native-exit-app';

export default class Main extends Component {
	constructor(props){
		super(props);
		this.state = {
		}
		this.didFocus = props.navigation.addListener("didFocus", payload => {
			BackHandler.addEventListener("hardwareBackPress", this.onBack);
		});
	}

	componentDidMount(){
		this.willBlur = this.props.navigation.addListener("willBlur", payload =>
			BackHandler.removeEventListener("hardwareBackPress", this.onBack),
		);
	}

	componentWillUnmount() {
		// this.didFocus.remove();
		this.exitApp = false;
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

	render() {
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Text>Main.js</Text>
                <Button title="Chat" onPress={ () => this.props.navigation.navigate("Chat") } />
                <Button title="QrScan" onPress={ () => this.props.navigation.navigate("QrScan") } />
                <Button title="List" onPress={ () => this.props.navigation.navigate("List") } />
				<Button title="WebView" onPress={() => this.props.navigation.navigate('WebView')}/>
				<Button title="Screen"  onPress={() => this.props.navigation.navigate('Screen')} />
			</View>
		);
	}
}
