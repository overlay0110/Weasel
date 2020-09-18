import { AppState, PushNotificationIOS } from 'react-native';
import PushNotification from 'react-native-push-notification';

const _registerLocalNotification = (option) => {
  PushNotification.setApplicationIconBadgeNumber(0);
  //PushNotification.cancelAllLocalNotifications();

  // Must be outside of any component LifeCycle (such as `componentDidMount`).
  PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
          console.log("TOKEN:", token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
          console.log("NOTIFICATION:", notification);

          // process the notification

          // (required) Called when a remote is received or opened, or local notification is opened
          notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
          console.log("ACTION:", notification.action);
          console.log("NOTIFICATION:", notification);

          // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function(err) {
          console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
          alert: true,
          badge: true,
          sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
      * (optional) default: true
      * - Specified if permissions (ios) and token (android and ios) will requested or not,
      * - if not, you must call PushNotificationsHandler.requestPermissions() later
      * - if you are not using remote notification or do not have Firebase installed, use this:
      *     requestPermissions: Platform.OS === 'ios'
      */
      requestPermissions: true,
  });

  PushNotification.localNotificationSchedule({
    /* Android Only Properties */
    vibrate: true,
    vibration: 300,
    priority: 'hight',
    visibility: 'public',
    importance: 'hight',
	largeIcon : 'app_icon',
	smallIcon : 'notifi_icon',

    /* iOS and Android properties */
	title : option.title,
    message : option.msg, // (required)
    playSound: false,
    number: 0,

    date: new Date(Date.now() + 2 * 1000),
    datas : {test : 'test'}
  });
};
export default {
    register: async (option) => {
        PushNotification.configure({
            onNotification: function(notification) {
                notification.finish(PushNotificationIOS.FetchResult.NoData);
            },
            popInitialNotification: true,
        });

        _registerLocalNotification(option);
    },
};
