import re
import tvdb_api
import transmissionrpc

from collections import namedtuple

from flask import Flask, request
from flask import render_template
from flask import jsonify
from tvdb_exceptions import tvdb_shownotfound
from KickassAPI import Search

# FIXME add our own tvdb api key
t = tvdb_api.Tvdb(cache = True, banners = False, search_all_languages = True)
app = Flask(__name__)
app.config.from_pyfile('habushu.cfg', silent=True)

Series = namedtuple('Series', ['id', 'language', 'title', 'description'])
Episodes = namedtuple('Episodes', ['episodeNumber', 'episodeCode', 'seasonNumber', 'localFilePresent', 'firstAired', 'title', 'description'])


torrent_hash_matcher = re.compile('urn:btih:([^&]+)')

def _get_transmission_client():
    return transmissionrpc.Client(
            app.config['TRANSMISSION_HOSTNAME'], 
            port=app.config['TRANSMISSION_PORT'],
            user=app.config['TRANSMISSION_USERNAME'],
            password=app.config['TRANSMISSION_PASSWORD']
        )

def _show_as_tuple(show):
    return Series(int(show['id']), show['language'], show['seriesname'], show['overview'])


def _build_episode_list(tvdb_show):
    res = []
    for season in tvdb_show:
        for e in tvdb_show[season]:
            episode = tvdb_show[season][e]
            # FIXME episodeNumber, episodeCode ???
            res.append(Episodes(int(episode['episodenumber']), int(episode['episodenumber']), int(episode['seasonnumber']), False, episode['firstaired'], episode['episodename' ], ''))
    return res


@app.template_filter('find_hash')
def extract_hash_from_magnet(u):
    matches = torrent_hash_matcher.findall(u)
    return matches[0].lower() if len(matches) > 0 else ''


@app.route('/')
@app.route('/home')
def welcome():
     return render_template('index.html')


@app.route('/browse')
def browse():
    search = request.args.get('search', '')
    seriesList=[]
    try:
        # FIXME copying to namedtuple not really necessary... 
        show = t[search]
        seriesList.append(_show_as_tuple(show))
    except tvdb_shownotfound:
        pass
    return render_template('browse.html', search=search, seriesList=seriesList)


@app.route('/browse/<int:series_id>/<lang>')
def episodes(series_id, lang):
    show = _show_as_tuple(t[series_id])
    episodes = _build_episode_list(t[series_id])
    return render_template('episodes.html', search=request.args.get('search', ''), episodeList=episodes, series=show)


@app.route('/browse/<int:series_id>/<lang>/<int:season_no>/<int:episode_no>')
def detail(series_id, lang, season_no, episode_no):
    series = _show_as_tuple(t[series_id])
    e = t[series_id][season_no][episode_no]
    episode = Episodes(int(e['episodenumber']), int(e['episodenumber']), int(e['seasonnumber']), False, e['firstaired'], e['episodename'], e['overview'])
    return render_template('detail.html', search=request.args.get('search', ''), episode=episode, series=series)


@app.route('/torrentSearch')
def search():
    (show, season, episode) = request.args.get('episodeId', '0/0/').split('/')
    search_string = "%s S%02iE%02i" % (t[int(show)]['seriesname'], int(season), int(episode))
    torrents = []
    for r in Search(search_string):
        torrents.append(r)
    # sort the torrents. verified before unverified and then by seeders descending
    torrents = sorted(torrents, key=lambda torrent: 10 * int(torrent.seed) if torrent.verified_torrent else int(torrent.seed), reverse=True)
    return render_template('torrents.html', torrents=torrents)


@app.route('/torrentAdd')
def add_torrent():
    client = _get_transmission_client()
    magnet_url = request.args.get('magnet_url', '') 
    torrent = client.add_torrent(magnet_url)
    return jsonify({'success' : True})

@app.route('/updateDownloadProgress')
def downloadProgress():
    try:
        client = _get_transmission_client()
        status = []
        for torrent in client.get_torrents():
            status.append(( torrent.hashString.lower(), torrent.progress ))
        return jsonify(status)
    except transmissionrpc.TransmissionError:
        return 'transmission not reachable'

if __name__ == '__main__':
    app.run(debug=True)
