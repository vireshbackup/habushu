from fabric.api import local, lcd
import os.path as op

DIRNAME = 'bottledtv/'

def _fetch_upstream():
    if op.isdir(DIRNAME):
        with lcd(DIRNAME):
            local('git pull')
    else:
        local('mkdir -p ' + DIRNAME)
        local('git clone git@bottledtvserver:BottledTV ' + DIRNAME)

def _copy_templates():
    #local('rm -rf templates/')
    local('mkdir -p templates/')
    local('mkdir -p static')
    local('cp %s/web/*.jsp templates/' % DIRNAME)
    local('cp -r %s/web/{css,js} static' % DIRNAME)

def _compile_java_cli():
    with lcd('bottledtv_cli_client'):
        local('chmod +x ./gradlew')
        local('./gradlew build')


def build():
    _fetch_upstream()
    _copy_templates()
    _compile_java_cli()

def run():
    local('python ./habushu.py')