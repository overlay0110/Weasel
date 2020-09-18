import { Platform, Alert, NativeModules, Dimensions, BackHandler } from 'react-native';
import config from './config';
import {select, insert} from './funcDB';
import { callConfig, } from './funcHTTP';
var CryptoJS = require("crypto-js");
import Share from 'react-native-share';

export function getConfig(){
	return config;
}

export async function getConfigLog(){
	let res = await callConfig();

	let con = {};

    if(res.catch){
        const configInfo = await select('configLog','json_configs', '1 order by id desc limit 1');
        print('configInfo', configInfo);
        con = JSON.parse(configInfo[0].json_configs);
    }
    else{
        await insert('configLog',{json_configs : JSON.stringify(res.res), date : getNow()});
        con = res.res;
	}

	return con;
}

export function getDebug(){
    return config.DEBUG;
}

export function print(){
    if(getDebug()) console.log(...arguments);
}

function sha256_base(s){
    var chrsz   = 8;
    var hexcase = 0;

    function safe_add (x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function S (X, n) { return ( X >>> n ) | (X << (32 - n)); }
    function R (X, n) { return ( X >>> n ); }
    function Ch(x, y, z) { return ((x & y) ^ ((~x) & z)); }
    function Maj(x, y, z) { return ((x & y) ^ (x & z) ^ (y & z)); }
    function Sigma0256(x) { return (S(x, 2) ^ S(x, 13) ^ S(x, 22)); }
    function Sigma1256(x) { return (S(x, 6) ^ S(x, 11) ^ S(x, 25)); }
    function Gamma0256(x) { return (S(x, 7) ^ S(x, 18) ^ R(x, 3)); }
    function Gamma1256(x) { return (S(x, 17) ^ S(x, 19) ^ R(x, 10)); }

    function core_sha256 (m, l) {

        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1,
                        0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
                        0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786,
                        0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
                        0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147,
                        0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
                        0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B,
                        0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
                        0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A,
                        0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
                        0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);

        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F,0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);

        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;

        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for ( var i = 0; i<m.length; i+=16 ) {
            a = HASH[0];
            b = HASH[1];
            // c = HASH[2];
            c = HASH[7];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            // h = HASH[7];
            h = HASH[2];

            for ( var j = 0; j<64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));

                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }

            HASH[0] = safe_add(a, HASH[0]);
            // HASH[1] = safe_add(b, HASH[1]);
            HASH[1] = safe_add(b, HASH[5]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            // HASH[5] = safe_add(f, HASH[5]);
            HASH[5] = safe_add(f, HASH[1]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }

    function str2binb (str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for(var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i%32);
        }
        return bin;
    }

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }

    function binb2hex (binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for(var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8+4)) & 0xF) +
            hex_tab.charAt((binarray[i>>2] >> ((3 - i%4)*8  )) & 0xF);
        }
        return str;
    }

    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}

export function sha256(s){
    return sha256_base(s);
}

export function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}

export function getNow() {
  var d = new Date();
  var s =
    leadingZeros(d.getFullYear(), 4) + '-' +
    leadingZeros(d.getMonth() + 1, 2) + '-' +
    leadingZeros(d.getDate(), 2) + ' ' +

    leadingZeros(d.getHours(), 2) + ':' +
    leadingZeros(d.getMinutes(), 2) + ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
}

export function transDate(date){
    if(date == undefined){
        date = new Date();
    }
    var s =
      leadingZeros(date.getFullYear(), 4) + '-' +
      leadingZeros(date.getMonth() + 1, 2) + '-' +
      leadingZeros(date.getDate(), 2) + ' ';

      return s;
}

export function getTimestamp(value = 'now') {
	if(value == 'now'){
		return Math.floor(+ new Date() / 1000);
	}

	let date = new Date(value);
	return date.getTime();
}

