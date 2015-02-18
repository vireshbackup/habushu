var updateProgressIntervalId = undefined;
var updateProgressTimeout = 5000;
var progressMap = {};

toggleFilter = function ()
{
	if ($('#search_filter_box').hasClass('hidden'))
	{
		$('#search_filter_box').toggleClass('hidden', false);
		$('#toggle_filter_button').val('Hide filter settings');
	}
	else
	{
		$('#search_filter_box').toggleClass('hidden', true);
		$('#toggle_filter_button').val('Show filter settings');
	}
}

toggleDetailsBox = function (id)
{
	$('#details_box_' + id).toggleClass('hidden');
	$('#unfold_button_' + id).toggleClass('unfold_button');
	$('#unfold_button_' + id).toggleClass('fold_button');
}

searchTorrents = function (episodeId, language)
{
	// stop update progress interval
	if (updateProgressIntervalId)
	{
		clearInterval(updateProgressIntervalId);
		updateProgressIntervalId = undefined;
	}

	var acceptAvi = $('input[name="fileformatAvi"]').prop('checked');
	var acceptMp4 = $('input[name="fileformatMp4"]').prop('checked');
	var acceptMkv = $('input[name="fileformatMkv"]').prop('checked');
	var acceptMov = $('input[name="fileformatMov"]').prop('checked');

	var acceptUnknown = $('input[name="resolutionUnknown"]').prop('checked');
	var accept480p = $('input[name="resolution480p"]').prop('checked');
	var accept720p = $('input[name="resolution720p"]').prop('checked');
	var accept1080p = $('input[name="resolution1080p"]').prop('checked');

	var acceptKickassTorrents = $('input[name="acceptKickassTorrents"]').prop('checked');
	var acceptThePirateBay = $('input[name="acceptThePirateBay"]').prop('checked');

	$('#result_box').toggleClass('hidden', true);
	$('#loading_box').toggleClass('hidden', false);
	$('#result_box').load('/torrentSearch?episodeId=' + episodeId + '&language=' + language + '&acceptAvi=' + acceptAvi + '&acceptMp4=' + acceptMp4 + '&acceptMkv=' + acceptMkv + '&acceptMov=' + acceptMov + '&acceptUnknown=' + acceptUnknown + '&accept480p=' + accept480p + '&accept720p=' + accept720p + '&accept1080p=' + accept1080p + '&acceptKickassTorrents=' + acceptKickassTorrents + '&acceptThePirateBay=' + acceptThePirateBay + ' #result', function ()
	{
		$('#loading_box').toggleClass('hidden', true);
		$('#result_box').toggleClass('hidden', false);

		// set update progress interval
		if (!updateProgressIntervalId)
			updateProgressIntervalId = setInterval(updateDownloadProgress, updateProgressTimeout);
	});
}

addTorrent = function (torrentHash, test)
{
    var button = $(document.getElementById('download_button_' + torrentHash));
	if (!button.hasClass('active'))
	{
		if (!test)
		{
			button.toggleClass('download', false);
			button.toggleClass('waiting', true);
			button.prop('title', 'waiting for download to start');
			button.text('');
			button[0].onclick = null;

			// reset update progress interval
			clearInterval(updateProgressIntervalId);
			updateProgressIntervalId = setInterval(updateDownloadProgress, updateProgressTimeout);

            var magnet_url = $(document.getElementById(torrentHash + '_magnet_url')).val()
			$.ajax({
				dataType: 'json',
				url: '/torrentAdd?torrentHash=' + torrentHash,
				data: { 'magnet_url' : magnet_url },
				success: function ()
				{
					button.toggleClass('active', true);
				},
				error: function ()
				{
					button.toggleClass('download', true);
					button.toggleClass('waiting', false);
					button.prop('title', 'download this torrent');
					button.text('download');
					button.click(function ()
					{
						addTorrent(torrentHash, true);
					});

					displaySimpleDialog('Error trying to add torrent to the download queue. This may occur if another user has already started this download or Transmission is not running or accessible from BottledTV (i.e. invalid credentials).');
				}
			});
		}
		else
		{
			if ($('#local_file_available').length == 0)
			{
				addTorrent(torrentHash, false);
			}
			else
			{
				displayYesNoDialog('Downloading this episode might overwrite an already existing file on your file system. Do you want to proceed?', function ()
				{
					addTorrent(torrentHash, false);
				}, null);
			}
		}
	}
}

