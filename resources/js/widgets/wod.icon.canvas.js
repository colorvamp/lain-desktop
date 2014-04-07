widgets.wodIconCanvas = {
	vars: {},
	init: function(params){
		var wodIconCanvas = $C('UL',{className:'wodIconCanvas focusable',
			'icon': {
				'add': function(icons/* array of objects */){return widgets.wodIconCanvas.icon.add(wodIconCanvas,icons);},
				'remove': function(icons/* array of names*/){return widgets.wodIconCanvas.icon.remove(wodIconCanvas,icons);},
				'blur': function(icons/* array of names*/){return widgets.wodIconCanvas.icon.blur(wodIconCanvas,icons);},
				'get': {
					'selected': function(){return widgets.wodIconCanvas.icon.get.selected(wodIconCanvas);}
				}
			},
			'folder': {
				'create': function(){return widgets.wodIconCanvas.folder.create(wodIconCanvas);}
			},
			'on': {
				'cut': function(){return widgets.wodIconCanvas.on.cut(wodIconCanvas);},
				'paste': function(){return widgets.wodIconCanvas.on.paste(wodIconCanvas);}
			},
			'getFileRoute': function(){return this.getAttribute('data-fileRoute');},
			'setFileRoute': function(fileRoute){if(fileRoute[fileRoute.length-1] != '/'){fileRoute = fileRoute+'/';}return this.setAttribute('data-fileRoute',fileRoute);},
			'getIconParams': function(){var p = this.getAttribute('data-iconParams');return jsonDecode(p);},
			'setIconParams': function(p){if(p.fileRoute){this.setFileRoute(p.fileRoute);}return this.setAttribute('data-iconParams',jsonEncode(p));},
			'getIconPath': function(){var iProp = wodIconCanvas.getIconParams();return iProp.fileRoute+iProp.fileName+((iProp.fileName.length) ? '/' : '');},
			'signals':{
				'focus': function(e){return widgets.wodIconCanvas.signals.focus(wodIconCanvas,e);},
				'fileadd': function(e){return widgets.wodIconCanvas.signals.fileadd(wodIconCanvas,e);},
				'fileremove': function(e){return widgets.wodIconCanvas.signals.fileremove(wodIconCanvas,e);},
				'filedrop': function(e){return widgets.wodIconCanvas.signals.filedrop(wodIconCanvas,e);},
				'file': {
					'cut': function(e){return widgets.wodIconCanvas.signals.file.cut(wodIconCanvas,e);}
				}
			}
		});
		addEventListener('file.add',wodIconCanvas.signals.fileadd);
		addEventListener('file.remove',wodIconCanvas.signals.fileremove);
		addEventListener('file.cut',wodIconCanvas.signals.file.cut);
		wodIconCanvas.addEventListener('file.drop',wodIconCanvas.signals.filedrop);
		wodIconCanvas.addEventListener('mouse.down.right',function(e){widgets.wodIconCanvas.signals.mouse.down.right(wodIconCanvas,e);});
		wodIconCanvas.addEventListener('mouse.down.left' ,function(e){widgets.wodIconCanvas.signals.mouse.down.left(wodIconCanvas,e);});
		return wodIconCanvas;
	},
	icon: {
		add: function(wodIconCanvas,icons/* array of objects */){$each(icons,function(k,v){_icon.create(v,wodIconCanvas);});},
		remove: function(wodIconCanvas,iconNames){
			var found = [];var item = false;
			$each(wodIconCanvas.childNodes,function(k,v){var name = _icon.getFileName(v);if(iconNames.indexOf(name) > -1){found.push(v);}});
			while((icon = found.shift())){_icon.destroy(icon);}
		},
		blur: function(wodIconCanvas,iconNames){$each(wodIconCanvas.childNodes,function(k,v){var name = _icon.getFileName(v);if(iconNames.indexOf(name) > -1){_icon.blur(v,0);}});},
		get: {
			selected: function(wodIconCanvas){return wodIconCanvas.querySelectorAll('.wodIcon.selected');}
		}
	},
	folder: {
		create: function(wodIconCanvas){
			var iProp = wodIconCanvas.getIconParams();
			iProp = {'fileName':'','fileMime':'folder','fileRoute':iProp.fileRoute+iProp.fileName+'/'};
			var icon = _icon.create(iProp,wodIconCanvas);
			_icon.rename(icon);
		}
	},
	selection: {
		all: function(wodIconCanvas,e){
			//TODO
		},
		empty: function(wodIconCanvas,e){
			var icons = wodIconCanvas.icon.get.selected();
			$each(icons,function(k,v){_icon.unselect(v);});
		}
	},
	on: {
		paste: function(wodIconCanvas){
			var selection = _desktop.selection.icon.stash.get();
			var iProp = wodIconCanvas.getIconParams();
			_fs.move(iProp,selection);
		},
		cut: function(wodIconCanvas){
			var selection = wodIconCanvas.icon.get.selected();
			_desktop.selection.icon.stash.set(selection);
			var path = wodIconCanvas.getIconPath();
			var files = {};files[path] = [];
			$each(selection,function(k,v){var n = _icon.getFileName(v);files[path].push(n);});
			var event = new CustomEvent('file.cut',{'detail':files});dispatchEvent(event);
		}
	},
	signals: {
		mouse: {
			down: {
				left: function(wodIconCanvas,e){
					/* Selection start */
					var x = e.detail.clientX;var y = e.detail.clientY;
					//FIXME:tecla control o shift
					widgets.wodIconCanvas.selection.empty(wodIconCanvas,e);
					var candidate = document.elementFromPoint(x,y);
					var isIcon = $E.parent.find(candidate,{'className':'wodIcon'});
					if(isIcon){_icon.select(isIcon);return false;}
					widgets.wodIconCanvas.signals.mouse.selection.start(wodIconCanvas,e);
				},
				right: function(wodIconCanvas,e){
					var x = e.detail.clientX;var y = e.detail.clientY;
					var candidate = document.elementFromPoint(x,y);
					var isIcon = $E.parent.find(candidate,{'className':'wodIcon'});
					var selection = wodIconCanvas.icon.get.selected();

					switch(true){
						case (selection.length == 1):
							//FIXME: si es una carpeta?
							widgets.wodIconCanvas.vars.contextmenu = [
								{'text':'<i class="icon-ok"></i> Open','callback':function(e,params){params.target.open();}},
								{'text':'-'},
								//FIXME: falta eventos
								{'text':'<i class="icon-cut"></i> Cut','callback':function(e,params){wodIconCanvas.on.cut();}},
								{'text':'<i class="icon-copy"></i> Copy','callback':function(e,params){}},
								/*{'text':'<i class="icon-paste"></i> Paste','callback':function(e,params){}},*/
								{'text':'-'},
								{'text':'<i class="icon-trash"></i> Trash','callback':function(e,params){_fs.trash();}},
								{'text':'-'},
								{'text':'<i class="icon-plus-sign-alt"></i> Compress','callback':function(e,params){_fs.compress();}}
							];
							break;
						case (selection.length > 1):
							widgets.wodIconCanvas.vars.contextmenu = [
								{'text':'<i class="icon-cut"></i> Cut','callback':function(e,params){wodIconCanvas.on.cut();}},
								{'text':'<i class="icon-copy"></i> Copy','callback':function(e,params){}},
								{'text':'-'},
								{'text':'<i class="icon-trash"></i> Trash','callback':function(e,params){_fs.trash();}},
								{'text':'-'},
								{'text':'<i class="icon-plus-sign-alt"></i> Compress','callback':function(e,params){_fs.compress();}}
							];
							break;
						default:
							widgets.wodIconCanvas.vars.contextmenu = [
								{'text':'<i class="icon-paste"></i> Create new folder','callback':function(e,params){wodIconCanvas.folder.create();}},
								{'text':'-'},
								{'text':'<i class="icon-cut"></i> Paste','callback':function(e,params){wodIconCanvas.on.paste();}}
							];
					}

					wodContextMenu = new widget('widgets.wodContextMenu',{'event':e,'target':(isIcon) ? isIcon : false});
					wodContextMenu.set.params({'target':(isIcon) ? isIcon : candidate});
					wodContextMenu.items.load(widgets.wodIconCanvas.vars.contextmenu);
				}
			},
			selection: {
				start: function(wodIconCanvas,e){
					var x = e.detail.clientX;var y = e.detail.clientY;
					var pos = $getOffsetPosition(wodIconCanvas);
					var s = {'startX':x,'startY':y,'h':$_('lainFlowIcon'),'elemX':parseInt(pos.left),'elemY':parseInt(pos.top),'elemW':parseInt(pos.width),'elemH':parseInt(pos.height),'signals':{}};
					var selection = $C('DIV',{'className':'selection-square','.left':s.startX+'px','.top':s.startY+'px'},s.h);
					selection = extend(selection,s);
					selection.signals.mousemove = function(e){widgets.wodIconCanvas.signals.mouse.selection.move(wodIconCanvas,e,selection);};
					selection.signals.mouseup   = function(e){widgets.wodIconCanvas.signals.mouse.selection.end(wodIconCanvas,e,selection);}
					document.addEventListener('mousemove',selection.signals.mousemove,true);
					document.addEventListener('mouseup'  ,selection.signals.mouseup,true);
				},
				move: function(wodIconCanvas,e,selection){
					//if(!selection){var selection = document.querySelector}
					var eL = e.clientX - selection.startX;var eT = e.clientY - selection.startY;
					var left,top = 0;var width = 0;var height = 0;var d = 0;

					if(eL < 0){left = (selection.startX+(e.clientX-selection.startX));width = (eL*-1);}
					else{left = selection.startX;width = eL;}

					if(eT < 0){top = (selection.startY+(e.clientY-selection.startY));height = (eT*-1);}
					else{top = selection.startY;height = eT;}

					/* INI-Bounds */
					if(left < selection.elemX){d = selection.elemX-left;left = selection.elemX;width -= d;}
					if(left+width > selection.elemX+selection.elemW){d = (left+width)-(selection.elemX+selection.elemW);width -= d;}
					if(top < selection.elemY){d = selection.elemY-top;top = selection.elemY;height -= d;}
					if(top+height > selection.elemY+selection.elemH){d = (top+height)-(selection.elemY+selection.elemH);height -= d;}
					/* END-Bounds */

					selection.style.left = left+'px';
					selection.style.top = top+'px';
					selection.style.width = width+'px';
					selection.style.height = height+'px';

					widgets.wodIconCanvas.signals.mouse.selection.update(wodIconCanvas,e,selection);
				},
				end: function(wodIconCanvas,e,selection){
					//if(!selection){var selection = document.querySelector}
					document.removeEventListener('mousemove',selection.signals.mousemove,true);
					document.removeEventListener('mouseup',selection.signals.mouseup,true);
					/* If the control key is pressed we should check multi selection */
					//if(!e.ctrlKey){
						//this.vars.fileSelection.each(function(el){el.onUnSelect();});
						//this.vars.fileSelection.empty();
					//}
					widgets.wodIconCanvas.signals.mouse.selection.update(wodIconCanvas,e,selection);
					selection.parentNode.removeChild(selection);
				},
				update: function(wodIconCanvas,e,selection){
					$each(wodIconCanvas.childNodes,function(k,icon){
						if(_icon.isInsideSelection(icon,selection)){return _icon.select(icon,false);}
						return _icon.unselect(icon);
					});
				}
			}
		},
		file: {
			cut: function(wodIconCanvas,e){
				var files = e.detail;
				var path = wodIconCanvas.getIconPath();
				$each(wodIconCanvas.childNodes,function(k,v){_icon.unblur(v);});
				if(files[path]){wodIconCanvas.icon.blur(files[path]);}
			}
		},
		focus: function(wodIconCanvas,e){
			/* Restore the file selection to the global scope */
			var selection = wodIconCanvas.icon.get.selected();
			_desktop.selection.set(selection);
		},
		fileadd: function(wodIconCanvas,e){
			var files = e.detail;
			var path = wodIconCanvas.getIconPath();
			if(files[path]){wodIconCanvas.icon.add(files[path]);}
		},
		fileremove: function(wodIconCanvas,e){
			var files = e.detail;
			var path = wodIconCanvas.getIconPath();
			if(files[path]){wodIconCanvas.icon.remove(files[path]);}
		},
		filedrop: function(wodIconCanvas,e){
			var iProp = wodIconCanvas.getIconParams();
//FIXME: ya no se llama asi
			_fs.move(iProp);
		}
	}
};
