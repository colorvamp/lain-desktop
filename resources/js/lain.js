var VAR_MIMES = {'folder':'lainExplorer','application/zip':'lainExplorer','image/jpeg':'eyeOfLain','image/png':'eyeOfLain','application/ogg':'melodiamePlayer','application/ogv':'lainPlayer'};
var VAR_apps = {'lain':{}};

function test(){
_desktop.signals.file_update('aa');
}
function window_create(id,style,holder){var w = _wodern.window_create(id,style,holder);
$E.class.remove(w,'hidden');
return w;
}
function window_container(w){return $C('DIV',{className:'wodThemeContainer contractable'},w);}
function window_container_init(w){
	var menuItems = w.$L('wodMenuItem');
//FIXME: deprecated
	if(menuItems.length){$each(menuItems,function(k,menuItem){menuItem.onclick = function(){_desktop.menu_show(menuItem);}});}
}

function OnDragStart(event){
	if(!event.dataTransfer){return;}
	//var format = event.dataTransfer.types ? "text/plain" : "Text";
	var appHtml = $_("wod_greenEnergy_container").innerHTML;
	var appApi = jsonClassEncode(VAR_apps['greenEnergy']);
	var app = {'appName':'greenEnergy','appApi':appApi,'appHtml':appHtml};
        event.dataTransfer.setData("pilgrimApp",jsonEncode(app));
}

function OnDropTarget(event){
	if(!event.dataTransfer){return;}
	var pilgrimApp = event.dataTransfer.getData('pilgrimApp');
	pilgrimApp = jsonDecode(pilgrimApp);

	VAR_apps[pilgrimApp.appName] = eval('('+pilgrimApp.appApi+')');
	launchApp(pilgrimApp.appName,$_('lainWindows'));
	//alert(print_r(eval("("+pilgrimApp.appApi+")")));

	event.stopPropagation();
	return false;
}

		function port(appName){
			var w = $_("wod_"+appName);
			if(!w){return;}
			h = w.windowContainer;

var s = window.getComputedStyle(h,null);
var color = s.backgroundColor;

			var v1 = $C("DIV",{".visibility":"hidden",".position":"absolute",".width":"100%",".height":"100%",".top":"0",".left":"0",".backgroundColor":color},w.windowContainer);
			eFadein(v1);
			var v2 = $C("DIV",{".visibility":"hidden",".position":"absolute",".width":"100%",".height":"100%",".top":"0",".left":"0",".backgroundColor":color},w.titleContainer);
			eFadein(v2);

			h.style.overflow = "hidden";

			var wObj = {'width':w.offsetWidth,'height':h.innerHeight()};
			eEaseHeight(h,26,false,false,false,true);
			eEaseWidth(w,64,false,false,false,true);

			w.titleContainer.onmousedown = false;
			w.draggable = true;
			w.ondragstart = function(event){OnDragStart(event);};
			w.ondragend = function(event){
				VAR_apps['systemMonitor'].app_kill(appName);
			};
			return wObj;
		}

		function unport(appName){
			var w = $_("wod_"+appName);
			if(!w){return;}
			h = w.windowContainer;

			eFadeout(w.windowContainer.lastChild,function(el){el.parentNode.removeChild(el);});
			eFadeout(w.titleContainer.lastChild,function(el){el.parentNode.removeChild(el);});

			var wObj = VAR_apps[appName].vars.ported;
			eEaseHeight(h,wObj.height,false,false,false,true);
			eEaseWidth(w,wObj.width,function(){
				h.style.overflow = "auto";
			},false,false,true);

			w.titleContainer.onmousedown = _littleDrag.onMouseDown;
			w.draggable = false;
			w.ondragstart = false;
		}

function launchApp(appName,params){
	var pool = 'r/apps/';
	var holder = launchApp_createHolder(appName);
	if(VAR_apps[appName]){VAR_apps[appName].init(holder,params);return;}
	$each(['js','css'],function(k,v){include_once(pool+appName+'/index.'+v,v);});
	$execWhenExists('VAR_apps.'+appName+'.init',[holder,params]);
}
function launchApp_createHolder(appName){
	var h = false;var holderName = 'holder_'+appName;
	lWindows = $_('lainWindows');
	$each(lWindows.childNodes,function(el){if(el.id == holderName){h = el;}});
	if(h){return h;};return $C('LI',{id:holderName},lWindows);
}

