import tvdb_api
from flask import Flask, request
from flask import render_template

from tvdb_exceptions import tvdb_shownotfound

from collections import namedtuple

# FIXME add our own tvdb api key
t = tvdb_api.Tvdb(cache = True, banners = False, search_all_languages = True)
app = Flask(__name__)

Series = namedtuple('Series', ['id', 'language', 'title', 'description'])
Episodes = namedtuple('Episodes', ['episodeNumber', 'episodeCode', 'seasonNumber', 'localFilePresent', 'firstAired', 'title', 'description'])


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
    # TODO implement bottledtv cli client and call here
    return ''


@app.route('/updateDownloadProgress')
def downloadProgress():
    # TODO call bottledtv cli client here 
    return ''

if __name__ == '__main__':
    app.run(debug=True)
