# habushu
python in a Bottle(dTV)...

if you don't know what BottledTV is, then there's probably no point in looking at this code. 

REQUIREMENTS
 - ~~java >= 7~~
 - python >= 2.7 && < 3.0

BUILDING
 - make sure you have virtualenv installed (sudo pip install virtualenv)
 - create a virtualenv for habushu: mkvirtualenv habushu
 - enter the virtualenv: source PATH_TO_VIRTUALENVS/habushu/bin/activate
 - install requirements: pip install -r requirements.txt 
 - ~~fab build~~ (currently not necessary)

RUNNING
 - fab run_dev (runs a single-threaded dev server. NOT suitable for production)
 - fab run (runs a gunicorn server with two workers listening on localhost:5000)

STATUS
 - done: search, episodelist and episode-details
 - work in progress: torrent-search and download
 - planned features: integrate trakt.tv and display an overview page with "recent airings"
