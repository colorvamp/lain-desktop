_desktop.signals = {
	mouse_down: function(e){
		if(e.target.tagName == 'INPUT' || e.target.tagName == 'TEXTAREA'){return true;}
		e.preventDefault();e.stopPropagation();
		var el = e.target;do{if(el.onmousedown){var r = el.onmousedown(e,el);if(r === false){return false;}}if(!el.parentNode){break;}el = el.parentNode;}while(el.parentNode);

		var key_control = (_desktop.vars.input_presedKeys.indexOf(17) > -1);
		/* If the control key is pressed we should check multi selection, if after 
		 * climb 5 parent elements we dont find an iconCanvas, we are not in a icon pool */
//FIXME: creo que ya no es necesario
	//if(e.which == 1 && !key_control && $E.classParentHas(e.target,'wodIconCanvas',5)){_desktop.fileSelection_empty(e);}

		var el = e.target;do{if(el.onselect){el.onselect(e,el);break;}if(!el.parentNode){break;}el = el.parentNode;}while(el.parentNode);
		if(e.which == 1){return _desktop.signals.mouse_down_left(e);}
		if(e.which == 3){return _desktop.signals.mouse_down_right(e);}
	},
	mouse_up: function(e){
		e.preventDefault();e.stopPropagation();
		var el = e.target;do{if(el.onmouseup){return el.onmouseup(e);}el = el.parentNode;}while(el.parentNode);

		if(!_desktop.vars.currentContextMenuClick && _desktop.vars.currentContextMenu){_desktop.contextMenu_close();}
		if(_desktop.vars.currentContextMenuClick){_desktop.vars.currentContextMenuClick = false;}
		if(e.which == 1){return _desktop.signals.mouse_up_left(e);}
		if(e.which == 3){return _desktop.signals.mouse_up_right(e);}
	},
	mouse_click: function(e){

	},
	mouse_down_left: function(e){
		var event = new CustomEvent('mouse.down.left',{'detail':{'clientX':e.clientX,'clientY':e.clientY,'target':e.target},'bubbles':true,'cancelable':true});e.target.dispatchEvent(event);
		return false;
	},
	mouse_down_right: function(e){
		var event = new CustomEvent('mouse.down.right',{'detail':{'clientX':e.clientX,'clientY':e.clientY,'target':e.target},'bubbles':true,'cancelable':true});e.target.dispatchEvent(event);
		/* The context menu on desktop expands on mousedown, no needed for complete click,
		 * Search for contectMenu */
		var el = e.target;do{if(el.oncontextmenu){el.oncontextmenu(e,el);break;}el = el.parentNode;}while(el.parentNode);
		return false;
	},
	mouse_up_left: function(e){
		var event = new CustomEvent('mouse.up.left',{'detail':{'clientX':e.clientX,'clientY':e.clientY,'target':e.target},'bubbles':true,'cancelable':true});e.target.dispatchEvent(event);
		return false;
	},
	mouse_up_right: function(e){
		var event = new CustomEvent('mouse.up.right',{'detail':{'clientX':e.clientX,'clientY':e.clientY,'target':e.target},'bubbles':true,'cancelable':true});e.target.dispatchEvent(event);
		return false;
	},
	key_down: function(e){
		_desktop.vars.input_presedKeys.push(e.keyCode);_desktop.vars.input_presedKeys.sort();
		//_desktop.desktop_shorcutKey_check();return false;
		//FIXME: si hay más de una tecla no seguir
		var selection = _desktop.fileSelection_get();
		/* ENTER */if(e.keyCode == 13){
			$each(selection,function(k,elem){elem.launch();});
		}
		/* DEL   */if(e.keyCode == 46){if(selection.length > 0){return _fs.trash(selection);}}
		/* F2    */if(e.keyCode == 113){if(selection.length == 1){return selection[0].onrename();}}
		//alert(e.keyCode);
	},
	key_up: function(e){
		var index = _desktop.vars.input_presedKeys.indexOf(e.keyCode);
		while(index > -1){_desktop.vars.input_presedKeys.splice(index,1);var index = _desktop.vars.input_presedKeys.indexOf(e.keyCode);}
	},
	resize: function(e){if(window.resizeTimer){clearTimeout(window.resizeTimer);window.resizeTimer = false;}window.resizeTimer = setTimeout(function(){_desktop.signals.resize_end(e);},500);},
	resize_end: function(e){
		window.resizeTimer = false;
		extend(_desktop.vars,{'bodyWidth':window.innerWidth,'bodyHeight':window.innerHeight});
_desktop.background_init();
	},
	file_update: function(files){
		//document.addEventListener('fileRemove',function(e){alert(print_r(e.detail));},true)
		if(files.remove){
			var event = new CustomEvent('file.remove',{'detail':files.remove});dispatchEvent(event);
var event = new CustomEvent('fileRemove',{'detail':files.remove});document.dispatchEvent(event);
		}
		if(files.add){
			var event = new CustomEvent('file.add',{'detail':files.add});dispatchEvent(event);
var event = new CustomEvent('fileAdd',{'detail':files.add});document.dispatchEvent(event);
		}
	},
	icon_drop: function(iconElem){
		//FIXME: faltaría moverlo de verdad
		
//alert(iconElem);
	}
};
