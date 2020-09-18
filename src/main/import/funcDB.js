import SQLite from 'react-native-sqlite-storage';
import { Platform } from 'react-native';
import { sha256, print, getNow, randomRange, alphabet, getCode2, aesEncode, aesDecode } from './func';
import firebase from 'react-native-firebase';
import LocalNotification from './LocalNotification';

function getDb(){
    const db = SQLite.openDatabase(
        {
            name: 'database.db',
            location: 'default',
            createFromLocation: '~www/database.db',
        },
        () => {},
        error => {
            print(error);
        }
    );

    return db;
}

export function dbClose(){
    let db = getDb();
    db.close();
}

export function select(tableName, selField, where, datas = []){
    // let datas = await select('screenLock','*','rowid=? and access_key=?',[3,'123456in']);
    let result = [];
    let db = getDb();

    if(tableName == undefined || selField == undefined){
        return new Promise(function (resolve, reject) {
            resolve(result);
        });
    }

    let sql = 'select '+selField+' from '+tableName;

    if(where != undefined){
        sql+=' where '+where;
    }

    return new Promise(function (resolve, reject) {
        db.transaction(tx => {
            tx.executeSql(sql, datas, (tx, results) => {
                const rows = results.rows;
                let users = [];

                for (let i = 0; i < rows.length; i++) {
                    users.push({
                        ...rows.item(i),
                    });
                }

                result = users;
                resolve(result);

            });
        },
        (err) => {
            print(err);
        });
    });
}

export function insert(tableName, setDatas){
    // await insert('screenLock',{rowid : 6, i : 'input', p : 'password', access_key : 'access_key123'});
    let db = getDb();
    let sql = 'insert into '+tableName;

    let keys = Object.keys(setDatas);
    let values = Object.values(setDatas);

    sql += '(';
    for(var i=0;i<keys.length;i++){
        sql+=keys[i];
        if( (i+1) != keys.length ){
            sql+=',';
        }
    }
    sql += ') values (';

    for(var i=0;i<values.length;i++){
        sql+='?';
        if( (i+1) != values.length ){
            sql+=',';
        }
    }
    sql+=');';

    return new Promise(function (resolve, reject) {
        db.transaction(tx => {
            tx.executeSql(sql, values, (tx, results) => {
                print('insert',results);
                resolve(true);
            });
        }, (err) => {
            print(err);
        });
    });
}

export function update(tableName, setDatas, where, datas){
    // await update('screenLock',{access_key : 'zap'},'rowid=?',[6]);
    let db = getDb();
    let sql = 'update '+tableName+' set ';
    let i = 1;

    let keys=Object.keys(setDatas);
    let values=Object.values(setDatas);

    for(var key in setDatas){
        sql += key+'=?';
        if(i != Object.keys(setDatas).length){
            sql+=',';
        }
        i++;
    }

    if(where != undefined){
        sql+=' where '+where;

        for(i=0;i<datas.length;i++){
            values.push(datas[i]);
        }
    }

    print(sql);

    return new Promise(function (resolve, reject) {
        db.transaction(tx => {
            tx.executeSql(sql, values, (tx, results) => {
                print('update',results);
                resolve(true);
            });
        }, (err) => {
            print(err);
        });
    });
}

export function del(tableName, where, datas){
    // await del('screenLock','rowid=?',[6]);
    let db = getDb();
    let sql = 'delete from '+tableName;

    if(where != undefined){
        sql+=' where '+where;
    }

    return new Promise(function (resolve, reject) {
        db.transaction(tx => {
            tx.executeSql(sql, datas, (tx, results) => {
                print('del',results);
                resolve(true);
            });
        }, (err) => {
            print(err);
        });
    });
}

export async function userSet(setting){
    let datas = await select('user','*','state=?',['my']);
    let code = await getCode2();

    if(datas.length == 0){
        let img = await select('imgs', 'id', 'type=?', ['p'] );
        // console.log('img : ', img);'id='+randomRange(1,9)

        await insert('user',{token : setting.token, name : aesEncode('족제비'+alphabet(), code), img : img[randomRange(0, (img.length-1) )]["id"], date : getNow(), state : 'my', os : Platform.OS});
    }
    else{
        await update('user', {token : setting.token}, 'state=?',['my']);
    }
}

export async function resMsg(data, reStart = () => null){
    let check = await select('room', '*', 'room_code=?', [data.room_code]);
    const fcmToken = await firebase.messaging().getToken();

    let users = JSON.parse(data.users);
    let user_check;
    let name_check;
    let fcm_title = data.title;
    let code = await getCode2();

    for(var i=0;i<users.length;i++){
        user_check = await select('user', '*', 'token=?', [ users[i].token ]);

        if(user_check.length == 0){
            await insert('user',{token : users[i].token, name : aesEncode(users[i].name, code), img : users[i].img, date : getNow(), state : 'user', edit : 'no', os : users[i].os});
        }
        else{
            let updateData = {};
            if(user_check[0]['edit'] != 'yes'){
                updateData['name'] = aesEncode(users[i].name, code);
            }

            updateData['img'] = users[i].img;
            await update('user',updateData, 'token=? and state="user"', [ users[i].token ]);
        }
    }

    if(check.length == 0){
        let tokens = JSON.parse(data.tokens);
        tokens = tokens.filter( token => token !== fcmToken );

        await insert('room',{room_code : data.room_code, tokens : tokens.join(','), date : getNow()});
    }

    name_check = await select('user', '*', 'token=?', [ data.toToken ]);
    if(name_check.length != 0){
        if(name_check[0]['edit'] == 'yes'){
            fcm_title = aesDecode(name_check[0]['name'], code);
        }
    }

    await insert('msg',{room_code :data.room_code, msg : aesEncode(data.msg, code), token : data.toToken, read : 'no', state : 'user', date : getNow(), type : data.msgType});
    if(Platform.OS == 'android'){
        LocalNotification.register({title : fcm_title, msg : data.body});
    }
    reStart();
}
