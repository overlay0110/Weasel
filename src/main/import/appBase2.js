import React, {Component} from 'react';
import { Platform, Alert, NativeModules, Dimensions, BackHandler, View, TouchableOpacity, Text  } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

export function rn_header(option){
    let setting = {
        left : { type : 'icon', text: 'arrow-left'},
        title : 'title',
        right : { type : 'text', text : 'exit'},
        titleAlign : 'center',
        headerColor : '#7EE9D1',
        textColor : '#fff',
        textSize : 16,
        leftFunc : () => console.log('leftFunc'),
        rightFunc : () => console.log('rightFunc'),
    }

    for(var key in option){
        setting[key] = option[key];
    }

    for(var key in setting){
        if(setting[key].type != undefined && setting[key].type == 'icon'){
            setting[key] = (<Icon name={setting[key].text} size={setting.textSize}/>);
        }
        else if(setting[key].type != undefined && setting[key].type == 'text'){
            setting[key] = (setting[key].text);
        }
    }

	let headerStyles = {
		header: {
			backgroundColor: setting.headerColor,
			height : 50,
			alignItems: 'center',
			flexDirection: 'row',
		},
		headerLeft : {
			width : 60,
            padding : 15,
        },
        headerTitle : {
            padding : 15,
            flex : 1,
        },
        headerRight : {
            width : 60,
            padding : 15,
        },
        iconCenter : {
            textAlign : 'center',
        },
        titleAlign : {
            textAlign : setting.titleAlign
        },
        headerTextColor : {
            color : setting.textColor,
        },
        headerTextSize : {
            fontSize : setting.textSize,
        },

    }
    // arrow-left, bars,
	return (
		<View style={headerStyles.header}>
			<TouchableOpacity style={headerStyles.headerLeft} onPress={setting.leftFunc}><Text style={[headerStyles.headerTextColor, headerStyles.headerTextSize, headerStyles.iconCenter]}>{setting.left}</Text></TouchableOpacity>
            <View style={[headerStyles.headerTitle]}><Text style={[headerStyles.titleAlign,headerStyles.headerTextColor,headerStyles.headerTextSize]}>{setting.title}</Text></View>
            <TouchableOpacity style={headerStyles.headerRight} onPress={setting.rightFunc}><Text style={[headerStyles.headerTextColor,headerStyles.headerTextSize, headerStyles.iconCenter]}>{setting.right}</Text></TouchableOpacity>
		</View>
	);
}

export function rn_header2(option){
    let setting = {
        left : { type : 'icon', text: 'arrow-left', show : true,},
        title : 'title',
        right : { type : 'text', text : 'exit', show : true,},
        titleAlign : 'center',
        headerColor : '#7EE9D1',
        textColor : '#fff',
        textSize : 16,
        leftTag : undefined,
        rightTag : undefined,
        leftFunc : () => console.log('leftFunc'),
        rightFunc : () => console.log('rightFunc'),
        titleFunc : () => console.log('titleFunc'),
    }

    for(var key in option){
        setting[key] = option[key];
    }

    for(var key in setting){
        if(setting[key] != undefined){
            if(setting[key].type == 'icon'){
                setting[key+'Tag'] = (<Icon name={setting[key].text} size={setting.textSize}/>);
            }
            else if(setting[key].type == 'text'){
                setting[key+'Tag'] = (setting[key].text);
            }
        }
    }

	let headerStyles = {
		header: {
			backgroundColor: setting.headerColor,
			height : 50,
			alignItems: 'center',
			flexDirection: 'row',
		},
		headerLeft : {
			width : 60,
            padding : 15,
        },
        headerTitle : {
            padding : 15,
            flex : 1,
        },
        headerRight : {
            width : 60,
            padding : 15,
        },
        iconCenter : {
            textAlign : 'center',
        },
        titleAlign : {
            textAlign : setting.titleAlign
        },
        headerTextColor : {
            color : setting.textColor,
        },
        headerTextSize : {
            fontSize : setting.textSize,
        },

    }
    // arrow-left, bars,

	return (
		<View style={headerStyles.header}>
            {setting.left.show || setting.left.show == undefined ? (
                <TouchableOpacity style={headerStyles.headerLeft} onPress={setting.leftFunc}>
                    <Text style={[headerStyles.headerTextColor, headerStyles.headerTextSize, headerStyles.iconCenter]}>{setting.leftTag}</Text>
                </TouchableOpacity>
            ) : (
                <View style={headerStyles.headerLeft} >
                    <Text style={[headerStyles.headerTextColor, headerStyles.headerTextSize, headerStyles.iconCenter]}>{''}</Text>
                </View>
            ) }

            <TouchableOpacity style={[headerStyles.headerTitle]} onPress={setting.titleFunc}>
                <Text style={[headerStyles.titleAlign,headerStyles.headerTextColor,headerStyles.headerTextSize]}>{setting.title}</Text>
            </TouchableOpacity>

            {setting.right.show || setting.right.show == undefined ? (
                <TouchableOpacity style={headerStyles.headerRight} onPress={setting.rightFunc}>
                    <Text style={[headerStyles.headerTextColor,headerStyles.headerTextSize, headerStyles.iconCenter]}>{setting.rightTag}</Text>
                </TouchableOpacity>
            ) : (
                <View style={headerStyles.headerRight} >
                    <Text style={[headerStyles.headerTextColor,headerStyles.headerTextSize, headerStyles.iconCenter]}>{''}</Text>
                </View>
            ) }
		</View>
	);
}

export function rn_footer(option){
    let setting = {
        titleAlign : 'center',
        footerColor : '#7EE9D1',
        textColor : '#fff',
        activeColor : 'green',
        textSize : 16,
        iconSize : 16,
        items : [],
    }

    for(var key in option){
        setting[key] = option[key];
    }

    let footerStyles = {
        footer : {
            backgroundColor : setting.footerColor,
            height : 50,
            alignItems: 'center',
            flexDirection: 'row',
        },
        footerItem : {
            width : '25%',
            height : '100%',
            padding : 18,
        },
        footerItemText : {
            width : '25%',
            height : '100%',
            padding : 8,
        },
        footerTextAlign : {
            textAlign : 'center',
        },
        footerTextColor : {
            color : setting.textColor,
        },
        footerTextSize : {
            fontSize : setting.textSize,
        },
        footerActive : {
            backgroundColor : setting.activeColor,
        }
    }
    return (
        <View style={footerStyles.footer}>
            <TouchableOpacity style={[footerStyles.footerItemText,footerStyles.footerActive]}>
                <Icon name={'arrow-left'} size={setting.iconSize} style={[footerStyles.footerTextAlign,footerStyles.footerTextColor]}/>
                <Text style={[footerStyles.footerTextAlign,footerStyles.footerTextColor,footerStyles.footerTextSize]}>test</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[footerStyles.footerItemText,]}>
                <Icon name={'arrow-left'} size={setting.iconSize} style={[footerStyles.footerTextAlign,footerStyles.footerTextColor]}/>
                <Text style={[footerStyles.footerTextAlign,footerStyles.footerTextColor,footerStyles.footerTextSize]}>test</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[footerStyles.footerItem,]}>
                <Text style={[footerStyles.footerTextAlign,footerStyles.footerTextColor,footerStyles.footerTextSize]}>test</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[footerStyles.footerItem,]}>
                <Icon name={'arrow-left'} size={setting.iconSize} style={[footerStyles.footerTextAlign,footerStyles.footerTextColor]}/>
            </TouchableOpacity>
        </View>
    );
}
