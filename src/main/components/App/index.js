import { View, Text } from 'react-native';
import Chat from './Chat';
import QrScan from './QrScan';
import List from './List';
import Main from "./Main";
import Screen from "./Screen";
import WebView from "./WebView";

router = {
	Main: { screen: Main },
    Chat: { screen : Chat,  navigationOptions : {headerShown: false} },
    QrScan: { screen : QrScan },
    List: { screen : List },
	Screen : { screen : Screen },
	WebView : { screen : WebView, navigationOptions : {headerShown: false} },
}

export default router;
