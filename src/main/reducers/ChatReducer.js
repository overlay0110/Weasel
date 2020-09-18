import {select, insert, update, del} from '../import/funcDB';
import {getNow, alphabet, randomRange, customAlert, getTimestamp, sha256, array_chunk, aesEncode, aesDecode, pinCheckVlaue, getCode2, print} from '../import/func';
import {updateLock, setViewLock} from './commonReducer';

// Default State
const initialState = {
    count: 0,
    my_data : [{
        date : '',
        img : 'https://source.unsplash.com/QAB-WJcbgJk/60x60',
        name : '',
        token : '토큰을 불러오는데 실패했습니다. 종료 후 다시 시도해주세요.',
    }],
    user_data : [],
    my_name : '',
    sel_room_code : 'None',
    sel_room_token_list : [],
    room_list : [],
    msg_list : [],
    img_list : [],
};
// 'https://source.unsplash.com/QAB-WJcbgJk/60x60'
// Actions
export const SET_MY_DATA = "SET_MY_DATA";
export const SET_MY_NAME = "SET_MY_NAME";
export const SET_USER_DATA = "SET_USER_DATA";
export const SET_ROOM_CODE = "SET_ROOM_CODE";
export const SET_TOKEN_LIST = "SET_TOKEN_LIST";
export const SET_ROOM_LIST = "SET_ROOM_LIST";
export const SET_MSG_LIST = "SET_MSG_LIST";
export const SET_IMG_LIST = "SET_IMG_LIST";

// Action Functions
export function setImgList(data){
    return {
        type : SET_IMG_LIST,
        data : data,
    };
}

export function setMsgList(data){
    return {
        type : SET_MSG_LIST,
        data : data,
    };
}

export function setRoomList(data){
    return {
        type : SET_ROOM_LIST,
        data : data,
    };
}

export function setTokenList(token_list){
    return {
        type : SET_TOKEN_LIST,
        token_list : token_list,
    };
}

export function setMyData(data){
    return {
        type : SET_MY_DATA,
        data : data,
    };
}

export function setMyName(name){
    editMyData('name', name);
    return {
        type : SET_MY_NAME,
        name : name,
    }
}

export function setUserData(data){
    return {
        type : SET_USER_DATA,
        data : data,
    };
}

export function setRoomCode(code){
    return {
        type : SET_ROOM_CODE,
        code : code,
    }
}

export function editMyData(key, value){
    return async (dispatch, getState) => {
        let state = getState();
        const {code} = state.commonReducer;

        if(key == 'name'){
            value = aesEncode(value, code);
        }
        update('user',{ [key] : value},'state=?',['my']);
    };

}

export function creUser(token, os, close = () => null){
    return async (dispatch, getState) => {
        let state = getState();
        // const {user_data} = state.ChatReducer;
        const {code, lock} = state.commonReducer;

        let tokenCheck = await select('user', '*');

        for(var i=0;i<tokenCheck.length;i++){
            if(tokenCheck[i].token == token){
                // close();
                customAlert('이미 등록된 토큰입니다.');
                return;
            }
        }

        let img = await select('imgs', 'id', 'type=?', ['p'] );
        await insert('user',{token : token, name : aesEncode(token,code), img : img[randomRange(0, (img.length-1) )]["id"], date : getNow(), state : 'user', os : os, edit : 'no'});
        close();
        dispatch(patchData());
    };
}

export function getMyData(){
    return async (dispatch, getState) => {
        let state = getState();
        const {code, lock} = state.commonReducer;

        let res = await select('user', '*', 'state=?',['my']);

        for(var i=0;i<res.length;i++){
            res[i]['img_url'] = '';

            let img_url = await select('imgs', 'base_code', 'id=?', [ res[i]['img'] ] );
            if(img_url.length != 0){
                res[i]['img_url'] = img_url[0]['base_code'];
            }

            res[i]['name'] = aesDecode(res[i]['name'], code, lock);
        }

        dispatch(setMyData(res));
        dispatch(setMyName(res[0]['name']));
    };
}

export function getSelRoomCode(){
    return async (dispatch) => {
        let check = await select('sel_room', 'room_code', 'id=?',[1]);
        dispatch(setRoomCode(check[0]['room_code']));
    };
}

export function updateSelRoomCode(value){
    return async (dispatch) => {
        await update('sel_room',{ room_code : value },'id=?',[1]);
        dispatch(patchData());
    };
}

export function getUserData(search = ''){
    return async (dispatch, getState) => {
        let state = getState();
        const {code, lock} = state.commonReducer;

        let where = 'state=?';
        let where_list = ['user'];

        if(search.trim().length > 0){
            where = `state=? and name like "%${search}%"`;
            where_list = ['user'];
        }

        let res = await select('user', '*', where, where_list);

        for(var i=0;i<res.length;i++){
            res[i]['img_url'] = '';

            let img_url = await select('imgs', 'base_code', 'id=?', [ res[i]['img'] ] );
            if(img_url.length != 0){
                res[i]['img_url'] = img_url[0]['base_code'];
            }

            res[i]['name'] = aesDecode(res[i]['name'], code, lock);
        }

        dispatch(setUserData(res));
    };
}

