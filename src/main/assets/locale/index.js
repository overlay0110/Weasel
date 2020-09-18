import en from './en';
import ko from './ko';
import * as RNLocalize from "react-native-localize";

let loc = RNLocalize.getCountry();
let strings = {};

if(loc == 'KR'){
	strings = ko;
}
else{
	strings = en;
}

export default strings;
