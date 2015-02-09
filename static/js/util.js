$(document).ready(function ()
{
	// create click event on elements with class 'hyperlink'
	$('.hyperlink').each(function ()
	{
		var linkElement = $(this).find('a')[0];
		if (linkElement != undefined)
		{
			$(this).toggleClass('hand_cursor', true);
			$(this).click(function ()
			{
				window.location = linkElement.href;
			});
		}
	});

	// disable ajax caching
	$.ajaxSetup({cache: false});
});

displaySimpleDialog = function (message)
{
	lockBackground();
	$('#dialog').remove();
	$('body').append('<div id="dialog" class="dialog"><p>' + message + '</p></div>')
	$('#dialog').append('<input id="dialog_ok_button" type="submit" class="button" value="Ok"/>');
	$('#dialog > p').text(message);
	$('#dialog').center();
	$('#dialog_ok_button').click(function ()
	{
		unlockBackground();
		$('#dialog').remove();
	})
}

displayYesNoDialog = function (message, yesFunction, noFunction)
{
	lockBackground();
	$('#dialog').remove();
	$('body').append('<div id="dialog" class="dialog"><p>' + message + '</p></div>')
	$('#dialog').append('<input id="dialog_yes_button" type="submit" class="button" value="Yes"/>');
	$('#dialog').append('<input id="dialog_no_button" type="submit" class="button" value="No"/>');
	$('#dialog > p').text(message);
	$('#dialog').center();
	$('#dialog_yes_button').click(function ()
	{
		unlockBackground();
		$('#dialog').remove();
		if (yesFunction)
			yesFunction();
	});
	$('#dialog_no_button').click(function ()
	{
		unlockBackground();
		$('#dialog').remove();
		if (noFunction)
			noFunction();
	});
}

$.fn.center = function ()
{
	this.css('position', 'absolute');
	this.css('top', Math.max(0, (($(window).height() - this.outerHeight()) / 2) + $(window).scrollTop()) + 'px');
	this.css('left', Math.max(0, (($(window).width() - this.outerWidth()) / 2) + $(window).scrollLeft()) + 'px');
	this.toggleClass('hidden', false);
	return this;
}

lockBackground = function ()
{
	$('#overlay').remove();
	$('body').append('<div id="overlay" class="overlay"></div>');
	$('#overlay').css('width', $(document).width());
	$('#overlay').css('height', $(document).height());
}

unlockBackground = function ()
{
	$('#overlay').remove();
}

$(window).scroll(function ()
{
	$('#dialog').center();
	$('#overlay').css('width', $(document).width());
	$('#overlay').css('height', $(document).height());
});

$(window).resize(function ()
{
	$('#dialog').center();
	$('#overlay').css('width', $(document).width());
	$('#overlay').css('height', $(document).height());
});