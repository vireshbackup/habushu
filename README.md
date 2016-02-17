# habushu
a frontend to thetvdb.com, a (well known) torrent website and the Transmission bittorrent client. habushu lets you search for tv-shows and displays all episodes grouped by season. It can connect to Transmision to start torrent downloads.
The use of this program may be illegal in your country. Please check before usage. The author does not take any responsibility for using this software for illegal purposes. 

EXAMPLE USAGE
 - search for something that you are legally allowed to download (e.g. something under a CC license)
 - click the show
 - choose an episode
 - search for torrents
 - click download

REQUIREMENTS
```
apt-get install python-virtualenv supervisor python-dev transmission-daemon python-lxml
```
 - python >= 2.7 && < 3.0
 - Transmission with a reachable webinterface (https://www.transmissionbt.com/)

INSTALL
 - make sure you have virtualenv installed (sudo pip install virtualenv)
 - create a virtualenv for habushu: virtualenv habushu --system-site-packages
 - enter the virtualenv: ```. PATH_TO_VIRTUALENVS/habushu/bin/activate```
 - install requirements: pip install -r requirements.txt 

RUNNING on cli
 - open habushu.cfg and configure it
 - ```. PATH_TO_VIRTUALENVS/habushu/bin/activate```
 - ```fab run_dev``` (runs a single-threaded dev server. NOT suitable for production)
 - ```fab run``` (runs a gunicorn server with two workers listening on localhost:5000)

RUNNING IN PRODUCTION
 - see ```examples/```
 - I recommend gunicorn started by supervisord behind nginx
    see https://serversforhackers.com/process-monitoring/
    and http://gunicorn-docs.readthedocs.org/en/latest/deploy.html
 - checkout tools/download_watcher.py. you may want to run this in a cronjob. don't forget to use the virtualenv-python version to run it. e.g. /path/to/habushu_virtualenv/bin/python /path/to/habushu/tools/download_watcher.py --help
 - you may want to password protect access to habushu. use your reverse-proxy (nginx or apache) for that. 

STATUS
 - done: search, episodelist and episode-details, torrent-search and download
 - planned feature I: integrate trakt.tv and display an overview page with "recent airings"
 - planned feature II: create a more mobile-friendly webinterface