var _desktop = {
	vars: {},
	init: function(){
		_desktop.vars = {'bodyWidth':window.innerWidth,'bodyHeight':window.innerHeight,
			'clickDelay':400,
			'yOffset':30,'window_top':false,'wHighestZ':0,
			'currentContextMenu':false,'currentContextMenuClick':false,
			'fileOperation':false,'fileOrig':false,'fileDest':false,'fileSelection':[],
			'file_selection':[],'file_selectionSaved':[],
			'input_presedKeys':$A([]),'input_shorcutKeys':{}};

		VAR_wodInfo.marginRight = 4;
		_desktop.vars.cacheSeed = Math.random()*1000;
		document.addEventListener('mousedown',_desktop.signals.mouse_down,true);
		document.addEventListener('mouseup',_desktop.signals.mouse_up,true);
		document.addEventListener('click',_desktop.signals.mouse_click,true);
		document.addEventListener('keydown',_desktop.signals.key_down,true);
		document.addEventListener('keyup',_desktop.signals.key_up,true);
		document.addEventListener('contextmenu',function(e){e.preventDefault();e.stopPropagation();return false;},true);
		document.addEventListener('dragover',_desktop.signals_dragover,true);
		document.addEventListener('drop',_desktop.signals_drop,true);
		window.addEventListener('contextmenu',function(e){e.preventDefault();e.stopPropagation();return false;},true);
		window.addEventListener('resize',_desktop.signals.resize,true);

		var iconCanvas = new widget('widgets.wodIconCanvas');
		$_('lainDesktop').appendChild(iconCanvas);
//FIXME: esto va a _fs
		ajaxPetition('api/fs','subcommand=folder.list&fileRoute='+base64.encode('native:drive:/'),function(ajax){
			var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
			iconCanvas.setIconParams(r.folder);
			iconCanvas.icon.add(r.files);
		});

		var lainMenuHolder = document.querySelector('.lainDesktop > .lainMenu');
		/* INI-Menu Apps */
		var storageApps = document.querySelector('.lainStorage > .apps');
		if(storageApps){
			storageApps = $json.decode(storageApps.innerHTML);
			var wodMenu = new widget('widgets.wodMenu',{'title':'<i class="icon-cogs"></i> Applications'});
			lainMenuHolder.appendChild(wodMenu);
			$each(storageApps,function(k,v){
				var wodItem = wodMenu.item.add('<span class="icon16 icon_page_gear"></span>'+v.appName,function(e){launchApp(v.appCode);});
				if(v.appStatus && v.appStatus == 'disabled'){wodItem.disable();}
			});
		}
		/* END-Menu Apps */
		/* INI-Menu Places */
		var storagePlaces = document.querySelector('.lainStorage > .places');
		if(storagePlaces){
			storagePlaces = $json.decode(storagePlaces.innerHTML);
			var wodMenu = new widget('widgets.wodMenu',{'title':'<i class="icon-folder-close"></i> Places'});
			lainMenuHolder.appendChild(wodMenu);
			$each(storagePlaces,function(k,v){
				var wodItem = wodMenu.item.add('<span class="icon16 icon_'+v.placeType+'"></span>'+v.placeName,function(e){launchApp('lainExplorer',v.placeRoute);});
				if(v.placeStatus && v.placeStatus == 'disabled'){wodItem.disable();}
			});
			wodMenu.addEventListener('file.drop',function(e){
				var icon = e.detail;
				var iProp = _icon.getProperties(icon);
				if(iProp.fileMime == 'folder'){var wodItem = wodMenu.item.add('<span class="icon16 icon_'+iProp.fileMime+'"></span>'+iProp.fileName,function(e){launchApp('lainExplorer',iProp.fileRoute+iProp.fileName);});}
			});
		}
		/* END-Menu Places */
		/* INI-SystemTray*/
		var userData = document.querySelector('.lainStorage > .user');
		if(userData){
			var user = $json.decode(userData.innerHTML);
			var wodMenu = new widget('widgets.wodMenu',{'title':user.userName});
			wodMenu.item.add('<i class="icon-cog"></i> Config',function(){launchApp('lain.config');});
			wodMenu.item.add('<i class="icon-desktop"></i> Block screen',function(){});
			wodMenu.item.add('<i class="icon-info-sign"></i> About',function(){launchApp('lain.about');});
			wodMenu.item.add('<i class="icon-off"></i> Exit',function(){window.location.href += 'logout';});
			_desktop.tray.create(wodMenu);
		}
		/* END-SystemTray*/

		_desktop.signals.resize_end();
	},
	fileSelection_add: function(el){_desktop.vars.file_selection.push(el);},
	fileSelection_remove: function(el){var index = _desktop.vars.file_selection.indexOf(el);if(index > -1){_desktop.vars.file_selection.splice(index,1);}},
	fileSelection_get: function(){return _desktop.vars.file_selection;},
	fileSelection_empty: function(e){while(v = _desktop.vars.file_selection.shift()){v.onunselect(e,v);}_desktop.vars.file_selection = [];},
	fileSelection_selected: function(el){var index = _desktop.vars.file_selection.indexOf(el);return (index > -1);},
	fileSelection_save: function(){_desktop.vars.file_selectionSaved = _desktop.vars.file_selection.slice(0);return true;},
	fileSelection_getSaved: function(){return _desktop.vars.file_selectionSaved;},
	fileSelection_emptySaved: function(){_desktop.vars.file_selectionSaved = [];},
	signals_dragover: function(e){e.preventDefault();return false;},
	signals_drop: function(e){
		e.preventDefault();
		var h = $_('tray_desktop_progress');
		var info = info_create('tray_desktop_progress',{},h);
		var h = info.infoContainer;

		var dt = e.dataTransfer;var files = dt.files;
		$each(files,function(k,file){
			var fd = $C('DIV',{className:'fileTransferNode','.height':0},h);
			var c = $C('DIV',{className:'fileTransferMargin'},fd);
			$C('DIV',{className:'title',innerHTML:'Copying "'+file.name+'" to "Desktop"'},c);
			var line = $C('DIV',{className:'size'},c);
				var curS = $C('SPAN',{innerHTML:'0 bytes'},line);
				$C('SPAN',{innerHTML:' of '+_desktop.helper_bytesToSize(file.size)+' - '},line);
				var uplT = $C('SPAN',{innerHTML:''},line);//TODO: '6 minutes left'
				var uplS = $C('SPAN',{innerHTML:'(0 KB/s)'},line);
			var pbar = $C('DIV',{className:'progressBar'},c);
			var pbgr = $C('DIV',{className:'background'},pbar);
			var pfgr = $C('DIV',{className:'foreground'},pbar);
			eEaseEnter(fd);
			$uploadUpdate = function(node){
				curS.innerHTML = _desktop.helper_bytesToSize(node.fragment_actualSize);
				var timeLapse = node.fragment_timeEnd-node.fragment_timeLast;
				var seconds = timeLapse/1000;var uploadRate = _desktop.helper_bytesToSize(node.fragment_len/seconds)+'/sec';
				uplS.innerHTML = '('+uploadRate+')';
				var progress = $round((node.fragment_actualSize/parseInt(node.base64string_len))*100);
				pfgr.style.width = progress+'%';
			};
			$uploadEnd = function(){
				eEaseLeave(fd,{'callback':function(el){el.parentNode.removeChild(el);}});
			};
			uploadChain.appendFile(file,{'fileName':file.name,'fileRoute':'native:drive:/','fileSize':file.size,'onUploadUpdate':$uploadUpdate,'onUploadEnd':$uploadEnd});
		});
		info_reflow(info);

		uploadChain.onUploadEnd = function(){};
		uploadChain.upload_processFile();

		return false;
	},
	desktop_shorcutKey_check: function(){
		var inLen = _desktop.vars.input_presedKeys.length;
		var values = _desktop.vars.input_presedKeys.values();
		if(inLen > 3){return;}
		if(inLen == 3){
			/* CONTROL+SHIFT+B */
			//if(values == '16,17,66'){alert(1);}
			//return;
		}

		var w = _desktop.vars.window_top;
		if(!w || !w.input_shorcutKey){return;}
		if(w.input_shorcutKey[inLen][values]){w.input_shorcutKey[inLen][values]();return;}
	},
	desktop_shorcutKey_register: function(w,keyCodes,callback){
		if(keyCodes.length > 3 || keyCodes.length < 1){return;}
		if(!w.input_shorcutKey){w.input_shorcutKey = {'1':{},'2':{},'3':{}};}
		w.input_shorcutKey[keyCodes.length][keyCodes] = callback;
	},
	contextMenu_close: function(e){var ul = _desktop.vars.currentContextMenu;if(!ul){return false;}ul.parentNode.removeChild(ul);_desktop.vars.currentContextMenu = false;if(e){e.stopPropagation();}},

	desktop_properties: function(elem){
		var iProp = _icon.getProperties(elem);

		var h = elem.lastChild;
		if(h.tagName != 'UL'){return;}
		/* Avoid closing */
		$fix(h,{'onmousedown':function(e){e.stopPropagation();}}).empty();

		$C('LI',{className:'noSensitive',innerHTML:'Name: '+iProp.fileName},h);
		$C('LI',{className:'noSensitive',innerHTML:'Type: '+iProp.fileMime},h);
		$C('LI',{className:'noSensitive',innerHTML:'Size: '+$round(iProp.fileSize/1024)+'KB'},h);
		$C('HR',{},h);
		$C('LI',{className:'noSensitive',innerHTML:'Path: '+iProp.fileRoute},h);
		$C('LI',{className:'noSensitive',innerHTML:'Link: <a href="users/'+VAR_loggedUser.userAlias+'/drive'+iProp.fileRoute+'">'+iProp.fileName+'</a>'},h);
	},
	desktop_launch: function(iconElem){
		var iProp = _icon.getProperties(iconElem);
		if(iProp.fileMime == 'application/ogg' && iProp.fileName.match(/ogv$/)){iProp.fileMime = 'application/ogv';}
		if(!(appName = VAR_MIMES[iProp.fileMime])){return false;}
		launchApp(appName,iconElem);
	},
	fs_copy: function(icon){
//FIXME: comprobar si en destino existen ficheros con el mismo nombre
		var selection = _desktop.fileSelection_getSaved();if(!selection.length){return false;}var files = [];$each(selection,function(k,v){files.push(_icon.getProperties(v));});var target = _icon.getProperties(icon);
		ajaxPetition('api/fs','subcommand=file_copy&files='+base64.encode(jsonEncode(files))+'&target='+base64.encode(jsonEncode(target)),function(ajax){var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}_desktop.signals.file_update(r);_desktop.fileSelection_emptySaved();});
	},
	fs_move: function(icon){_fs.move(icon);},
	fs_paste: function(){
//FIXME: hay que pasar el destino por parámetros
return false;
		if(isEmpty(_desktop.vars.fileOperation)){return false;}
		var f = 'fs_'+_desktop.vars.fileOperation;
		var selection = _desktop.fileSelection_get();
		if(selection.length != 1){return false;}
		if(_desktop[f]){return _desktop[f](selection[0]);}
	},
	fs_trash: function(e){
return _fs.trash();
		var selection = _desktop.fileSelection_get();if(!selection.length){return false;}
		var files = [];$each(selection,function(k,v){files.push(_icon.getProperties(v));});
		ajaxPetition('api/fs','subcommand=file_trash&files='+base64.encode(jsonEncode(files)),function(ajax){
			var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
			$each(selection,function(k,v){if(v.ontrash){v.ontrash(e,v);}});
			_desktop.fileSelection_empty();
			_desktop.signals.file_update(r);
		});
	},
	time_stampToDate: function(t){
		var date = new Date(t*1000);
		return date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
	},
	mouse_controlDialog: function(){
		var i = $_("info_mouseControl");
		if(i){info_destroy(i);return;}

		info_create("mouseControl",{".left":"-100px",".width":"200px"},$_("mouseTrayIcon"),102);
		var h = $_("info_mouseControl_container");
		$C("H4",{innerHTML:"Preferencias del ratón"},h);
		$C("DIV",{".padding":"5px 0",innerHTML:"Tiempo de reacción en la pulsación doble. Aumente este tiempo si realiza pulsaciones rápidas."},h)
		var prec = $C("SPAN",{innerHTML:_littleDrag.vars.clickDelay+" ms"},$C("DIV",{innerHTML:"Tiempo Actual: "},h));

		var initialPercentage = (_littleDrag.vars.clickDelay/1000) * 100;
		_littleSlider.create("mouseControl",$C("DIV",{},h),function(percentage){
			_littleDrag.vars.clickDelay = $round(percentage*1000);
			prec.innerHTML = _littleDrag.vars.clickDelay+" ms";
		},initialPercentage);
	},
	menu_show: function(elem){
//FIXME: todos los menus de programas usan esta funcionalidad, hay que pasarlos a wodMenu
		if(elem.className == 'selected'){elem.className = '';return;}
		$A(elem.parentNode.childNodes).each(function(el){el.className = '';});
		elem.className = 'selected';
	},
	background_init: function(avoidCache){
		if(avoidCache){_desktop.vars.cacheSeed = Math.random()*1000;}
		var url = 'api/desktop/background_get?rnd='+_desktop.vars.cacheSeed;
		var b = $_('lainBackground');
//FIXME: hay samples de 200, USARLOS
		_lc.imageResize(url,this.vars.bodyWidth,this.vars.bodyHeight,'min',function(img){
			var prev = b.firstChild || false;
			var i = $C('IMG',{'.opacity':0,'.zIndex':1,src:img},b);
			if(prev){prev.$B({'.zIndex':-1});};
			eFadein(i,function(){if(prev){b.removeChild(prev);}},15);
		});
	},
	background_set: function(iconElem){
		var iProp = _icon.getProperties(iconElem);
		ajaxPetition('api/desktop/background_set/'+base64.encode(iProp.fileRoute+iProp.fileName),'',function(ajax){_desktop.background_init(1);});
	},
	helper_bytesToSize: function(bytes){
		var sizes = ['Bytes','KB','MB','GB','TB'];
		if(bytes == 0){return 'n/a';}
		var i = parseInt(Math.floor(Math.log(bytes)/Math.log(1024)));
		return Math.round(bytes/Math.pow(1024,i),2)+' '+sizes[i];
	}
};

