import os, sys, inspect, shutil
import transmissionrpc

# use habushu:app to access the configuration file
sys.path.append(os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe()))) + '/../')
from habushu import app


def check_torrents(dry_run):
    """
    check for downloads in state "seeding" and move the biggest file
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

    download_dir = app.config['TRANSMISSION_DOWNLOAD_DIR']
    target_dir = app.config['HABUSHU_COMPLETED_DIR']
    for torrent in client.get_torrents():
        if torrent.status == 'seeding' or ( torrent.status == 'stopped' and (torrent.progress) == 100 ):
            if dry_run:
                print 'stopping: ' + torrent.name
            else:
                torrent.stop()

            # find the biggest file and all subtitle-files (if available)
            files = sorted(torrent.files().values(), key=lambda f: f['size'], reverse=True)
            srt_files = list(filter(lambda f: f['name'].lower().endswith('.srt'), files))
            files_to_move = srt_files + [files[0]]
            files_to_move = map(lambda f: '{}/{}'.format(download_dir, f['name']), files_to_move)
            directory = os.path.dirname(files[0]['name'])
            if directory:
                target_dir = target_dir + '/' + directory
                if not os.path.exists(target_dir):
                    if dry_run:
                        print 'creating target directory: ' + target_dir
                    else:
                        os.mkdir(target_dir)
            if dry_run:
                for source_file in files_to_move:
                    print 'moving %s to %s' % (source_file, target_dir)
                print 'removing torrent ' + torrent.name
                if directory:
                    print 'removing directory %s/%s' % (app.config['TRANSMISSION_DOWNLOAD_DIR'], directory)
            else:
                for source_file in files_to_move:
                    shutil.move(source_file, target_dir)
                client.remove_torrent(torrent.hashString)
                if directory:
                    shutil.rmtree('%s/%s' % (app.config['TRANSMISSION_DOWNLOAD_DIR'], directory))


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
