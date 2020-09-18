import React, {Component} from 'react';
import { View, Text, Button } from 'react-native';
import { increment, decrement } from '../../reducers/baseReducer';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Base extends Component {
	constructor(props){
		super(props);
		this.state = {
		}
	}

	componentDidMount(){
	}

	componentWillUnmount() {
		// this.didFocus.remove();
	}

	render() {
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
		state: state.countReducer
	};
}

// Actions을 props로 변환
function matchDispatchToProps(dispatch){
	return bindActionCreators({
		increment: increment,
		decrement: decrement
	}, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(Base);