var _fs = {
	create: function(f){
//alert(f);
	},
	move: function(icon){/* Icon es el destino, lo que deseamos mover lo cogemos de la selección */
		var selection = _desktop.fileSelection_getSaved();if(!selection.length){return false;}
		var files = [];$each(selection,function(k,v){files.push(_icon.getProperties(v));});
		var target = _icon.getProperties(icon);
		var params = {'subcommand':'file.move','files':base64.encode(jsonEncode(files)),'target':base64.encode(jsonEncode(target))};
		$ajax('api/fs',params,{
			'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}_desktop.signals.file_update(r);_desktop.fileSelection_emptySaved();}
		});
	},
	rename: function(icon,name){
		var target = _icon.getProperties(icon);
		var params = {'subcommand':'file.rename','file':base64.encode(jsonEncode(target)),'name':base64.encode(jsonEncode(name))};
		$ajax('api/fs',params,{
			'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}_desktop.signals.file_update(r);_desktop.fileSelection_emptySaved();}
		});
	},
	trash: function(){
		var selection = _desktop.fileSelection_getSaved();if(!selection.length){return false;}
		var files = [];$each(selection,function(k,v){files.push(_icon.getProperties(v));});
		var params = {'subcommand':'file.trash','files':base64.encode(jsonEncode(files))};
		$ajax('api/fs',params,{
			'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}_desktop.signals.file_update(r);_desktop.fileSelection_emptySaved();}
		});
	},
	compress: function(){
		var selection = _desktop.fileSelection_getSaved();if(!selection.length){return false;}var files = [];$each(selection,function(k,v){files.push(_icon.getProperties(v));});
		ajaxPetition('api/fs','subcommand=file.compress&files='+base64.encode(jsonEncode(files)),function(ajax){var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}_desktop.signals.file_update(r);_desktop.fileSelection_emptySaved();});
	}
};

