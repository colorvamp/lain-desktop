_desktop.signals = {
	mouse_down: function(e){
		if(e.target.tagName == 'INPUT'){return true;}
		e.preventDefault();e.stopPropagation();
		var key_control = (_desktop.vars.input_presedKeys.indexOf(17) > -1);
		/* If the control key is pressed we should check multi selection, if after 
		 * climb 5 parent elements we dont find an iconCanvas, we are not in a icon pool */
		if(e.which == 1 && !key_control && $E.classParentHas(e.target,'iconCanvas',5)){_desktop.fileSelection_empty(e);}
		/* With the secondary button, we need to break a selection when the click 
		 * is not over almost one element in the current selection */
		if(e.which == 3){
			/* If the item is an icon and is one of the current selection too we must show the menu */
			if (  !((icon = $E.classParentHas(e.target,'wodIcon',5)) && _desktop.fileSelection_selected(icon))  ){
				_desktop.fileSelection_empty(e);
			}
		}

		var el = e.target;do{if(el.onselect){el.onselect(e,el);break;}el = el.parentNode;}while(el.parentNode);
		var el = e.target;do{if(el.onmousedown){return el.onmousedown(e,el);}el = el.parentNode;}while(el.parentNode);
		if(e.which == 1){return _desktop.signals.mouse_down_left(e);}
		if(e.which == 3){return _desktop.signals.mouse_down_right(e);}
	},
	mouse_up: function(e){
		e.preventDefault();e.stopPropagation();
		var el = e.target;do{if(el.onmouseup){return el.onmouseup(e);}el = el.parentNode;}while(el.parentNode);
		if(e.which == 1){return _desktop.signals.mouse_up_left(e);}
		if(e.which == 3){return _desktop.signals.mouse_up_right(e);}
	},
	mouse_click: function(e){
		//e.preventDefault();e.stopPropagation();
		if(_desktop.vars.currentContextMenu){/* FIXME: hacer de esto una api */_desktop.vars.currentContextMenu.parentNode.removeChild(_desktop.vars.currentContextMenu);_desktop.vars.currentContextMenu = false;}
	},
	mouse_down_left: function(e){
		return false;
	},
	mouse_down_right: function(e){
		/* The context menu on desktop expands on mousedown, no needed for complete click,
		 * Search for contectMenu */
		var el = e.target;do{if(el.oncontextmenu){el.oncontextmenu(e,el);break;}el = el.parentNode;}while(el.parentNode);
		return false;
	},
	mouse_up_left: function(e){
		return false;
	},
	mouse_up_right: function(e){
		return false;
	},
	key_down: function(e){
		_desktop.vars.input_presedKeys.push(e.keyCode);_desktop.vars.input_presedKeys.sort();
		//_desktop.desktop_shorcutKey_check();return false;
		//FIXME: si hay más de una tecla no seguir
		var selection = _desktop.fileSelection_get();
		/* DEL */if(e.keyCode == 46){if(selection.length > 0){return _desktop.fs_trash(selection);}}
		//alert(e.keyCode);
	},
	key_up: function(e){
		var index = _desktop.vars.input_presedKeys.indexOf(e.keyCode);if(index > -1){_desktop.vars.input_presedKeys.splice(index,1);}
	},
	resize: function(e){if(window.resizeTimer){clearTimeout(window.resizeTimer);window.resizeTimer = false;}window.resizeTimer = setTimeout(function(){_desktop.signals.resize_end(e);},500);},
	resize_end: function(e){
		window.resizeTimer = false;
		extend(_desktop.vars,{'bodyWidth':window.innerWidth,'bodyHeight':window.innerHeight});
		_desktop.icons_organize();
		_desktop.background_init();
	},
	file_update: function(files){
		//$A(files).each(function(elem){_desktop.icon_create(elem,iconCanvas);}.bind(this));
	},
	icon_drop: function(iconElem){
		//FIXME: faltaría moverlo de verdad
		
alert(iconElem);
	}
};