export function dateAddDel(sDate, nNum, type) {
    var yy = parseInt(sDate.substr(0, 4), 10);
    var mm = parseInt(sDate.substr(5, 2), 10);
    var dd = parseInt(sDate.substr(8), 10);

    if (type == "d") {
        d = new Date(yy, mm - 1, dd + nNum);
    }
    else if (type == "m") {
        d = new Date(yy, mm - 1, dd + (nNum * 31));
    }
    else if (type == "y") {
        d = new Date(yy + nNum, mm - 1, dd);
    }

    yy = d.getFullYear();
    mm = d.getMonth() + 1; mm = (mm < 10) ? '0' + mm : mm;
    dd = d.getDate(); dd = (dd < 10) ? '0' + dd : dd;

    return '' + yy + '-' +  mm  + '-' + dd;
}

export function customAlert(content, title = '') {
    Alert.alert(
        title,
        content,
        [
            {
                text: "OK",
            }
        ],
        {cancelable: false},
    );
}

export function actionAlert(content, action, title = ''){
    // setInterval()는 IOS때문에 추가
    let timer = setInterval(() => {
        clearInterval(timer);
        Alert.alert(
            title,
            content,
            [
                {
                    text: "OK",
                    onPress : action,
                }
            ],
            {cancelable: false},
        );
    }, 300);
}

export function actionAlert2(content, action, title = ''){
    // setInterval()는 IOS때문에 추가
    let timer = setInterval(() => {
        clearInterval(timer);
        Alert.alert(
            title,
            content,
            [
                {
                    text: "OK",
                    onPress : action,
                },
                { text: "Cancel"}
            ],
            {cancelable: false},
        );
    }, 300);
}

export function isExist(filename, arr){
    let ex = ( filename.split('.') )[1];

    var isEx = (arr.indexOf(ex)!== -1);

    return isEx;
}

export function creTranCode(){
    var result = Math.floor(Math.random() * (999999-100000+1) ) + 100000;
    return result + '' + Math.floor(+ new Date() / 1000);
}

export function tran_check(startdate, enddate){
    if (new Date() >= new Date(startdate.replace(/\s/gi, "")) && new Date() < new Date(enddate.replace(/\s/gi, ""))) {
        return true;
    }
    else{
        return false;
    }
}

export function amountFilter(amount, view='none'){
    amount = String(amount);
    var idxOfDot = amount.indexOf('.');
    var idxOfLstZ = amount.lastIndexOf('0');
    var lastChar = amount.charAt(amount.length-1);
    amount = amount.replace(/,/gi,'');

    if (idxOfDot!=-1) {
        var decimals = amount.substr(idxOfDot+1);
        if (decimals.length>=8) {
            var splited = amount.split('.');
            amount = splited[0]+'.'+splited[1].substr(0,8);
        }
    }

    // 1000000000000넘길 경우 강제로 1000000000000로 바꾸기
    if (parseFloat(amount) > 1000000000000) {
        amount = "1000000000000";
        idxOfDot = -1;
    }

    // 콤마 추가
    if(view == 'view'){
        var splited2 = amount.split('.');
        amount = addComma(splited2[0]);
        if (idxOfDot!=-1){
            amount += '.'+splited2[1];
        }
    }
    return amount;
}

export function addComma(num){
    var regexp = /\B(?=(\d{3})+(?!\d))/g;
    return num.toString().replace(regexp, ',');
}

export function yearCheck(startdate, enddate){
    var sdd = startdate;
    var edd = enddate;
    var ar1 = sdd.split('-');
    var ar2 = edd.split('-');
    var da1 = new Date(ar1[0], ar1[1], ar1[2]);
    var da2 = new Date(ar2[0], ar2[1], ar2[2]);
    var dif = da2 - da1;
    var cDay = 24 * 60 * 60 * 1000;// 시 * 분 * 초 * 밀리세컨
    var cMonth = cDay * 30;// 월 만듬
    var cYear = cMonth * 12; // 년 만듬

    var value = parseInt(dif/cYear);

    if(value > 3){
        return true;
    }
    else{
        return false;
    }
}

