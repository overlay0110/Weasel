import os
import errno
import stat
import shutil

helpStr = """
exit
del
add r sampleReducer
add c Sample.js
add cd List/Main.js
(app_name||app_id||sdk_path||start_name) value edit_value
"""

config = {
    "inputText" : "Please Command >> ",
    "reducerIndex" : ['Reducers({', 'Reducers({{\n    {},' ],
    "reducerIndex2" : ["from 'redux';", "from 'redux';\nimport {} from './{}';" ],
    "comBaseContent" : ['Base', '{}'],
    "comIndexContent" : ["from 'react-native';", "from 'react-native';\nimport {} from './{}';"],
    "comIndexContent2" : ['screen: Main },', 'screen: Main }},\n    {}: {{ screen : {} }},'],
    "comIndexContent3" : ['router = {', 'router = {{\n    {}: {{ screen : {} }},'],
    "comMainContent" : ['<Text>Main.js</Text>', '<Text>Main.js</Text>\n                <Button title="{}" onPress={{ () => this.props.navigation.navigate("{}") }} />'],
    "naviContent" : ["from './components/App';", "from './components/App';\nimport {} from './components/{}';"],
    "naviContent2" : ['...App,', '...App,\n        ...{},'],
    'app_name' : ['<string name="app_name">{}</string>', '<string name="app_name">{}</string>'],
    'app_name_ios' : ['<key>CFBundleDisplayName</key><string>{}</string>', '<key>CFBundleDisplayName</key><string>{}</string>'],
    'sdk_path' : ['sdk.dir = {}' ],
    'start_name' : [ 'FIRST_SCREEN : \'{}\'' ],
    'gradle' : [ 'applicationId "{}"' ],
    'manifest' : [ 'package="{}"' ],
    'java' : ['package {}'],
    'ios_id1' : ['PRODUCT_BUNDLE_IDENTIFIER = {};/*Debug*/'],
    'ios_id2' : ['PRODUCT_BUNDLE_IDENTIFIER = {};/*Release*/'],
    'store_file' : ['MYAPP_RELEASE_STORE_FILE={}'],
    'alias' : ['MYAPP_RELEASE_KEY_ALIAS={}'],
    'store_password' : ['MYAPP_RELEASE_STORE_PASSWORD={}'],
    'key_password' : ['MYAPP_RELEASE_KEY_PASSWORD={}'],
}

def handleRemoveReadonly(func, path, exc):
  excvalue = exc[1]
  if func in (os.rmdir, os.remove) and excvalue.errno == errno.EACCES:
      os.chmod(path, stat.S_IRWXU| stat.S_IRWXG| stat.S_IRWXO) # 0777
      func(path)
  else:
      raise

def file_path(filename = ''):
    scriptDir = os.path.dirname(os.path.realpath(__file__))
    path = scriptDir + os.path.sep + filename
    return path

def file_content(filename, file_return = 'None'):
    path = file_path(filename)

    result = ''
    read_offset = open(path, mode='r', encoding='utf-8-sig')

    if file_return == 'yes':
        return read_offset

    lines = read_offset.readlines()
    for line in lines:
        result += line
    read_offset.close()
    return result

def file_writing(filename, content, save_type='at', encode='utf-8-sig'):
    # type wt : 전체 덮어쓰기, at : 추가
    path = file_path(filename)
    save_content = open(path, mode=save_type, encoding=encode)
    save_content.write(str(content))
    save_content.close()

def add_dir(valuePath):
    path = file_path(valuePath)
    try:
        if not(os.path.isdir(path)):
            os.makedirs(path)
    except OSError as e:
        if e.errno != errno.EEXIST:
            print("Failed to create directory!!!!!")
            raise

def reducerPath():
    return 'src\\main\\reducers\\'

def componentPath():
    return 'src\\main\\components\\'

def importPath():
    return 'src\\main\\import\\'

def naviPath():
    return 'src\\main\\index.js'

def androidStringPath():
    return 'android\\app\\src\\main\\res\\values\\strings.xml'

def iosPlistPath():
    return 'ios\\appBase2\\Info.plist'

def localPTSPath():
    return 'android\\local.properties'

def androidPath():
    return 'android\\'

def iosPath():
    return 'ios\\'

def androidSignFilePath():
    return 'android\\gradle.properties'

def androidResPaths():
    datas = [
        'android\\app\\src\\main\\res\\drawable-hdpi',
        'android\\app\\src\\main\\res\\drawable-mdpi',
        'android\\app\\src\\main\\res\\drawable-xhdpi',
        'android\\app\\src\\main\\res\\drawable-xxhdpi',
        'android\\app\\src\\main\\res\\drawable-xxxhdpi',
        'android\\app\\src\\main\\res\\raw',
    ]
    return datas

