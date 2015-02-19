import os, sys, inspect, shutil
import transmissionrpc

sys.path.append(os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe()))) + '/../')

from habushu import app

def check_torrents(dry_run):
    """
    check for downloads in state "seeding" and move their files
    into a configured directory. 
    """
    if not app.config['MOVE_AFTER_DOWNLOAD']:
        print 'moving disabled. exit.'
        return

    client = transmissionrpc.Client(
            app.config['TRANSMISSION_HOSTNAME'], 
            port=app.config['TRANSMISSION_PORT'],
            user=app.config['TRANSMISSION_USERNAME'],
            password=app.config['TRANSMISSION_PASSWORD']
        ) 

    for torrent in client.get_torrents():
        if torrent.status == 'seeding' or ( torrent.status == 'stopped' and (torrent.progress) == 100 ):
            if dry_run:
                print 'stopping: ' + torrent.name
            else:
                torrent.stop()

            for f in torrent.files().values():
                source_file = '%s/%s' % (app.config['TRANSMISSION_DOWNLOAD_DIR'], f['name'])
                target_dir = app.config['HABUSHU_COMPLETED_DIR']
                if dry_run:
                    print 'moving %s to %s' % (source_file, target_dir)
                else:
                    shutil.move(source_file, target_dir)

            if dry_run:
                print 'removing torrent' + torrent.name
            else:
                client.remove_torrent(torrent.hashString)


if __name__ == '__main__':
    if '-h' in sys.argv or '--help' in sys.argv:
        print """
        habushus download watcher. moves the files after download has completed.
        
        enable in configuration(habushu.cfg):
            MOVE_AFTER_DOWNLOAD = True
            TRANSMISSION_DOWNLOAD_DIR = 'path where transmission downloads to'
            HABUSHU_COMPLETED_DIR = 'path to where the files should be moved'

        
        USAGE:
            python download_watcher.py 
                move all completed downloads and stop seeding

            python download_watcher.py -h 
                show this help

            python download_watcher.py -n
                dry-run. do NOT move any files but display what would be done
        """
    else:
        check_torrents('-n' in sys.argv)
