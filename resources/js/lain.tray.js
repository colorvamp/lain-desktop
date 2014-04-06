_desktop.tray = {
	create: function(params){
		var lainTray = document.querySelector('.lainTray');if(!lainTray){return false;}
		if($is.element(params)){return lainTray.appendChild(params);}
		var wodItem = new widget('widgets.wodItem',params);
		lainTray.appendChild(wodItem);
		return wodItem;
	}
};
