var VAR_lain = {'bodyWidth':0,'bodyHeight':0};
var lWindows = false;
var VAR_MIMES = {'folder':'lainExplorer','image/jpeg':'eyeOfLain','image/png':'eyeOfLain','application/ogg':'melodiamePlayer','application/ogv':'lainPlayer'};

function window_create(id,style,holder){
	if($_('wod_'+id)){return $_('wod_'+id);}
	if(!style){var style = {};}extend(style,{'id':'wod_'+id,className:'wodern dragable'+(style.className ? ' '+style.className : ''),'.zIndex':_desktop.window_getWindowZ()});
	var w = $C('DIV',style);
	w.onclick = function(e){_desktop.window_signals_click(e,w);};
	w.titleContainer = $C('DIV',{className:'wodThemeTitle'},w);
	w.titleContainer.onmousedown = _littleDrag.onMouseDown;
	if(style.wodTitle){$C('H1',{className:'wodTitle','id':'wod_'+id+'_title',innerHTML:style.wodTitle},w.titleContainer);}
	$C('IMG',{className:'wodThemeTitleButton wodButtonClose',src:'r/images/t.gif',onmousedown:function(e){e.stopPropagation();},onclick:function(){window_destroy(w);}},w.titleContainer);
	w.windowContainer = $C('DIV',{className:'wodThemeContainer contractable','id':'wod_'+id+'_container'},w);
	if(holder){holder.appendChild(w);}
	return w;
}
function window_destroy(el,ev){
	while(el.parentNode && !el.className.match(/^wodern( |$)/)){el = el.parentNode;}if(!el.parentNode){return;}
	if(el.beforeRemove){el.beforeRemove();};var afterRemove = function(){};if(el.afterRemove){afterRemove=el.afterRemove;}
	el.parentNode.removeChild(el);if(ev){ev.stopPropagation();}afterRemove();
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

function themeTab_createBar(id,style,holder,tabs){
	style.className = 'wodTabCanvas' + (style.className ? ' '+style.className : '');
	style.id = 'wodTabCanvas_'+id;
	var w = $C("DIV",style,holder);
	if(!tabs){return w;}
	$A(tabs).each(function(elem,num){
		var t = $C("LI",{className:"wodTab" + (num==0 ? "Selected" : ""),onmousedown:function(e){e.preventDefault();},onclick:function(){themeTab_selectOne(this);}},w);
		var t = $C("DIV",{className:"wodTabLeft"},t);
		var t = $C("DIV",{className:"wodTabRight"},t);
		var t = $C("DIV",{className:"wodTabCenter",innerHTML:elem.name},t);
	});
	return w;
}
function themeTab_selectOne(el){
	var tabs = $fix(el.parentNode).$T("LI");
	$A(tabs).each(function(elem){elem.className = elem.className.replace(/wodTabSelected/,"wodTab");});
	el.className = el.className.replace(/wodTab/,"wodTabSelected");
}

function menu_switch(el){
	if(el.className.match(/visible$/)){el.className = el.className.replace(/visible$/,'');return;}
	$A(el.parentNode.childNodes).each(function(node){if(!node.className){return};node.className = node.className.replace(/visible$/,'');});
	el.className += 'visible';
}

var VAR_apps = {};
var VAR_appsPath = 'resources/apps/';
function launchApp(appName,holder,params){
	var pool = 'r/apps/';
	if(VAR_apps[appName]){VAR_apps[appName].init(holder,params);return;}
	$each(['js','css'],function(k,v){include_once(pool+appName+'/index.'+v,v);});
	$execWhenExists('VAR_apps.'+appName+'.init',[holder,params]);
}
function launchApp_createHolder(appName){
	var h = false;var holderName = 'holder_'+appName;
	$each(lWindows.childNodes,function(el){if(el.id == holderName){h = el;}});
	if(h){return h;};return $C('LI',{id:holderName},lWindows);
}

var _desktop = {
	vars: {},
	init: function(){
		_desktop.vars = {'bodyWidth':window.innerWidth,'bodyHeight':window.innerHeight,'yOffset':30,'window_top':false,'wHighestZ':0,'currentContextMenu':false,
			'fileOperation':false,'fileOrig':false,'fileDest':false,'fileSelection':$A([]),
			'input_presedKeys':$A([]),'input_shorcutKeys':{}};

		VAR_wodInfo.marginRight = 4;
		_desktop.vars.cacheSeed = Math.random()*1000;
		document.addEventListener('dragover',_desktop.signals_dragover,true);
		document.addEventListener('drop',_desktop.signals_drop,true);
		document.addEventListener('mousedown',_desktop.signals_mousedown,true);
		window.addEventListener('resize',_desktop.signals_resize,true);
		_desktop.signals_resizeEnd();
		lWindows = $_('lainWindows');
	},
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
	desktop_signals_load: function(){
		var ths = this;
		window.oncontextmenu = function(e){return ths.desktop_mouseRightClick(e);};
		var a = $_('lainPlacesMenu_itemList',{'onDropElement':this.menu_places_mouseDown});
	},
	signals_resize: function(e){
		if(window.resizeTimer){clearTimeout(window.resizeTimer);window.resizeTimer = false;}
		window.resizeTimer = setTimeout(function(){_desktop.signals_resizeEnd(e);},500);
	},
	signals_resizeEnd: function(e){
		window.resizeTimer = false;
		extend(_desktop.vars,{'bodyWidth':window.innerWidth,'bodyHeight':window.innerHeight});
		_desktop.icons_organize();
		_desktop.background_init();
	},
	desktop_signals_keyPress: function(e){
		/* ENTER */if(e.keyCode == 13){
			//FIXME: puede ser un intro porque se está canbiando el nombre de una carpeta
			this.vars.fileSelection.each(function(elem){elem.launch();});
		}
		/* DEL */if(e.keyCode == 46){if(this.vars.fileSelection.length > 0){this.file_trash(this.vars.fileSelection);}}
		/* LEFTCUR */if(e.keyCode == 37){
			if(this.vars.fileSelection.length > 0){
				var elem = this.vars.fileSelection[0];
				if(this.vars.fileSelection.length == 1 && elem == elem.parentNode.firstChild){return;}
				this.vars.fileSelection.empty();
				elem.onUnSelect();
				if(elem.previousSibling){elem.previousSibling.onSelect();}
				else{elem.parentNode.firstChild.onSelect();}
			}
		}
		/* RIGHTCUR */if(e.keyCode == 39){
			if(this.vars.fileSelection.length > 0){
				var elem = this.vars.fileSelection[this.vars.fileSelection.length-1];
				if(this.vars.fileSelection.length == 1 && elem == elem.parentNode.lastChild){return;}
				this.vars.fileSelection.empty();
				elem.onUnSelect();
				if(elem.nextSibling){elem.nextSibling.onSelect();}
				else{elem.parentNode.lastChild.onSelect();}
			}
		}
		/* F2 */if(e.keyCode == 113){
			if(this.vars.fileSelection.length == 1){
				var elem = this.vars.fileSelection[0];
				var iProp = this.icon_getProperties(elem);
				var h = $fix(elem.lastChild).empty();
				var iconName = iProp.fileName;
				/* See icon_onUnSelect for more details */
				var t = $C('TEXTAREA',{value:iconName,onmousedown:function(e){e.stopPropagation();}},h).focus();
			}
		}
		//alert(e.keyCode);
		//alert(e.ctrlKey);
	},
	desktop_signals_keyDown: function(e){this.vars.input_presedKeys.push(e.keyCode);this.vars.input_presedKeys.sort();this.desktop_shorcutKey_check();return false;},
	desktop_signals_keyUp: function(e){this.vars.input_presedKeys.remove(e.keyCode);/*alert(this.vars.input_presedKeys.values());/**/return false;},
	desktop_shorcutKey_check: function(){
		var inLen = this.vars.input_presedKeys.length;
		var values = this.vars.input_presedKeys.values();
		if(inLen > 3){return;}
		if(inLen == 3){
			/* CONTROL+SHIFT+B */
			//if(values == '16,17,66'){alert(1);}
			//return;
		}

		var w = this.vars.window_top;
		if(!w || !w.input_shorcutKey){return;}
		if(w.input_shorcutKey[inLen][values]){w.input_shorcutKey[inLen][values]();return;}
	},
	desktop_shorcutKey_register: function(w,keyCodes,callback){
		if(keyCodes.length > 3 || keyCodes.length < 1){return;}
		if(!w.input_shorcutKey){w.input_shorcutKey = {'1':{},'2':{},'3':{}};}
		w.input_shorcutKey[keyCodes.length][keyCodes] = callback;
	},
	desktop_mouseClick: function(e){
		if(_desktop.vars.currentContextMenu){_desktop.vars.currentContextMenu.parentNode.removeChild(_desktop.vars.currentContextMenu);_desktop.vars.currentContextMenu = false;}
		
	},
	signals_mousedown: function(e){
		if(_desktop.vars.currentContextMenu){_desktop.vars.currentContextMenu.parentNode.removeChild(_desktop.vars.currentContextMenu);_desktop.vars.currentContextMenu = false;}

		if(e.target.tagName == 'INPUT'){return true;}
		if((e.target.tagName == 'LI' || e.target.parentNode.tagName == 'LI') && e.target.className.match(/button/)){return true;}
		if(e.target.id == 'lainDesktop'){e.preventDefault();_desktop.desktop_selection_start(e);return true;}

		/* If the control key is pressed we should check multi selection */
		if(!e.ctrlKey){
			_desktop.vars.fileSelection.each(function(el){el.onUnSelect();});
			_desktop.vars.fileSelection.empty();
		}
		/* Icon selection - Right clic can't start a file selection */
		if(e.which != 3 && e.target && e.target.className.match(/^icon32_/)){
			var elem = e.target;var isIcon = false;
			var lim = 3;while(elem.parentNode && lim > 0){if(elem.parentNode.className && elem.parentNode.className.match(/desktop_icon/)){isIcon = true;lim = 0;};elem = elem.parentNode;lim--;}
			if(isIcon){elem.onSelect();}
		}
		e.preventDefault();
	},
	desktop_mouseRightClick: function(e){
		this.vars.fileSelection.each(function(el){el.onUnSelect();});
		this.vars.fileSelection.empty();

		/* Fired on oncontextmenu event - detect if target is an icon and make a custom themed context menu */
		var elem = e.target;var isIcon = false;
		if(elem.className.match(/desktop_icon/)){isIcon = true;};
		var lim = 3;while(elem.parentNode && lim > 0){if(elem.parentNode.className && elem.parentNode.className.match(/desktop_icon/)){isIcon = true;lim = 0;};elem = elem.parentNode;lim--;}
		if(isIcon){elem.onSelect();elem.onContextMenu(elem);return false;}
		return true;
	},
	desktop_selection_start: function(e){
		var s = {'startX':e.clientX,'startY':e.clientY,'h':$_('lainFlowIcon')};
		var elem = $C('DIV',{'id':'selectionSquare','.left':s.startX+'px','.top':s.startY+'px'},s.h);
		elem = extend(elem,s);
		elem.mouseMoveHandler = function(e){return _desktop.desktop_selection_move(e,elem);}
		elem.mouseUpHandler = function(e){return _desktop.desktop_selection_end(e,elem);}
		document.addEventListener('mousemove',elem.mouseMoveHandler,true);
		document.addEventListener('mouseup',elem.mouseUpHandler,true);
	},
	desktop_selection_move: function(e,elem){
		var eL = e.clientX - elem.startX;var eT = e.clientY - elem.startY;
		if(eL < 0){elem.style.left = (elem.startX+(e.clientX-elem.startX))+'px';elem.style.width = (eL*-1)+'px';}
		else{elem.style.left = elem.startX+'px';elem.style.width = eL+'px';}
		if(eT < 0){elem.style.top = (elem.startY+(e.clientY-elem.startY))+'px';elem.style.height = (eT*-1)+'px';}
		else{elem.style.top = elem.startY+'px';elem.style.height = eT+'px';}
	},
	desktop_selection_end: function(e,elem){
		document.removeEventListener('mousemove',elem.mouseMoveHandler,true);
		document.removeEventListener('mouseup',elem.mouseUpHandler,true);
		/* If the control key is pressed we should check multi selection */
		if(!e.ctrlKey){
			this.vars.fileSelection.each(function(el){el.onUnSelect();});
			this.vars.fileSelection.empty();
		}
		elem.parentNode.removeChild(elem);
	},
	desktop_fileOperations: function(op,elem){if(this['desktop_'+op]){this['desktop_'+op](elem);}},
	desktop_cut: function(elem){
		this.vars.fileOrig = elem;
		this.vars.fileOperation = 'cut';
	},
	desktop_paste: function(elem){
		if(_desktop.vars.fileOperation != 'cut' && _desktop.vars.fileOperation != 'copy'){return;}
		var iconElem = _desktop.vars.fileOrig;

		var iProp = _desktop.icon_getProperties(elem);
		var destPath = iProp.filePath+iProp.fileName;
		var iProp = _desktop.icon_getProperties(iconElem);
		var origPath = iProp.filePath+iProp.fileName;

		ajaxPetition('r/PHP/API_fileManager.php','command=move&orig='+origPath+'&dest='+destPath,function(ajax){
			var r = jsonDecode(ajax.responseText);if(parseInt(r.errorCode)>0){alert(print_r(r));return;}
			if(_desktop.vars.fileOperation == 'cut'){iconElem.parentNode.removeChild(iconElem);}
			_desktop.vars.fileOperation = false;
		}.bind(this));
	},
	desktop_trash: function(elem){
//AAAAAAAAAAAAAAAAAAA
		this.file_trash(this.vars.fileSelection);
	},
	desktop_properties: function(elem){
		var iProp = _desktop.icon_getProperties(elem);
		var origPath = iProp.filePath+iProp.fileName;

		var h = elem.lastChild;
		if(h.tagName != 'UL'){return;}
		/* Avoid closing */
		$fix(h,{'onmousedown':function(e){e.stopPropagation();}}).empty();

		$C('LI',{className:'noSensitive',innerHTML:'Name: '+iProp.fileName},h);
		$C('LI',{className:'noSensitive',innerHTML:'Type: '+iProp.fileMime},h);
		$C('LI',{className:'noSensitive',innerHTML:'Size: '+$round(iProp.fileSize/1024)+'KB'},h);
		$C('HR',{},h);
		$C('LI',{className:'noSensitive',innerHTML:'Path: '+iProp.filePath},h);
		$C('LI',{className:'noSensitive',innerHTML:'Link: <a href="users/'+VAR_loggedUser.userAlias+'/drive'+origPath+'">'+iProp.fileName+'</a>'},h);
	},
	desktop_launch: function(iconElem){
		var iProp = _desktop.icon_getProperties(iconElem);
		if(iProp.fileMime == 'application/ogg' && iProp.fileName.match(/ogv$/)){iProp.fileMime = 'application/ogv';}
		if(!(appName = VAR_MIMES[iProp.fileMime])){return false;}
		launchApp(appName,launchApp_createHolder(appName),iconElem);
	},
	desktop_drivePARSENAME: function(driveFile){
		var protocol = driveFile.substring(0,6);
		var nameEncoded = driveFile.substring(7,driveFile.length-3);
		var nameDecoded = base64.decode(nameEncoded);
		var protocolName = protocol.replace('ubuone','UbuntuOne').replace('reveal','Reveal');
		return {'protocol':protocol,'protocolName':protocolName,'nameEncoded':nameEncoded,'nameDecoded':nameDecoded};
	},
	desktop_driveADD: function(driveFile){
		var d = _desktop.desktop_drivePARSENAME(driveFile);
		LAIN_drives.push(driveFile);
		_desktop.menu_places_placeADD(d.protocolName+' - '+d.nameDecoded,d.protocol+':'+d.nameEncoded+':/','drive_'+d.protocolName.toLowerCase());
	},
	desktop_driveREMOVE: function(driveFile){
		var n = $A(LAIN_drives).find(driveFile);
		if(n < 0){return;}
		LAIN_drives.splice(n,1);

		var d = _desktop.desktop_drivePARSENAME(driveFile);
		_desktop.menu_place_placeREMOVEDRIVE(d.protocol+':'+d.nameEncoded);
	},
	file_trash: function(fSel,callback){
		var tSel = $A([]);
		fSel.each(function(el){tSel.push(_desktop.icon_getProperties(el));});
		tSel = jsonEncode(tSel);

		ajaxPetition('r/PHP/API_fileManager.php','command=trashFile&files='+tSel,function(ajax){
			var r = jsonDecode(ajax.responseText);if(parseInt(r.errorCode)>0){alert(print_r(r));return;}
			fSel.each(function(li){_desktop.icon_destroy(li);});
			if(VAR_apps.systemTrash){VAR_apps.systemTrash.acquireFiles(fSel);}
			//alert(print_r(r));
		}.bind(this));
	},
	window_contract: function(elem){
		$each(elem.childNodes,function(k,v){
			if(v.nodeType != 1 || !v.className.match(/contractable/)){return;}
			v.$B({'.position':'absolute','.height':0,'.overflow':'hidden'});
		});
	},
	window_expand: function(elem){
		$each(elem.childNodes,function(k,v){
			if(v.nodeType != 1 || !v.className.match(/contractable/)){return;}
			v.$B({'.position':'relative','.height':'','.overflow':''});
		});
		setTimeout(function(){_desktop.window_saveRelativePosition(elem);},500);
	},
	window_getWindowZ: function(){this.vars.wHighestZ++;return this.vars.wHighestZ;},
	window_signals_click: function(e,elem){if(!elem){elem = e.target;while(elem.parentNode && !elem.className.match(/wodTheme/)){elem = elem.parentNode;};if(!elem.className.match(/wodTheme/)){return;};}this.window_registerTop(elem);},
	window_registerTop: function(elem){elem.$B({'.zIndex':_desktop.window_getWindowZ()});this.vars.window_top = elem;},
	window_loadRelativePosition: function(id){
		var c = unescape(cookieTake('position:'+id));
		//FIXME: esto no está correcto, no deberíamos asumir 400 y 100 tan alegremente
		if(!c || !(c = jsonDecode(c))){return {'left':( Math.random()*(_desktop.vars.bodyWidth-400) ),'top':( Math.random()*(_desktop.vars.bodyHeight-100) )};}
		var wLeft = (c.left < c.right) ? c.left : (_desktop.vars.bodyWidth-(parseInt(c.right)+parseInt(c.width)));
		var wTop = (c.top < c.bottom) ? c.top : (_desktop.vars.bodyHeight-(parseInt(c.bottom)+parseInt(c.height)));
		if(wTop < 0 || wTop > (_desktop.vars.bodyHeight-20)){wTop = 0;}
		return {'left':wLeft,'top':wTop,'width':c.width,'height':c.height};
	},
	window_saveRelativePosition: function(elem){
		var elemPos = $getOffsetPosition(elem);
		elemPos = jsonEncode({'width':elem.outerWidth(),'height':elem.outerHeight(),'left':elemPos.left,'right':this.vars.bodyWidth-(elemPos.left+elem.offsetWidth),'top':elemPos.top,'bottom':this.vars.bodyHeight-(elemPos.top+elem.offsetHeight)});
		cookieSet('position:'+elem.id,elemPos,20);
	},
	window_loadWidth: function(id){return 400+'px';},
	icons_organize: function(){
		var h = $_('lainIcons',{innerPath:'/'});
		//FIXME: hacer 2 peticiones, no se x que
		if(!h){return false;}
		var offsetLeft = 10;
		var offsetTop = 30;
		$A(h.childNodes).each(function(li){
			if(li.tagName != 'LI'){li.parentNode.removeChild(li);return;}
			var iProp = _desktop.icon_getProperties(li);
			var iconElem = _desktop.icon_create(iProp,h);
			iconElem.$B({'.left':offsetLeft+'px','.top':offsetTop+'px'});
			offsetTop += 64;
			if(offsetTop+64>_desktop.vars.bodyHeight){offsetTop=30;offsetLeft+=85;}
			li.parentNode.removeChild(li);
		}.bind(this));
	},
	icon_create: function(iProp,h,s){
		/* Necesitamos actualizar el path del icono por si está siendo movido */
		if(iProp.filePath != h.innerPath){iProp.filePath = h.innerPath;}
		var shortedText = (iProp.fileName.length > 13) ? iProp.fileName.substr(0,10)+'...' : iProp.fileName;

		var signals = {
			onmousedown:function(e){_littleDrag.onMouseDown(e);},
			launch:function(){_desktop.desktop_launch(this);},
			onTrash:function(){},
			onSelect:function(){_desktop.icon_onSelect(li);},
			onUnSelect:function(){_desktop.icon_onUnSelect(li);},
			onRename:function(){_desktop.icon_onRename(li);},
			onContextMenu:function(){_desktop.icon_onContextMenu(li);}
		};
		if(s){signals = extend(signals,s);}
		var li = $C('LI',extend({className:'desktop_icon wodIcon icon32_'+iProp.fileMime+' dragable'},signals),h);
		/* iconCanvas is allowed to navigate (not open in new window) */
		if(iProp.fileIsDir && li.parentNode.className == 'iconCanvas' && VAR_apps['lainExplorer']){li.launch = function(){VAR_apps['lainExplorer'].list(h,h.innerPath+iProp.fileName+'/');};}
		$C('I',{innerHTML:jsonEncode(iProp)},li);
		var i = $C('IMG',{className:'icon32_generic icon32_'+iProp.fileMime,src:'r/images/t.gif'},$C('DIV',{className:'icon32_imgHolder'},li));
		$C('DIV',{className:'icon32_textHolder',innerHTML:shortedText},li);

		/* if the holder is an iconCanvas we need to resize it in order to keep the height right */
		if(li.parentNode.className == 'iconCanvas'){this.iconCanvas_autoResize(li.parentNode);}
		return li;
	},
	icon_destroy: function(li){
		if(li.onTrash){li.onTrash();}
		var iconCanvas = li.parentNode;
		iconCanvas.removeChild(li);
		if(iconCanvas.className == 'iconCanvas'){this.iconCanvas_autoResize(iconCanvas);}
	},
	icon_getProperties: function(elem){return jsonDecode(elem.firstChild.innerHTML);},
	icon_saveProperties: function(elem,iProp){var iPropEncoded = jsonEncode(iProp);elem.firstChild.innerHTML = iPropEncoded;return iPropEncoded;},
	icon_isFolder: function(elem){return elem.className.match('icon_folder');},
	icon_onContextMenu: function(elem){
		var ul = _desktop.icon_contextMenu_create(elem);
		//FIXME: hacerlo con icon_contextMenu_option_append
		$A(['open','-','openWith','-','copy','cut','paste','trash','properties']).each(function(op){
			if(_desktop['icon_contextMenu_'+op]){return _desktop['icon_contextMenu_'+op](elem,ul,op);}
			if(op == '-'){$C('LI',{className:'separator'},ul);return;}
			if(op == 'paste' && !_desktop.icon_isFolder(elem)){return;}
			var disabled = (op == 'paste' && !_desktop.vars.fileOperation) ? 'disabled' : '';
			var li = $C('LI',{className:'icon_'+op+' '+disabled,innerHTML:op,
				onmousedown:function(e){e.preventDefault();e.stopPropagation();},
				onclick:function(e){
					if(li.className.match('disabled')){return;};
					if(op != 'properties'){_desktop.icon_contextMenu_close(e);}
					_desktop.desktop_fileOperations(op,elem);
				}
			},ul);
		});
	},
	icon_contextMenu_open: function(elem,ul,op){var disabled = (elem.launch) ? '' : 'disabled';var li = $C('LI',{className:'icon_'+op+' '+disabled,innerHTML:op,onmousedown:function(e){e.preventDefault();e.stopPropagation();},onclick:function(e){if(!disabled && elem.launch){elem.launch();_desktop.icon_contextMenu_close(e);}}},ul);return true;},
	icon_contextMenu_close: function(e){var ul = _desktop.vars.currentContextMenu;ul.parentNode.removeChild(ul);_desktop.vars.currentContextMenu = false;e.stopPropagation();},
	icon_contextMenu_create: function(elem,ops){
		var pos = $getOffsetPosition(elem);
		var ul = this.vars.currentContextMenu = $C('UL',{className:'icon_contextMenu','.top':pos.top+'px','.left':(pos.left+85)+'px'},$_('lainFlowIcon'));
		if(ops){$A(ops).each(function(op){op.opElem = elem;_desktop.icon_contextMenu_option_append(ul,op);});}
		return ul;
	},
	icon_contextMenu_option_append: function(m,op){
		/* m must be an contextMenu Object */
		if(!op.opDisabled){op.opDisabled = '';}
		var li = $C('LI',{className:'icon_'+op.opName+' '+op.opDisabled,innerHTML:op.opName,
			onmousedown:function(e){e.preventDefault();e.stopPropagation();},
			onclick:function(e){if(op.opDisabled === true){return;};op.opCommand(op.opElem,e);}
		},m);
	},
	icon_mouseup: function(e,elem){
		var ws = [];
		$A(lWindows.childNodes).each(function(elem){if(!elem.firstChild){return;}
			$A(elem.childNodes).each(function(el){if(el.className && el.className.match(/^wodern/)){ws.push(el);}});
		});
		ws.push($_('lainPlacesMenu_itemList'));

		var dn = [];
		$A(ws).each(function(el){
			var wPos = $getOffsetPosition(el);
			if(e.clientX > wPos.left && e.clientX < wPos.right && e.clientY > wPos.top && e.clientY < wPos.bottom){dn.push(el);}
		});

		//FIXME: problema del zIndex
		var candidate = false;var candidateIndex = 0;
		$A(dn).each(function(el){if((el.style.zIndex || 1) > candidateIndex){candidateIndex = el.style.zIndex;candidate = el;}});
		if(candidate.onDropElement){candidate.onDropElement(elem);}
	},
	icon_move: function(li,h){
		/* If the canvas get destroyed in the process */
		if(!h){return;}
		var iProp = this.icon_getProperties(li);
//FIXME: esto ya esta todo mal
		if(iProp.filePath != h.innerPath){iProp.filePath = h.innerPath;li.firstChild.innerHTML = jsonEncode(iProp);}
		var oldParent = li.parentNode;
		li.$B({'.left':'auto','.top':'auto'});
		h.appendChild(li);

		//FIXME: callback to h.updateCanvasSize if exists
		if(oldParent.className == 'iconCanvas'){this.iconCanvas_autoResize(oldParent);}
		if(li.parentNode.className == 'iconCanvas'){this.iconCanvas_autoResize(li.parentNode);}
	},
	icon_onSelect: function(li){
		li.className += ' iconSelected';
		this.vars.fileSelection.push(li);
		var iProp = _desktop.icon_getProperties(li);
		li.lastChild.innerHTML = iProp.fileName;
	},
	icon_onUnSelect: function(li){
		/* we don't unload this elem from fileSelection because we unload the entire block */
		li.className = li.className.replace(/ iconSelected$/,'');
		/* Support for renaming an icon */
		if(li.onRename && li.lastChild.firstChild && li.lastChild.firstChild.tagName == 'TEXTAREA'){li.onRename();}
		var iProp = _desktop.icon_getProperties(li);
		var shortedText = (iProp.fileName.length > 13) ? iProp.fileName.substr(0,10)+'...' : iProp.fileName;
		li.lastChild.innerHTML = shortedText;
	},
	icon_onRename: function(li,text){
		/* text param is no used yet */
		var ta = li.lastChild.firstChild;
		if(isEmpty(ta.value)){return;}
		var iProp = _desktop.icon_getProperties(li);
		var iPropOrigEncoded = jsonEncode(iProp);

		iProp.fileName = li.lastChild.firstChild.value;
		this.icon_saveProperties(li,iProp);

		ajaxPetition('r/PHP/API_fileManager.php','command=renameFile&file='+iPropOrigEncoded+'&newName='+iProp.fileName,function(ajax){
			var r = jsonDecode(ajax.responseText);if(parseInt(r.errorCode)>0){alert(print_r(r));return;}
			//alert(print_r(r));
		}.bind(this));
	},
	iconCanvas_create: function(id,p){
		return $C('UL',{id:id,className:'iconCanvas'},p);
	},
	iconCanvas_autoResize: function(i){
		var childs = i.childNodes.length;
		var l = 1;
		if(childs > 1){
			i.$B({'.width':'auto'});
			var w = i.innerWidth();
			var iconWidth = i.childNodes[0].offsetWidth;
			//FIXME: hay que calcular 80 automáticamente, el tamaño del icono
			if(iconWidth == 0){iconWidth = 80;}
			if(w < iconWidth){w = iconWidth;}
			var c = iconWidth*childs;
			l = Math.ceil(c/w);
		}
		//FIXME: hay que calcular 70 automáticamente, el tamaño del icono
		var iconCanvasHeight = l*70;

		i.$B({'.overflowY':'hidden','.height':'auto'});
		if(iconCanvasHeight > 220){iconCanvasHeight = 220;i.style.overflowY = 'scroll';}

		//eEaseHeight(i,iconCanvasHeight,false,false,false,true);
		i.style.height = iconCanvasHeight+'px';
	},
	signal_folderAdd: function(src,fSel){
		//FIXME: DEPRECATED, use signal_iconAdd instead.
		if(src == '/'){$A(fSel).each(function(el){this.icon_create(el,$_('lainIcons'));}.bind(this));this.icons_organize();}
		if(VAR_apps['lainExplorer']){VAR_apps['lainExplorer'].signal_folderAdd(src,fSel);}
	},
	signal_iconAdd: function(fSel){
		//FIXME: hay una excepcion, puede que el fichero apunte a una carpeta que no exista, que
		// es '/lost+found/', en cuyo caso debemos crearla
		var ths = this;
		$A(fSel).each(function(el){
			if(el.fileRoute == '/'){ths.icon_create(el,$_('lainIcons'));}
			if(VAR_apps['lainExplorer']){VAR_apps['lainExplorer'].signal_iconAdd(el);}
		});
		ths.icons_organize();
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
	menu_places_placeADD: function(placeName,placePath,placeIcon){
		var baseDrive = '';if(placePath[0] !== '/'){var s = placePath.substring(0,7);if(s == 'ubuone:'){var i = placePath.indexOf('/');if(i > -1){baseDrive = placePath.substring(0,i-1);}}}
		//FIXME: quiza si el baseDrive tiene protocol sobreescribir el icono
		if(!placeIcon){placeIcon = 'folder';}
		var h = $_('lainPlacesMenu_itemList');
		var li = $C('LI',{className:'icon_'+placeIcon+' '+baseDrive,innerHTML:placeName,onclick:function(){VAR_apps['lainExplorer'].createExplorer(placePath);}});
		//FIXME: efectos de transición
		h.insertBefore(li,h.lastChild.previousSibling);
	},
	menu_place_placeREMOVEDRIVE: function(baseDrive){
		var h = $_('lainPlacesMenu_itemList');
		var p = new RegExp(baseDrive+'$');
		//FIXME: efectos de transición
		$A(h.childNodes).each(function(li){if(li.className && li.className.match(p)){li.parentNode.removeChild(li);};});
	},
	menu_places_mouseDown: function(el){
		var origPath = el.parentNode.innerPath.replace(/[\/]*$/,'')+'/';
		var elemName = el.$T('DIV')[1].innerHTML;
		var elemMime = el.className.match(/icon32_([a-z\/]*)/)[1];
		if(elemMime != 'folder'){return;}
		_desktop.menu_places_placeADD(elemName,origPath+elemName+'/');
	},
	menu_show: function(elem){
		if(elem.className == 'selected'){elem.className = '';return;}
		$A(elem.parentNode.childNodes).each(function(el){el.className = '';});
		elem.className = 'selected';
	},
	systemTray_create: function(i){var systemTray = $_('systemTray');if(!systemTray){return false;}$C('LI',{id:i.id+'_trayIcon',className:i.className,onmousedown:function(e){},onclick:function(e){_desktop.systemTray_switch(this,e,i.onclick);}},systemTray);return true;},
	systemTray_switch: function(li,e,callback){if(li.firstChild && li.firstChild.className == 'wodInfo'){info_destroy(li.firstChild,e);return;}callback(e);},
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
		var iProp = _desktop.icon_getProperties(iconElem);
		var filePath = iProp.fileRoute+iProp.fileName;
		ajaxPetition('api/desktop/background_set/'+base64.encode(filePath),'',function(ajax){_desktop.background_init(1);});
	},
	helper_bytesToSize: function(bytes){
		var sizes = ['Bytes','KB','MB','GB','TB'];
		if(bytes == 0){return 'n/a';}
		var i = parseInt(Math.floor(Math.log(bytes)/Math.log(1024)));
		return Math.round(bytes/Math.pow(1024,i),2)+' '+sizes[i];
	}
};

var _iface = {
	vars: {},
	init: function(){},
	desktop_setBackground: function(iconElem,callback){
		var iProp = _desktop.icon_getProperties(iconElem);
		var iPropOrigEncoded = jsonEncode(iProp);
		var params = {'command':'setBackground','file':iPropOrigEncoded};
		ajaxPetition('r/PHP/API_desktop.php',$toUrl(params),function(ajax){
			var r = jsonDecode(ajax.responseText);
			if(parseInt(r.errorCode)>0){alert(print_r(r));return;}
			if(callback){callback(r.data);}
		});
	},
	reveal_folder_create: function(fileName,fileRoute,callback){
		var params = {'command':'folder_create','fileName':base64.encode(fileName),'fileRoute':base64.encode(fileRoute)};
		ajaxPetition('r/PHP/api.fs.php',$toUrl(params),function(ajax){var r = jsonDecode(ajax.responseText);
			if(typeof r.errorDescription != 'undefined'){
				//FIXME: TODO
				alert(ajax.responseText);
				return;	
			}
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
