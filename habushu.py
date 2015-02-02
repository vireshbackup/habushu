from flask import Flask, request
from flask import render_template

from collections import namedtuple

app = Flask(__name__)

Series = namedtuple('Series', ['id', 'language', 'title', 'description'])
Episodes = namedtuple('Episodes', ['episodeNumber', 'episodeCode', 'seasonNumber', 'localFilePresent', 'firstAired', 'title'])
TBT = Series(1, 'en', 'The Big Bang Theory', 'test')
EP1 = Episodes(1, 1, 1, False, '2014-1-1', 'Sheldon\'s Space') 

@app.route('/')
@app.route('/home')
def welcome():
     return render_template('index.html')

@app.route('/browse')
def browse():
    search = request.args.get('search', '')
    return render_template('browse.html', search=search, seriesList=[TBT])

@app.route('/browse/<int:series_id>/<lang>')
def episodes(series_id, lang):
    search = request.args.get('search', '')
    return render_template('episodes.html', search=search, episodeList=[EP1], series=TBT)

if __name__ == '__main__':
    app.run(debug=True)
