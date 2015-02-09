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


def _compile_java_cli():
    with lcd('bottledtv_cli_client'):
        local('chmod +x ./gradlew')
        local('./gradlew build')


def build():
    #_fetch_upstream()
    #_compile_java_cli()
    pass


def run():
    local('python ./habushu.py')