while True:
    v = input(config["inputText"])

    if v == 'exit':
        break
    if v == 'help':
        print(helpStr)

    c = v.split(' ')
    if c[0] == 'add' and len(c) == 3:
        reducerPath = reducerPath()
        componentPath = componentPath()

        if c[1] == 'r':
            baseContent = file_content(reducerPath + 'baseReducer.js')
            file_writing(reducerPath + c[2] + '.js', baseContent)

            indexContent = file_content(reducerPath + 'index.js')
            indexContent = indexContent.replace( config["reducerIndex"][0], config["reducerIndex"][1].format(c[2]) )
            indexContent = indexContent.replace( config["reducerIndex2"][0], config["reducerIndex2"][1].format(c[2],c[2]) )
            file_writing(reducerPath + 'index.js', indexContent, 'wt')

        if c[1] == 'c':
            baseContent = file_content(componentPath + 'Base\\Base2.js')
            baseContent = baseContent.replace(config["comBaseContent"][0], config["comBaseContent"][1].format(c[2].replace('.js','')) )
            file_writing(componentPath + 'App\\' + c[2], baseContent)

            indexContent = file_content(componentPath + 'App\\index.js')
            change = indexContent.replace( config["comIndexContent"][0], config["comIndexContent"][1].format(c[2].replace('.js',''),c[2].replace('.js','')))
            change = change.replace(config["comIndexContent2"][0], config["comIndexContent2"][1].format(c[2].replace('.js',''), c[2].replace('.js','')) )
            file_writing(componentPath + 'App\\index.js', change, 'wt')

            mainContent = file_content(componentPath + 'App\\Main.js')
            mainContent = mainContent.replace(config["comMainContent"][0], config["comMainContent"][1].format(c[2].replace('.js',''), c[2].replace('.js','')))
            file_writing(componentPath + 'App\\Main.js', mainContent, 'wt')
        
        if c[1] == 'cd':
            cc = c[2].split('/')
            if len(cc) != 2:
                print('cd fail!!')
                continue

            if not os.path.isdir(componentPath + '{}\\'.format(cc[0])):
                naviContent = file_content(naviPath())
                naviContent = naviContent.replace(config["naviContent"][0], config["naviContent"][1].format(cc[0],cc[0]))
                naviContent = naviContent.replace(config["naviContent2"][0], config["naviContent2"][1].format(cc[0]))
                file_writing(naviPath(), naviContent, 'wt')

                add_dir( componentPath + '{}\\'.format(cc[0]) )
                indexContent = file_content(componentPath + 'Base\\index.js')
                change = indexContent.replace( config["comIndexContent"][0], config["comIndexContent"][1].format(cc[1].replace('.js',''),cc[1].replace('.js','')))
                change = change.replace(config["comIndexContent3"][0], config["comIndexContent3"][1].format(cc[1].replace('.js',''), cc[1].replace('.js','')) )
                file_writing(componentPath + '{}\\index.js'.format(cc[0]), change, 'wt')
            else:
                indexContent = file_content( componentPath + '{}\\index.js'.format(cc[0]) )
                change = indexContent.replace( config["comIndexContent"][0], config["comIndexContent"][1].format(cc[1].replace('.js',''),cc[1].replace('.js','')))
                change = change.replace(config["comIndexContent3"][0], config["comIndexContent3"][1].format(cc[1].replace('.js',''), cc[1].replace('.js','')) )
                file_writing(componentPath + '{}\\index.js'.format(cc[0]), change, 'wt')
            
            baseContent = file_content(componentPath + 'Base\\Base2.js')
            baseContent = baseContent.replace(config["comBaseContent"][0], config["comBaseContent"][1].format(cc[1].replace('.js','')) )
            file_writing(componentPath + '{}\\'.format(cc[0]) + cc[1], baseContent)
    
    elif c[0] == 'app_name' and len(c) == 3:
        androidString = file_content(androidStringPath())
        androidString = androidString.replace(config["app_name"][0].format(c[1]), config["app_name"][1].format(c[2]))
        file_writing(androidStringPath(), androidString, 'wt')

        iosPlist = file_content(iosPlistPath())
        iosPlist = iosPlist.replace(config["app_name_ios"][0].format(c[1]), config["app_name_ios"][1].format(c[2]))
        file_writing(iosPlistPath(), iosPlist, 'wt')
    elif c[0] == 'app_id':
        if os.path.isdir(androidPath() + 'app\\build'):
            shutil.rmtree(androidPath() + 'app\\build', ignore_errors=False, onerror=handleRemoveReadonly)

        app_ids = c[1].split('.')
        edit_app_ids = c[2].split('.')

        chk_paths = [
            androidPath() + 'app\\build.gradle',
            androidPath() + 'app\\src\\main\\AndroidManifest.xml',
            androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}\\'.format(app_ids[0],app_ids[1],app_ids[2]),
            androidPath() + 'app\\src\\main\\java\\{}\\{}'.format(app_ids[0],app_ids[1]),
            androidPath() + 'app\\src\\main\\java\\{}'.format(app_ids[0]),
            androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}\\MainActivity.java'.format(app_ids[0],app_ids[1],app_ids[2]),
            androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}\\MainApplication.java'.format(app_ids[0],app_ids[1],app_ids[2]),
            iosPath() + 'appBase2.xcodeproj\\project.pbxproj',
        ]

        chk = False

        for path in chk_paths:
            # print('fail', path, os.access(path, os.W_OK))
            if not os.access(path, os.W_OK):
                chk = True

        if chk:
            print('fail')
            break

        call_content = file_content(androidPath() + 'app\\build.gradle')
        call_content = call_content.replace(config["gradle"][0].format(c[1]), config["gradle"][0].format(c[2]))
        file_writing(androidPath() + 'app\\build.gradle', call_content, 'wt', 'utf-8')

        call_content = file_content(androidPath() + 'app\\src\\main\\AndroidManifest.xml')
        call_content = call_content.replace(config["manifest"][0].format(c[1]), config["manifest"][0].format(c[2]))
        file_writing(androidPath() + 'app\\src\\main\\AndroidManifest.xml', call_content, 'wt', 'utf-8')

        call_content = file_content(androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}\\MainActivity.java'.format(app_ids[0],app_ids[1],app_ids[2]) )
        call_content = call_content.replace(config["java"][0].format(c[1]), config["java"][0].format(c[2]))
        file_writing(androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}\\MainActivity.java'.format(app_ids[0],app_ids[1],app_ids[2]), call_content, 'wt', 'utf-8')

        call_content = file_content(androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}\\MainApplication.java'.format(app_ids[0],app_ids[1],app_ids[2]) )
        call_content = call_content.replace(config["java"][0].format(c[1]), config["java"][0].format(c[2]))
        file_writing(androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}\\MainApplication.java'.format(app_ids[0],app_ids[1],app_ids[2]), call_content, 'wt', 'utf-8')

        call_content = file_content(iosPath() + 'appBase2.xcodeproj\\project.pbxproj' )
        call_content = call_content.replace(config["ios_id1"][0].format(c[1]), config["ios_id1"][0].format(c[2]))
        call_content = call_content.replace(config["ios_id2"][0].format(c[1]), config["ios_id2"][0].format(c[2]))
        file_writing(iosPath() + 'appBase2.xcodeproj\\project.pbxproj', call_content, 'wt', 'utf-8')

        os.rename(androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}'.format(app_ids[0],app_ids[1],app_ids[2]), androidPath() + 'app\\src\\main\\java\\{}\\{}\\{}'.format(app_ids[0],app_ids[1],edit_app_ids[2]))
        os.rename(androidPath() + 'app\\src\\main\\java\\{}\\{}'.format(app_ids[0],app_ids[1]), androidPath() + 'app\\src\\main\\java\\{}\\{}'.format(app_ids[0],edit_app_ids[1]))
        os.rename(androidPath() + 'app\\src\\main\\java\\{}'.format(app_ids[0],), androidPath() + 'app\\src\\main\\java\\{}'.format(edit_app_ids[0]))
    elif c[0] == 'sdk_path':
        call_content = file_content(localPTSPath())
        call_content = call_content.replace(config["sdk_path"][0].format(c[1]), config["sdk_path"][0].format(c[2]))
        file_writing(localPTSPath(), call_content, 'wt', 'utf-8')
    elif c[0] == 'start_name':
        call_content = file_content(importPath() + 'config.js')
        call_content = call_content.replace(config["start_name"][0].format(c[1]), config["start_name"][0].format(c[2]))
        file_writing(importPath() + 'config.js', call_content, 'wt')
    elif c[0] == 'store_file':
        call_content = file_content(androidSignFilePath())
        call_content = call_content.replace(config["store_file"][0].format(c[1]), config["store_file"][0].format(c[2]))
        file_writing(androidSignFilePath(), call_content, 'wt', 'utf-8')
    elif c[0] == 'alias':
        call_content = file_content(androidSignFilePath())
        call_content = call_content.replace(config["alias"][0].format(c[1]), config["alias"][0].format(c[2]))
        file_writing(androidSignFilePath(), call_content, 'wt', 'utf-8')
    elif c[0] == 'store_password':
        call_content = file_content(androidSignFilePath())
        call_content = call_content.replace(config["store_password"][0].format(c[1]), config["store_password"][0].format(c[2]))
        file_writing(androidSignFilePath(), call_content, 'wt', 'utf-8')
    elif c[0] == 'key_password':
        call_content = file_content(androidSignFilePath())
        call_content = call_content.replace(config["key_password"][0].format(c[1]), config["key_password"][0].format(c[2]))
        file_writing(androidSignFilePath(), call_content, 'wt', 'utf-8')
    elif c[0] == 'res_del':
        paths = androidResPaths()
        for path in paths:
            file_list = os.listdir(path)
            for value in file_list:
                if value.find('node_modules') != -1:
                    os.remove(path + '\\' + value)

                if value.find('app.json') != -1:
                    os.remove(path + '\\' + value)
