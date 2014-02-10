widgets.wodIframe = {
	init: function(){
		var wodIframe = $C('IFRAME',{className:'wodIframe',
			'set': {
				'src': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodIframe);return widgets.wodIframe.set.src.apply({},args);},
			}
		});
		return wodIframe;
	},
	set: {
		src: function(wodIframe,src){wodIframe.src = src;}
	}
}
