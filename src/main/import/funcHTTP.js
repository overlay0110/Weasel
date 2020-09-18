import { Platform, Alert, NativeModules, Dimensions } from 'react-native';
import {print, getConfig} from "./func";

export function textToImg(para){
    let baseUrl = 'http://api.img4me.com/?';
    let callUrl = '';

    if(para == undefined || para == null){
        para = {
            text : 'Image Testing', // %0A : 엔터
            font : 'arial',
            fcolor : '000000',
            size : '15',
            bcolor : 'FFFFFF',
            type : 'png',
        }
    }

    var result = '';
    for( var key in para ) {
        result += key + '=' + para[key] + '&';
    }

    callUrl = baseUrl + result;

    if(Platform.OS == 'ios'){
        callUrl = encodeURI(baseUrl + result).replace(/%250A/g, "%0A");
    }

    return new Promise(resolve => {
        fetch(callUrl)
        .then(res => res.text())
        .then(res => {
            print('textToImg', res);
            resolve({catch : false, error : false, res : res });
        })
        .catch(error => {
            print(error);
            resolve({catch : true, error : true, res : '', });
        });
    });
}

export function callApi(url, para){
    print('para : ', para);

    return fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(para),
    })
    .then((response) => response.json());
}

export function qrRead(response){
	return new Promise(function (resolve, reject) {
		let body = new FormData();

		let para = {uri: response.uri,name: 'file.png', filename : Platform.OS != 'ios' ? response.fileName : response.name, type: response.type};
		// para = {uri: response.base64,name: 'file.png', filename : response.name, type: response.type};
		print(para);

		body.append('file', para);
		body.append('Content-Type', 'image/png');

		fetch('http://api.qrserver.com/v1/read-qr-code/',{ method: 'POST',headers:{
                "Content-Type": "multipart/form-data",
                "otherHeader": "foo",
        } , body :body} )
		.then((res) => res.json())
		.then(json => resolve(json) )
		.catch((e) => { print('qrRead_Error',e); resolve('error');});
	});
}

export function callConfig(){
    return new Promise(resolve => {
		print('config url ', getConfig().CONFIG_URL + getConfig().CONFIG_FILE_NAME)
        fetch(getConfig().CONFIG_URL + getConfig().CONFIG_FILE_NAME)
        .then((response) => response.json())
        .then( json => {
            print('_callConfig then', json);
            // resolve(json);
            resolve({catch : false, error : '', res : json});
        })
        .catch((error) => {
            print('_callConfig catch', error);
            // resolve(config);
            resolve({catch : true, error : error, res : [] });
        });
    });
}

export function sendFcm(option, serverKey){

    let setting = {
        registration_ids : ['cMHEHJliRROydxofLZIkq1:APA91bFkn-4wmYPoBNKXMLsSEvsuZWYJM-GO9iUXKhRiw98tKZQrL7EabGrnKq3Z5KsVQ-6f_eI2cVTyjp_PZNQ2TGorsvDd-mPjwQLvAZbBlH0Z4Xo9wLWsDtJlhS9rqCI8eR0mQKs8'],
        data : {title : 'mobileFCM', body : 'send test !!!'},
    };

    for(var key in option){
        setting[key] = option[key];
    }

    if(setting.data.os == 'ios'){
        sendNotification(option, serverKey)
    }

    return new Promise(resolve => {
        fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Authorization': 'key='+serverKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(setting),
        })
        .then((response) => response.text())
        .then( json => {
            print('sendFcm then', json);
            // resolve(json);
            resolve({catch : false, error : '', res : json});
        });
    });
}

export function sendNotification(option, serverKey){

    let setting = {
        registration_ids : ['cMHEHJliRROydxofLZIkq1:APA91bFkn-4wmYPoBNKXMLsSEvsuZWYJM-GO9iUXKhRiw98tKZQrL7EabGrnKq3Z5KsVQ-6f_eI2cVTyjp_PZNQ2TGorsvDd-mPjwQLvAZbBlH0Z4Xo9wLWsDtJlhS9rqCI8eR0mQKs8'],
        data : {title : 'mobileFCM', body : 'send test !!!'},
    };

    for(var key in option){
        setting[key] = option[key];
    }

    setting.notification = {
        title : setting.data.title,
        body : setting.data.body,
        badge : 0,
        sount : "default",
    }

    setting.priority = "high";

    delete setting.data;

    return new Promise(resolve => {
        fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
                'Authorization': 'key='+serverKey,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(setting),
        })
        .then((response) => response.text())
        .then( json => {
            print('sendNotification then', json);
            // resolve(json);
            resolve({catch : false, error : '', res : json});
        });
    });
}
