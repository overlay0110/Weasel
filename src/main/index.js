import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import App from './components/App';
import Lock from './components/Lock';
import LayoutHeader from './import/header';
import { View, Text } from 'react-native';

const AppNavigator = createStackNavigator(
	{
		...App,
        ...Lock,
	},
	{
		initialRouteName: 'Load',
		//headerMode: 'none',

	}
);

export default createAppContainer(AppNavigator);
