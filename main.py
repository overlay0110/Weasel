from flask import Flask, render_template, jsonify, request
import os
import sqlite3
import json
import subprocess
import signal
import psutil
from pyfladesk import init_gui
import sys
import time

def resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    try:
        # PyInstaller creates a temp folder and stores path in _MEIPASS
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")

    return os.path.join(base_path, relative_path)

def file_path(filename = ''):
    scriptDir = os.path.dirname(os.path.realpath(__file__))
    path = scriptDir + os.path.sep + filename
    return path

def file_content(filename, file_return = 'None'):
    scriptDir = os.path.dirname(os.path.realpath(__file__))
    path = scriptDir + os.path.sep + filename

    result = ''
    read_offset = open(path, mode='r', encoding='utf-8-sig')

    if file_return == 'yes':
        return read_offset

    lines = read_offset.readlines()
    for line in lines:
        result += line
    read_offset.close()
    return result

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

def kill(proc_pid):
    process = psutil.Process(proc_pid)
    for proc in process.children(recursive=True):
        proc.kill()
    process.kill()

def select(tableName, field, where = ''):
    conn = sqlite3.connect(file_path("static\\devHepler.db"))
    conn.row_factory = dict_factory
    cur = conn.cursor()

    sql = "select {} from {} ".format(field, tableName)

    if str.strip(where) != '':
        sql += ('where '+where)

    cur.execute(sql)

    rows = cur.fetchall()
    conn.close()

    return rows

def update(sql):
    conn = sqlite3.connect(file_path("static\\devHepler.db"))
    cur = conn.cursor()
    print(sql)

    cur.execute(sql)
    conn.commit()
    conn.close()

def native_edit(option):
    print(option)
    # o, e = subprocess.Popen([ 'python', file_path('DevHelper.py') ], shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
    # print(o, e.decode('euc-kr'))

    if option['key'] == 'app_id':
        check = option['edit_value'].split('.')
        if len(check) != 3:
            return False

    proc = subprocess.Popen([ 'python', file_path('DevHelper.py') ], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, universal_newlines=True)
    proc.stdin.write('{} {} {}\n'.format(option['key'], option['value'], option['edit_value']))
    proc.stdin.write('exit\n')
    o, e = proc.communicate()

    print('o : ', o)
    print('e : ', e)
    
    if o.find('fail') != -1:
        return False
    
    proc.stdin.close()

    if e:
        return False

    return True

def getInterrupt():
    result = select('interrupt', '*')
    return result[0]['state']

def call(command, call_type=0):
    # env = os.environ
    # o, e = subprocess.Popen(command, env=env,shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()

    print('call start')
    if call_type == 0:
        p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        while True:
            check = getInterrupt()
            if check == 'yes':
                kill(p.pid)
                break
            line = p.stdout.readline()
            update('insert into logs(text) values(\'{}\')'.format(line.decode("utf-8").replace('\'', '\"' )))
            print(line)
            if not line:
                break
    elif call_type == 1:
        env = os.environ
        o, e = subprocess.Popen(command, env=env,shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).communicate()
        print(o, e)
        update('insert into logs(text) values(\'{}\')'.format(o.decode("utf-8").replace('\'', '\"' )))
        update('insert into logs(text) values(\'{}\')'.format(e.decode("utf-8").replace('\'', '\"' )))

print('프로그램 실행 중입니다. 잠시만 기다려주세요...')

if getattr(sys, 'frozen', False):
    template_folder = resource_path('templates')
    static_folder = resource_path('static')
    app = Flask(__name__, template_folder=template_folder, static_folder=static_folder)
else:
    app = Flask(__name__)

@app.route("/")
def main():
    app_data = select('app_info', '*')
    json_data = json.load(file_content('package.json','yes'))

    return render_template('index.html', app_data=app_data[0], json_data=json_data['dependencies'], json_cnt=len(json_data['dependencies']))

@app.route("/addScreen")
def addScreen():
    return render_template('add_screen.html')

@app.route("/appBuild")
def appBuild():
    update('delete from logs')
    return render_template('build.html')

@app.route("/page/<page>")
def page(page):
    return render_template('{}.html'.format(page), pageName=page )

@app.route("/appEdit", methods=['POST'])
def appEdit():
    response = {'code': '0', 'msg' : '변경 완료'}

    values = request.form
    para_key = values.get('key')
    para_value = values.get('value')
    para_edit_value = values.get('edit_value')

    if not native_edit({'key' : para_key, 'value' : para_value, 'edit_value' : para_edit_value }):
        response['code'] = 999
        response['msg'] = '변경 실패'
    else:
        update("update app_info set {}='{}' where id=1".format(para_key,para_edit_value))

    return jsonify(response), 200

@app.route("/appNode", methods=['POST'])
def appNode():
    response = {'code': '0', 'msg' : '추가 완료'}

    values = request.form
    v = values.get('v')

    call(['npm', 'install', '--save', v])

    update("update interrupt set state='no' where id=1")

    return jsonify(response), 200

@app.route("/runApp", methods=['POST'])
def runApp():
    response = {'code': '0', 'msg' : 'None', 'output' : '', 'error' : ''}

    bundle = 'react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\\app\\src\\main\\assets\\index.android.bundle --assets-dest android\\app\\src\\main\\res'
    bundle = bundle.split(' ')
    call(bundle)

    call(['react-native', 'run-android'])

    update("update interrupt set state='no' where id=1")

    return jsonify(response), 200

@app.route('/buildAPK', methods=['POST'])
def buildAPK():
    response = {'code': '0', 'msg' : 'None', 'output' : '', 'error' : ''}

    values = request.form
    log_type = values.get('log_type')
    
    bundle = 'react-native bundle --platform android --dev false --entry-file index.js --bundle-output android\\app\\src\\main\\assets\\index.android.bundle --assets-dest android\\app\\src\\main\\res'
    bundle = bundle.split(' ')
    call(bundle)

    native_edit({'key' : 'res_del', 'value' : 'value', 'edit_value' : 'edit_value' })

    call(['cd', 'android', '&', 'gradlew', 'assembleRelease'], int(log_type))

    path="./android/app/build/outputs/apk/release"
    path=os.path.realpath(path)
    os.startfile(path)

    update("update interrupt set state='no' where id=1")

    return jsonify(response), 200

@app.route('/stop', methods=['POST'])
def showAPK():
    response = {'code': '0', 'msg' : 'None', 'output' : '', 'error' : ''}
    
    update("update interrupt set state='yes' where id=1")

    return jsonify(response), 200

@app.route("/getLog", methods=['POST'])
def getLog():
    response = {'code': '0', 'msg' : 'None', 'output' : '', 'error' : ''}
    logs = select('logs', 'text')
    response['output'] = logs

    return jsonify(response), 200

if __name__ == '__main__':
    init_gui(app, width=1600, height=900)
    # app.run(host='0.0.0.0')