from fabric.api import local, lcd
import os.path as op


def run_dev():
    local('python ./habushu.py')


def run():
    local('gunicorn -w 2 -b 127.0.0.1:5000 habushu:app')