export function filter_wallet(datas, e_list, option){
    let remove_list = [];
    let remove_list2 = [];
    let temp1 = [];

    /*
    option = {
        keyCheck : true,
        removeHide : true,
        removeAddress : '',
        hideOrder : false,
        config : [],
    }
    */

    // 해당 지갑주소 이체시 인증방법 여부 추가 ( send_auth : 0 : PIN인증, 1 : OTP인증 )
    if(option.config != undefined){
        for(var i=0;i<option.config.length;i++){
            for(var j=0;j<datas.length;j++){
                if(datas[j].send_auth == undefined){
                    datas[j]['send_auth'] = 0;
                }

                if(option.config[i].address == datas[j].address){
                    datas[j]['send_auth'] = option.config[i].send_auth;
                }
            }
        }
    }

    // 해당 지갑주소 키등록 여부 추가
    if(option.keyCheck){
        for(var j=0; j<datas.length; j++){
            datas[j]['create_key'] = false;
        }

        for(var i=0; i<e_list.length; i++){
            for(var j=0; j<datas.length; j++){
                if(e_list[i].address == datas[j].address){
                    datas[j]['create_key'] = true;
                }
            }
        }
    }

    // 숨김 처리된 지갑주소 제거
    if(option.removeHide){
        for(var i=0;i<datas.length;i++){
            if(datas[i].stat == 9){
                remove_list.push(i);
                // datas.splice(i, 1);
            }
        }

        remove_list.sort(function(a, b) {
            return b - a;
        });

        for(var i=0;i<remove_list.length;i++){
            datas.splice(remove_list[i],1);
        }
    }

    // removeAddress랑 일치한 지갑주소 제거
    if(option.removeAddress.trim() != 0){
        for(var i=0;i<datas.length;i++){
            if(datas[i].address == option.removeAddress){
                datas.splice(i, 1);
            }
        }
    }

    // 숨김 처리된 지갑주소 맨아래로 보냄
    if(option.hideOrder){
        for(var i=0;i<datas.length;i++){
            if(datas[i].stat == 9){
                remove_list2.push(i);
                temp1.push(datas[i]);
                // datas.splice(i, 1);
            }
        }

        remove_list2.sort(function(a, b) {
            return b - a;
        });

        for(var i=0;i<remove_list2.length;i++){
            datas.splice(remove_list2[i],1);
        }

        for(var i=0;i<temp1.length;i++){
            datas.push(temp1[i]);
        }
    }

    return datas;
}

function getCryptoJSAesJson(){
    var CryptoJSAesJson = {
        stringify: function (cipherParams) {
            var j = {ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64)};
            if (cipherParams.iv) j.iv = cipherParams.iv.toString();
            if (cipherParams.salt) j.s = cipherParams.salt.toString();
            return JSON.stringify(j);
        },
        parse: function (jsonStr) {
            var j = JSON.parse(jsonStr);
            var cipherParams = CryptoJS.lib.CipherParams.create({ciphertext: CryptoJS.enc.Base64.parse(j.ct)});
            if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv)
            if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s)
            return cipherParams;
        }
    }
    return CryptoJSAesJson;
}

export function mobileCryptoJsAesEncrypt(plain_text, secret_key){
    var CryptoJSAesJson = getCryptoJSAesJson();
    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(plain_text), secret_key, {format: CryptoJSAesJson}).toString();
    return encrypted;
}

export function mobileCryptoJsAesDecrypt(plain_json, secret_key){
    var CryptoJSAesJson = getCryptoJSAesJson();
    var decrypted = JSON.parse(CryptoJS.AES.decrypt(plain_json, secret_key, {format: CryptoJSAesJson}).toString(CryptoJS.enc.Utf8));
    return decrypted;
}

export function strToZero(str){
    let temp = '';
    for(var i=0;i<str.length;i++){
        // temp += '0';
        temp += '●';
    }
    return temp;
}

