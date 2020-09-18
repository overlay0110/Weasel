import firebase from 'react-native-firebase';
import LocalNotification from './src/main/import/LocalNotification';
import PushNotification from 'react-native-push-notification';
import {print, actionAlert, getConfig, getNow} from './src/main/import/func';
import {select, insert, update, resMsg} from './src/main/import/funcDB';

export default async (message) => {
    // handle your message
    // you can't see this message, because debugger may off when app closed
    // but you can use react native code like fetch, etc ...
    print('bgMessage ', message);

    resMsg(message.data);

    return Promise.resolve();
}
