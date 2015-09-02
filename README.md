# habushu
a frontend to tvdb.com, a (well known) torrent website and transmissionbt. habushu lets you search for tv-shows and displays all episodes grouped by season. It can connect to transmissionbt to start torrent downloads.
The use of this program may be illegal in your country. Please check before usage. The author does not take any responsibility for using this software for illegal purposes. 

EXAMPLE USAGE
 - search for something that you are legally allowed to download (e.g. something under a CC license)
 - click the show
 - choose an episode
 - search for torrents
 - click download

REQUIREMENTS
 - python >= 2.7 && < 3.0
 - Transmission with a reachable webinterface (https://www.transmissionbt.com/)

BUILDING
 - make sure you have virtualenv installed (sudo pip install virtualenv)
 - create a virtualenv for habushu: mkvirtualenv habushu
 - enter the virtualenv: . PATH_TO_VIRTUALENVS/habushu/bin/activate
 - install requirements: pip install -r requirements.txt 

RUNNING on cli
 - open habushu.cfg and configure it
 - fab run_dev (runs a single-threaded dev server. NOT suitable for production)
 - fab run (runs a gunicorn server with two workers listening on localhost:5000)

RUNNING IN PRODUCTION
 - I recommend gunicorn started by supervisord behind nginx
    see https://serversforhackers.com/process-monitoring/
    and http://gunicorn-docs.readthedocs.org/en/latest/deploy.html
 - checkout tools/download_watcher.py. you may want to run this in a cronjob. don't forget to use the virtualenv-python version to run it. e.g. /path/to/habushu_virtualenv/bin/python /path/to/habushu/tools/download_watcher.py --help

STATUS
 - done: search, episodelist and episode-details, torrent-search and download
 - planned feature I: integrate trakt.tv and display an overview page with "recent airings"
 - planned feature II: create a more mobile-friendly webinterface