export function passRead(pass_list){
    let result = '';
    let temp = '';

    for(var i=0;i<pass_list.length;i++){
        temp = mobileCryptoJsAesDecrypt(pass_list[i], sha256(baseStr()));
        result += temp.replace(/●/g, "");
    }

    return result;
}

export function filter_msg(json){
    let check_msg = '';

    if(json.error != undefined){
        check_msg = strings[json.error];
        return (check_msg == undefined) ? json.error : check_msg;
    }

    if(json.errors != undefined){
        return json.errors.msg[0];
    }

    return check_msg;
}

export function toFloat(number){
    number = parseFloat(number);
    var tmp = number + "";
    if(tmp.indexOf(".") != -1){
        number = number.toFixed(4);
        number = number.replace(/(0+$)/, "");
    }

    return number;
}

export function randomRange(start, end){
	return Math.floor(Math.random() * end) + start;
}

export function alphabet(type = 'random'){
    let alpha_list = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    if(type == 'random'){
        return alpha_list[randomRange(0, (alpha_list.length-1) )];
    }
    else{
        return alpha_list;
    }

}

export function share(value){
	const options = {
		title: 'Share',
		url : value,
	};
	Share.open(options)
		.then((res) => { print(res) })
		.catch((err) => { err && print(err); });
}

export function array_chunk(a = [], size = 3){
	var arrays = [];

	while (a.length > 0)
		arrays.push(a.splice(0, size));

	return arrays;
}

export function getPoints(){
    let point = {
        a : {x :  53 , y :  3},
        b : {x :  14 , y :  1},
        c : {x :  11 , y :  4},
        d : {x :  59 , y :  1},
        e : {x :  48 , y :  9},
        f : {x :  58 , y :  6},
        g : {x :  52 , y :  5},
        h : {x :  52 , y :  8},
        i : {x :  9 , y :  3},
        j : {x :  23 , y :  1},
        k : {x :  25 , y :  5},
        l : {x :  43 , y :  6},
        m : {x :  20 , y :  5},
        n : {x :  62 , y :  8},
        o : {x :  55 , y :  5},
        p : {x :  2 , y :  8},
        q : {x :  29 , y :  2},
        r : {x :  1 , y :  4},
        s : {x :  10 , y :  1},
        t : {x :  47 , y :  3},
        u : {x :  28 , y :  3},
        v : {x :  55 , y :  9},
        w : {x :  31 , y :  5},
        x : {x :  38 , y :  7},
        y : {x :  54 , y :  8},
        z : {x :  51 , y :  4},
    }

    return point;
}

export async function getCode2(option = 'code'){
    let config = getConfig();
    let point = getPoints();

    let value = '';
    return value;
}

export function aesEncode(value, code = '7c9cf008e999512f9190696df7de5f3dc32551dcc79f57ce6c62cd6d3c624dbb'){
    let plaintext = CryptoJS.AES.encrypt(value.toString() , code);
    return plaintext.toString();
}

export function aesDecode(value, code = '7c9cf008e999512f9190696df7de5f3dc32551dcc79f57ce6c62cd6d3c624dbb', set = false){
    print('aesDecode ', value, code)
    if(set){
        return value;
    }
    else{
        let bytes  = CryptoJS.AES.decrypt(value, code);
        let plaintext = bytes.toString(CryptoJS.enc.Utf8);
        print('aesDecode plaintext ', plaintext)

        return plaintext;
    }
}

export function pinCheckVlaue(){
    return 'dbc81aa44172afd8ad169de0ab48671908930c4db76081e0ee555efd0f81cdae';
}

export async function getLock(value = false){
    let check = pinCheckVlaue();
    let num = await getCode2('num');
    let auth_code = await select('auth', '*', 'id=?', [num]);
    auth_code = auth_code[0]['F5'];

    if(auth_code != check){
        value = true;
    }

    return value;
}