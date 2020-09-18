import React, {Component} from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { increment, decrement } from '../../reducers/baseReducer';
import { getLocation } from '../../reducers/locationReducers';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {insert, select, del} from '../../import/funcDB';
import { getConfigLog, print } from '../../import/func';
import strings from '../../assets/locale';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

class Screen extends Component {
	constructor(props){
		super(props);
		this.state = {
		}
		this.start();
		
	}

	componentDidMount(){
	}

	componentWillUnmount() {
		// this.didFocus.remove();
	}

	async start(){
		print(strings.password_input);
		this.props.getLocation();
		
		//let test = await getConfigLog();
		//await insert('configLog',{ json_configs : 'test123456789', date : '18' });
		//let datas = await select('configLog','*');
	}

	render() {
		print(this.props.loca);
		return (
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<Text>Screen.js {this.props.state.count}</Text>
				<Button title="Increment" onPress={() => this.props.increment()}/>
				<Button title="Decrement" onPress={() => this.props.decrement()}/>
			</View>
		);
	}
}

// Reducer 데이터를 props로 변환
function mapStateToProps(state){
	return {
		state: state.countReducer,
		loca : state.locationReducers,
	};
}

// Actions을 props로 변환
function matchDispatchToProps(dispatch){
	return bindActionCreators({
		increment: increment,
		decrement: decrement,
		getLocation : getLocation,
	}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(Screen);