export function creRoom(ids){
    return async (dispatch, getState) => {
        let cre_room_code = sha256( randomRange(1000000,9999999).toString() + getTimestamp() );
        let checkToken = await select('user', 'token', `id IN (${ids.join(',')})`);
        let tokens = [];

        for(var i=0;i<checkToken.length;i++){
            tokens.push(checkToken[i]['token']);
        }

        await insert('room',{room_code : cre_room_code, tokens : tokens.join(','), date : getNow()});
        await update('sel_room',{ room_code : cre_room_code },'id=?',[1]);
        dispatch(patchData());
    };
}

export function updateRoom(code, tokens){
    return async (dispatch, getState) => {
        await update('room',{ tokens : tokens},'room_code=?',[code]);
        await update('sel_room',{ room_code : code },'id=?',[1]);
        dispatch(patchData());
    };
}

export function getSelTokenList(){
    return async (dispatch, getState) => {
        let state = getState();
        let sel_room_code = await select('sel_room', 'room_code', 'id=?', [1]);
        sel_room_code = sel_room_code[0]['room_code'];

        if(sel_room_code != 'None'){
            let check_token = await select('room', 'tokens', 'room_code=?', [sel_room_code]);
            dispatch(setTokenList(check_token[0]['tokens'].split(',')));
        }
        else{
            dispatch(setTokenList([]));
        }
    };
}

export function getRoomList(){
    return async (dispatch, getState) => {
        let state = getState();
        const {my_data} = state.ChatReducer;
        const {code, lock} = state.commonReducer;

        let datas = await select('room', '*', '1 order by date DESC');
        for(var i=0;i<datas.length;i++){
            let tokens = datas[i]['tokens'];
            tokens = tokens.split(',');
            msgCnt = await select('msg', 'COUNT(*) as count', `room_code=? and read="no" and token NOT IN ("${my_data[0].token}") `, [ datas[i]['room_code'] ]);
            datas[i]['msgCnt'] = msgCnt[0]['count'];

            datas[i]['msg'] = 'None';
            let msgCheck = await select('msg', 'msg, type', 'room_code=? order by date desc LIMIT 1', [datas[i]['room_code']]);
            if(msgCheck.length == 1){
                if(msgCheck[0]['type'] == 'emoticon'){
                    datas[i]['msg'] = '[이모티콘]';
                }
                else{
                    datas[i]['msg'] = aesDecode(msgCheck[0]['msg'], code, lock);
                }
            }

            datas[i]['name'] = '';

            if(tokens.length == 1){
                let check_user = await select('user', '*', 'token=?', [tokens[0]]);

                if(check_user.length != 0){
                    datas[i]['name'] = aesDecode(check_user[0]['name'],code, lock);
                    datas[i]['img'] = check_user[0]['img'];

                    datas[i]['img_url'] = '';

                    let img_url = await select('imgs', 'base_code', 'id=?', [ datas[i]['img'] ] );
                    if(img_url.length != 0){
                        datas[i]['img_url'] = img_url[0]['base_code'];
                    }
                }

            }

            datas[i]['len'] = tokens.length;
            datas[i]['roomCnt'] = `${tokens.length}명`;

        }
        dispatch(setRoomList(datas));
    };
}

export function resetRoom(value = 'None'){
    return async (dispatch, getState) => {
        await update('sel_room',{ room_code : value },'id=?',[1]);
        dispatch(readYes());
    };
}

export function updateMsg(msg, type='text'){
    return async (dispatch, getState) => {
        let state = getState();
        const {sel_room_code, my_data} = state.ChatReducer;
        const {code} = state.commonReducer;

        await insert('msg',{room_code : sel_room_code, msg : aesEncode(msg, code), token : my_data[0].token, read : 'no', state : 'my', date : getNow(), type : type});

        dispatch(patchData());
    };
}