enableCancelButton = function (torrentHash)
{
    var button = $(document.getElementById('download_button_' + torrentHash));
	if (button.hasClass('active') && !button.hasClass('waiting'))
	{
		if (!progressMap[torrentHash])
			progressMap[torrentHash] = button.text();

		button.toggleClass('progress', false);
		button.toggleClass('cancel', true);
		button.prop('title', 'cancel download');
		button.text('cancel');
		button.click(function ()
		{
			cancelDownload(torrentHash, true);
		});
	}
}

disableCancelButton = function (torrentHash)
{
    var button = $(document.getElementById('download_button_' + torrentHash));
    if (button.hasClass('active') && !button.hasClass('waiting'))
	{
		button.toggleClass('progress', true);
		button.toggleClass('cancel', false);
		button.prop('title', 'downloading');
		button.text(progressMap[torrentHash]);
	}
}

cancelDownload = function (torrentHash, ask)
{
    var button = $(document.getElementById('download_button_' + torrentHash));
	if (button.hasClass('active') && !button.hasClass('waiting'))
	{
		if (!ask)
		{
			button.toggleClass('cancel', false);
			button.toggleClass('progress', false);
			button.toggleClass('waiting', true);
			button.toggleClass('active', false);
			button.prop('title', 'download is being stopped');
			button.text('');

			$.ajax({
				dataType: 'json',
				url: '/torrentRemove?torrentHash=' + torrentHash,
				data: null,
				success: function ()
				{
					button.toggleClass('download', true);
					button.toggleClass('waiting', false);
					button.prop('title', 'download this torrent');
					button.text('download');
					button.click(function ()
					{
						addTorrent(torrentHash, true);
					});
				},
				error: function ()
				{
					displaySimpleDialog('Error trying to cancel this download. This may occur if the download does no longer exists (i.e. has already completed or has been removed by another user).');

					button.toggleClass('download', true);
					button.toggleClass('waiting', false);
					button.prop('title', 'download this torrent');
					button.text('download');
					button.click(function ()
					{
						addTorrent(torrentHash, true);
					});
				}
			});
		}
		else
		{
			displayYesNoDialog('Are you sure you want to cancel this download?', function ()
			{
				cancelDownload(torrentHash, false);
			});
		}
	}
}

updateDownloadProgress = function ()
{
	$.ajax({
		dataType: 'json',
		url: '/updateDownloadProgress',
		data: null,
		success: function (result)
		{
			$.each(result, function (torrentHash, progress)
			{
                var button = $(document.getElementById('download_button_' + torrentHash));
				if (button.length > 0 && button.hasClass('active'))
				{
					if (!button.hasClass('cancel'))
					{
						button.toggleClass('download', false);
						button.toggleClass('waiting', false);
						button.toggleClass('progress', true);
						button.text(progress);
						button.mouseenter(function ()
						{
							enableCancelButton(torrentHash);
						});
						button.mouseleave(function ()
						{
							disableCancelButton(torrentHash);
						});
						button.click(function ()
						{
							cancelDownload(torrentHash, true);
						});
					}

					progressMap[torrentHash] = progress;

					if (progress == '100%')
					{
						// set file available indicator to 'available'
						$('#local_file_not_available').prop('id', 'local_file_available');
						$('#local_file_available').prop('src', 'img/dot_green.png');
						$('#local_file_available').prop('title', 'local file is available');
					}
				}
			});
		}
	});
}

