from fabric.api import local, lcd
import os.path as op

def _compile_java_cli():
    with lcd('bottledtv_cli_client'):
        local('chmod +x ./gradlew')
        local('./gradlew build')


def build():
    #_fetch_upstream()
    #_compile_java_cli()
    pass


def run_dev():
    local('python ./habushu.py')

def run():
    local('gunicorn -w 2 -b 127.0.0.1:5000 habushu:app')