var _icon = {
	create: function(iProp,h,s){
		/* Necesitamos actualizar el path del icono por si está siendo movido */
		var shortedText = (iProp.fileName.length > 13) ? iProp.fileName.substr(0,10)+'...' : iProp.fileName;

		var signals = {
			launch:function(){if(this.getAttribute('data-status') == 'rename'){return false;}_desktop.desktop_launch(this);},
			onrename:function(){_icon.rename(this);},
			onopen: function(e,el){_desktop.desktop_launch(this);},
			oncopy: function(e,el){_desktop.vars.fileOperation = 'copy';_desktop.fileSelection_save();},
			oncut: function(e,el){_desktop.vars.fileOperation = 'move';_desktop.fileSelection_save();},
			onpaste: function(e,el){if(!_icon.isFolder(this)){return false;}var f = 'fs_'+_desktop.vars.fileOperation;if(_desktop[f]){return _desktop[f](this);}},
			ontrash: function(e,el){_icon.destroy(el);},
			onselect: function(e,el){_icon.select(el,(e.which == 1)/* To switch selection */);},
			onunselect: function(e,el){_icon.unselect(el);},
			onmousedown: function(e,el){
				if(this.getAttribute('data-status') == 'rename'){return false;}
				if(e.which == 1){return _littleDrag.onMouseDown(e);}
				if(e.which == 3){return this.oncontextmenu(e,el);}
			}
		};
		if(s){signals = extend(signals,s);}
		var li = $C('LI',extend({className:'wodIcon icon32_'+iProp.fileMime+' dragable'},signals),h);
		li.$B({
			'open': function(){_icon.open(li);}
		});

		/* iconCanvas is allowed to navigate (not open in new window) */
//FIXME: esto no va aquí, pero bueno
		if(iProp.fileIsDir && li.parentNode.className == 'iconCanvas' && VAR_apps.lainExplorer){li.launch = function(){VAR_apps['lainExplorer'].list(h,h.innerPath+iProp.fileName+'/');};}
		$C('I',{innerHTML:jsonEncode(iProp)},li);
		var i = $C('IMG',{className:'icon32_generic icon32_'+iProp.fileMime,src:'r/images/t.gif'},$C('DIV',{className:'icon32_imgHolder'},li));
		$C('DIV',{className:'icon32_textHolder',innerHTML:shortedText},li);

		return li;
	},
	open: function(icon){
		//FIXME: si es una carpeta y estamos en un canvas solo navegar
		_desktop.desktop_launch(icon);
	},
	destroy: function(icon){
		icon.parentNode.removeChild(icon);
	},
	select: function(icon,swch){
		swch = typeof swch !== 'undefined' ? swch : 1;
		if($E.classHas(icon,'selected')){if(swch){return _icon.unselect(icon);}return false;}
		$E.classAdd(icon,'selected');
		_desktop.fileSelection_add(icon);
		_desktop.fileSelection_save();
		var iProp = _icon.getProperties(icon);
		icon.lastChild.innerHTML = iProp.fileName;
		var event = new CustomEvent('icon.select',{'detail':{'target':icon},'bubbles':true,'cancelable':true});icon.dispatchEvent(event);
	},
	unselect: function(icon){
		if(!$E.classHas(icon,'selected')){return false;}
		icon.setAttribute('data-status','unselect');
		$E.classRemove(icon,'selected');
		_desktop.fileSelection_remove(icon);
		_desktop.fileSelection_save();
		var iProp = _icon.getProperties(icon);
		var shortedText = (iProp.fileName.length > 13) ? iProp.fileName.substr(0,10)+'...' : iProp.fileName;
		icon.lastChild.innerHTML = shortedText;
		var event = new CustomEvent('icon.unselect',{'detail':{'target':icon},'bubbles':true,'cancelable':true});icon.dispatchEvent(event);
	},
	rename: function(icon){
		_icon.unselect(icon);
		icon.setAttribute('data-status','rename');
		var iProp = _icon.getProperties(icon);
		var h = $fix(icon.lastChild).empty();
		var iconName = iProp.fileName;
		/* See icon_onUnSelect for more details */
		var t = $C('TEXTAREA',{value:iconName,onmousedown:function(e){e.stopPropagation();}},h);
		t.focus();
		icon.rename_mousedown = function(e){return _icon.renameend(icon);};
		icon.rename_keydown   = function(e){
			switch(e.keyCode){
				case 13:return _icon.renameend(icon);break;
			}
		};
		icon.parentNode.addEventListener('mouse.down.left',icon.rename_mousedown);
		icon.parentNode.addEventListener('mouse.down.right',icon.rename_mousedown);
		t.addEventListener('keydown',icon.rename_keydown);
	},
	renameend: function(icon){
		var iconName = icon.$T('TEXTAREA')[0].value;
//FIXME: si ya existe?
if(isEmpty(iconName)){iconName = 'New Folder';}
		var iProp = _icon.getProperties(icon);
		_fs.rename(icon,iconName);
		icon.parentNode.removeEventListener('mouse.down.left',icon.rename_mousedown);
		icon.parentNode.removeEventListener('mouse.down.right',icon.rename_mousedown);
		_icon.destroy(icon);
		return false;
	},
	getProperties: function(elem){if(elem.fileRoute){return elem;}return jsonDecode(elem.querySelector('i').innerHTML);},
	setProperties: function(elem,iProp){var iPropEncoded = jsonEncode(iProp);elem.querySelector('i').innerHTML = iPropEncoded;return iPropEncoded;},
	isFolder: function(icon){var p = _icon.getProperties(icon);return p.fileMime == 'folder';},
	isInsideSelection: function(icon,selection){
		var pos = $getOffsetPosition(icon);
		var isPointInside = function(point,bounds){return (point.x > bounds.x && point.x < (bounds.x + bounds.w) && point.y > bounds.y && point.y < (bounds.y + bounds.h));};
//FIXME: faltan las cruces, cuando la seleccion pasa por encima sin tocar ninguno de los puntos
		var points = {'p1':{'x':pos.left,'y':pos.top},'p2':{'x':pos.left+pos.width,'y':pos.top},'p3':{'x':pos.left,'y':pos.top+pos.height},'p4':{'x':pos.left+pos.width,'y':pos.top+pos.height}};
		var bounds = {'x':selection.offsetLeft,'y':selection.offsetTop,'w':selection.offsetWidth,'h':selection.offsetHeight};
		if(isPointInside(points.p1,bounds) || isPointInside(points.p2,bounds) || isPointInside(points.p3,bounds) || isPointInside(points.p4,bounds)){return true;}
		return false;
	}
};