export function getMsgList(){
    return async (dispatch, getState) => {
        let state = getState();
        const {code, lock} = state.commonReducer;
        let sel_room_code = await select('sel_room', 'room_code', 'id=?', [1]);
        sel_room_code = sel_room_code[0]['room_code'];

        // let msgCnt = await select('msg', 'COUNT(*) as count');
        // msgCnt = msgCnt[0]['count'];
        // let limit = 10;
        // let offset = msgCnt-limit; LIMIT ${limit} OFFSET ${offset}

        let datas = await select('msg', '*', `room_code=?`, [sel_room_code]);
        let prev_date = '';

        for(var i=0;i<datas.length;i++){
            let check_user = await select('user', '*', 'token=?', [ datas[i].token ]);

            datas[i]['msg'] = aesDecode(datas[i]['msg'], code, lock);

            datas[i]['eicon_url'] = '';
            if(datas[i]['type'] == 'emoticon'){
                let eicon_url = await select('imgs', 'base_code', 'id=?', [ datas[i]['msg'] ] );
                datas[i]['eicon_url'] = eicon_url[0]['base_code'];
            }

            if(datas[i]['state'] == 'user'){
                datas[i]['name'] = aesDecode(check_user[0]['name'], code, lock);
                datas[i]['img_url'] = '';

                let img_url = await select('imgs', 'base_code', 'id=?', [ check_user[0]['img'] ] );
                if(img_url.length != 0){
                    datas[i]['img_url'] = img_url[0]['base_code'];
                }
            }

            datas[i]['is_date'] = 'no';
            if(prev_date != datas[i]['date'].substr(0,10)){
                datas[i]['is_date'] = 'yes';
                prev_date = datas[i]['date'].substr(0,10);
            }
        }
        dispatch(setMsgList(datas));
    };
}

export function getImgList(){
    return async (dispatch, getState) => {
        let datas = await select('imgs', '*');
        datas = array_chunk(datas);
        dispatch(setImgList(datas));
    };
}

export function myImgUpdate(id, close = () => null){
    return async (dispatch, getState) => {
        close();

        await update('user',{ img : id},'state=?',['my']);
        dispatch(patchData());
    };
}

export function userNameUpdate(name, token){
    return async (dispatch, getState) => {
        let state = getState();
        const {code} = state.commonReducer;
        await update('user', { name : aesEncode(name, code), edit : 'yes'}, 'token=?', [token]);
        dispatch(patchData());
    };
}

export function userOsUpdate(os, token){
    return async (dispatch, getState) => {
        let state = getState();
        const {code} = state.commonReducer;
        await update('user', { os : os}, 'token=?', [token]);
        dispatch(patchData());
    };
}

export function removeRoomUser(token, close = () => null){
    return async (dispatch, getState) => {
        let state = getState();
        let sel_room_code = await select('sel_room', 'room_code', 'id=?', [1]);
        sel_room_code = sel_room_code[0]['room_code'];

        let tokens = [];

        if(sel_room_code != 'None'){
            let check_token = await select('room', 'tokens', 'room_code=?', [sel_room_code]);
            tokens = check_token[0]['tokens'].split(',');
            tokens = tokens.filter( tokenItem => tokenItem !== token );

            if(tokens.length == 0){
                await del('room','room_code=?',[sel_room_code]);
                await update('sel_room', { room_code : 'None' }, 'id=?', [1]);
            }
            else{
                await update('room', { tokens : tokens.join(',') }, 'room_code=?', [sel_room_code]);
            }
        }
        close();
        dispatch(patchData());
    };
}

export function readYes(){
    return async (dispatch, getState) => {
        let sel_room_code = await select('sel_room', 'room_code', 'id=?', [1]);
        sel_room_code = sel_room_code[0]['room_code'];

        if(sel_room_code != 'None'){
            await update('msg', { read : 'yes'}, 'room_code=?', [sel_room_code]);
        }

        dispatch(patchData());
    };
}

export function pinCheckUpdate(result, type){
    return async (dispatch, getState) => {
        print('pinCheckUpdate', result);
        if(result == true){
            if(type == 'reset'){
                dispatch(setViewLock(false));
            }
            dispatch(updateLock(false));
            dispatch(patchData());
        }
        else{
            if(type == 'reset'){
                dispatch(setViewLock(true));
            }
        }
    };
}

export function patchData(){
    return async (dispatch, getState) => {
        dispatch(getMsgList());
        dispatch(getRoomList());
        dispatch(getUserData());
        dispatch(getSelRoomCode());
        dispatch(getSelTokenList());
        dispatch(getMyData());
    };
}

// Reducer
function reducer(state = initialState, action) {
    switch (action.type) {
        case SET_MY_DATA:
            return {
                ...state,
                my_data : action.data,
            }
        case SET_MY_NAME:
            return {
                ...state,
                my_name : action.name,
            }
        case SET_USER_DATA:
            return {
                ...state,
                user_data : action.data,
            }
        case SET_ROOM_CODE:
            return {
                ...state,
                sel_room_code : action.code,
            }
        case SET_TOKEN_LIST:
            return {
                ...state,
                sel_room_token_list : action.token_list,
            }
        case SET_ROOM_LIST:
            return {
                ...state,
                room_list : action.data,
            }
        case SET_MSG_LIST:
            return {
                ...state,
                msg_list : action.data,
            }
        case SET_IMG_LIST:
            return {
                ...state,
                img_list : action.data,
            }
    }

    return state;
}

// Exports Default
export default reducer;
