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
	if (!$('#download_button_' + torrentHash).hasClass('active'))
	{
		if (!test)
		{
			$('#download_button_' + torrentHash).toggleClass('download', false);
			$('#download_button_' + torrentHash).toggleClass('waiting', true);
			$('#download_button_' + torrentHash).prop('title', 'waiting for download to start');
			$('#download_button_' + torrentHash).text('');
			$('#download_button_' + torrentHash)[0].onclick = null;

			// reset update progress interval
			clearInterval(updateProgressIntervalId);
			updateProgressIntervalId = setInterval(updateDownloadProgress, updateProgressTimeout);

			$.ajax({
				dataType: 'json',
				url: '/torrentAdd?torrentHash=' + torrentHash,
				data: null,
				success: function ()
				{
					$('#download_button_' + torrentHash).toggleClass('active', true);
				},
				error: function ()
				{
					$('#download_button_' + torrentHash).toggleClass('download', true);
					$('#download_button_' + torrentHash).toggleClass('waiting', false);
					$('#download_button_' + torrentHash).prop('title', 'download this torrent');
					$('#download_button_' + torrentHash).text('download');
					$('#download_button_' + torrentHash).click(function ()
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
	if ($('#download_button_' + torrentHash).hasClass('active') && !$('#download_button_' + torrentHash).hasClass('waiting'))
	{
		if (!progressMap[torrentHash])
			progressMap[torrentHash] = $('#download_button_' + torrentHash).text();

		$('#download_button_' + torrentHash).toggleClass('progress', false);
		$('#download_button_' + torrentHash).toggleClass('cancel', true);
		$('#download_button_' + torrentHash).prop('title', 'cancel download');
		$('#download_button_' + torrentHash).text('cancel');
		$('#download_button_' + torrentHash).click(function ()
		{
			cancelDownload(torrentHash, true);
		});
	}
}

disableCancelButton = function (torrentHash)
{
	if ($('#download_button_' + torrentHash).hasClass('active') && !$('#download_button_' + torrentHash).hasClass('waiting'))
	{
		$('#download_button_' + torrentHash).toggleClass('progress', true);
		$('#download_button_' + torrentHash).toggleClass('cancel', false);
		$('#download_button_' + torrentHash).prop('title', 'downloading');
		$('#download_button_' + torrentHash).text(progressMap[torrentHash]);
	}
}

cancelDownload = function (torrentHash, ask)
{
	if ($('#download_button_' + torrentHash).hasClass('active') && !$('#download_button_' + torrentHash).hasClass('waiting'))
	{
		if (!ask)
		{
			$('#download_button_' + torrentHash).toggleClass('cancel', false);
			$('#download_button_' + torrentHash).toggleClass('progress', false);
			$('#download_button_' + torrentHash).toggleClass('waiting', true);
			$('#download_button_' + torrentHash).toggleClass('active', false);
			$('#download_button_' + torrentHash).prop('title', 'download is being stopped');
			$('#download_button_' + torrentHash).text('');

			$.ajax({
				dataType: 'json',
				url: '/torrentRemove?torrentHash=' + torrentHash,
				data: null,
				success: function ()
				{
					$('#download_button_' + torrentHash).toggleClass('download', true);
					$('#download_button_' + torrentHash).toggleClass('waiting', false);
					$('#download_button_' + torrentHash).prop('title', 'download this torrent');
					$('#download_button_' + torrentHash).text('download');
					$('#download_button_' + torrentHash).click(function ()
					{
						addTorrent(torrentHash, true);
					});
				},
				error: function ()
				{
					displaySimpleDialog('Error trying to cancel this download. This may occur if the download does no longer exists (i.e. has already completed or has been removed by another user).');

					$('#download_button_' + torrentHash).toggleClass('download', true);
					$('#download_button_' + torrentHash).toggleClass('waiting', false);
					$('#download_button_' + torrentHash).prop('title', 'download this torrent');
					$('#download_button_' + torrentHash).text('download');
					$('#download_button_' + torrentHash).click(function ()
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
				if ($('#download_button_' + torrentHash).length > 0 && $('#download_button_' + torrentHash).hasClass('active'))
				{
					if (!$('#download_button_' + torrentHash).hasClass('cancel'))
					{
						$('#download_button_' + torrentHash).toggleClass('download', false);
						$('#download_button_' + torrentHash).toggleClass('waiting', false);
						$('#download_button_' + torrentHash).toggleClass('progress', true);
						$('#download_button_' + torrentHash).text(progress);
						$('#download_button_' + torrentHash).mouseenter(function ()
						{
							enableCancelButton(torrentHash);
						});
						$('#download_button_' + torrentHash).mouseleave(function ()
						{
							disableCancelButton(torrentHash);
						});
						$('#download_button_' + torrentHash).click(function ()
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