var _iface = {
	vars: {},
	init: function(){},
	reveal_folder_create: function(fileName,fileRoute,callback){
		var params = {'command':'folder_create','fileName':base64.encode(fileName),'fileRoute':base64.encode(fileRoute)};
		ajaxPetition('r/PHP/api.fs.php',$toUrl(params),function(ajax){var r = jsonDecode(ajax.responseText);
			if(typeof r.errorDescription != 'undefined'){
				//FIXME: TODO
				alert(ajax.responseText);
				return;	
			}
_desktop.signals.file_update({'add':[r]});
			if(callback){callback(r);}
		});
	},
	reveal_file_cache: function(file,callback){
		var path = file.fileIface+':'+file.fileRoute+file.fileName;
		var params = {'command':'file_cache','path':path};
		ajaxPetition('r/PHP/FM_reveal.php',$toUrl(params),function(ajax){
			var r = jsonDecode(ajax.responseText);
			if(parseInt(r.errorCode)>0){alert(print_r(r));return;}
			if(callback){callback(r.data);}
		});
	}
};

var uploadChain = {
	vars: {files:[],currentFile:false,uploadQueue:[]},
	onUploadEnd: function(){},
	appendFile: function(file,data){uploadChain.vars.files.push({'file':file,'data':data});},
	upload_processFile: function(){
		if(uploadChain.vars.files.length < 1){uploadChain.onUploadEnd();return true;}
		var file = uploadChain.vars.files.shift();
		//FIXME: usar blob: https://developer.mozilla.org/en-US/docs/Web/API/Blob http://kongaraju.blogspot.com.es/2012/07/large-file-upload-more-than-1gb-using.html
		var reader = new FileReader();
		reader.onloadend = function(){uploadChain.upload_processFile_onloadend(reader.result,file.data);};
		reader.readAsDataURL(file.file);
		return true;
	},
	upload_processFile_onloadend: function(result,data){
		var base64string = result.replace(/^[^,]*,/,'');
		var base64string_sum = md5(base64string);
		var base64string_len = base64string.length;
		var fragment_len = 100000;
		var i = 0;var c = 0;while(i < base64string_len){
			var top = i+fragment_len;if(top > base64string_len){top = base64string_len;}
			var fragment_string = base64string.substring(i,top);
			var fragment_sum = md5(fragment_string);
			//FIXME: no trozear aqui
			var node = {'fileName':data.fileName,'fileRoute':data.fileRoute,'fragment_num':c,'base64string_sum':base64string_sum,'base64string_len':base64string_len,'fragment_string':fragment_string,'fragment_sum':fragment_sum,'fragment_len':fragment_len};
			if(data.onUploadUpdate){node.onUploadUpdate = data.onUploadUpdate;}
			if(data.onUploadEnd){node.onUploadEnd = data.onUploadEnd;}
			uploadChain.vars.uploadQueue.push(node);
			i+=fragment_len;
			c++;
		}
		uploadChain.upload_fragment(uploadChain.vars.uploadQueue[0]);
	},
	upload_fragment: function(node){
		node.fragment_timeLast = new Date();
		var p = {'subcommand':'transfer_fragment','fileName':node.fileName,'fileRoute':node.fileRoute,'fragment_num':node.fragment_num,'base64string_sum':node.base64string_sum,'base64string_len':node.base64string_len,'fragment_string':node.fragment_string,'fragment_sum':node.fragment_sum,'fragment_len':node.fragment_len};
		ajaxPetition('api/fs',$toUrl(p),function(ajax){uploadChain.upload_fragment_callback(ajax,node);});
	},
	upload_fragment_callback: function(ajax,node){
		var r = jsonDecode(ajax.responseText);
		if(r.errorDescription){switch(r.errorDescription){
			//case 'FRAGMENT_ALREADY_EXISTS':r = node.fragment_len;break;
			//case 'FILE_ALREADY_EXISTS':uploadChain.upload_processFile();return;
			default:alert(print_r(r));return;
		}}
		var actualSize = parseInt(r.totalSize);
		var timeEnd = new Date();/* miliseconds */
		if(node.onUploadUpdate){do{
			/* Free memory */node.fragment_string = false;
			var nodeBack = extend(node,{'fragment_actualSize':actualSize,'fragment_timeEnd':timeEnd});
			if(typeof node.onUploadUpdate == 'function'){node.onUploadUpdate(nodeBack);break;}
			if(typeof node.onUploadEnd == 'string'){var func = window;var funcSplit = p.callback.split('.');for(i = 0;i < funcSplit.length;i++){func = func[funcSplit[i]];}func(nodeBack);}
		}while(false);}
		var c = node.fragment_num+1;if(!r.image_sum && uploadChain.vars.uploadQueue[c]){return uploadChain.upload_fragment(uploadChain.vars.uploadQueue[c]);}
		if(node.onUploadEnd){do{
			/* Free memory */node.fragment_string = false;
			if(typeof node.onUploadEnd == 'function'){node.onUploadEnd(node);break;}
			if(typeof node.onUploadEnd == 'string'){var func = window;var funcSplit = p.callback.split('.');for(i = 0;i < funcSplit.length;i++){func = func[funcSplit[i]];}func(node);}
		}while(false);}
	},
	helper_bytesToSize: function(bytes){var sizes = ['Bytes','KB','MB','GB','TB'];if(bytes == 0){return 'n/a';}var i = parseInt(Math.floor(Math.log(bytes)/Math.log(1024)));return Math.round(bytes/Math.pow(1024,i),2)+' '+sizes[i];}
};
