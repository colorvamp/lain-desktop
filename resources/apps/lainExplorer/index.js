VAR_apps.lainExplorer = {
	init: function(holder,params){
		if(!VAR_apps.lainExplorer.vars){VAR_apps.lainExplorer.vars = {apiURL:'api/fs',wCounter:0,wHolder:holder,wList:[],cList:$A([])};}
		if(params && params.tagName && params.tagName == 'LI'){var iProp = _desktop.icon_getProperties(params);VAR_apps.lainExplorer.client(iProp);return;}
		if(params && params.constructor == String){VAR_apps.lainExplorer.client(params);return;}
	},
	appKill: function(){this.vars.wList.each(function(w){_wodern.window_destroy(w);}.bind(this));},
	windows_get: function(){return VAR_apps.lainExplorer.vars.wList;},
	wList_removeElem: function(el){
//FIXME: usar indexOf
//this.vars.wList.each(function(w,n){if(w == el){this.vars.wList.splice(n,1);}}.bind(this));

},
	client: function(params){
		var wContainer = window_container();
		var iconCanvas = new widget('_wodIconCanvas');

		/* INI-MENU */
		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},wContainer);
		var ul = $C('UL',{},$C('LI',{className:'wodMenuItem',innerHTML:'File'},wodMenuHolder));
		$C('LI',{innerHTML:'Create new folder',onclick:function(){iconCanvas.folder.create();}},ul);
		var ul = $C('UL',{},$C('LI',{className:'wodMenuItem',innerHTML:'Edit'},wodMenuHolder));
		$C('LI',{innerHTML:'<i class="icon-paste"></i> Paste',onclick:function(){VAR_apps.lainExplorer.menu_edit_paste();}},ul);
		var ul = $C('UL',{},$C('LI',{className:'wodMenuItem',innerHTML:'View'},wodMenuHolder));
		$C('LI',{innerHTML:'Side Panel',onclick:function(){alert(1);}},ul);
		/* END-MENU */

		var cont = $C('DIV',{className:'wodVContainer'},wContainer);
		var panelLeft = $C('DIV',{className:'wodHContainer','.width':'140px'},cont);
		var s = this.sidePanel_create();
		panelLeft.appendChild(s);

		var panelRight = $C('DIV',{className:'wodHContainer','.width':'calc(100% - 140px)'},cont);


		var buttonHolder = $C("DIV",{className:"wodButtonMenu"},panelRight);
		var bt_uponelevel = $C('DIV',{innerHTML:'<i class="icon-arrow-up"></i>'},buttonHolder);
		$C('DIV',{innerHTML:'native:drive:'},buttonHolder);

		panelRight.appendChild(iconCanvas);
		this.vars.cList.push(iconCanvas);

		var wNum = VAR_apps.lainExplorer.vars.wCounter++;
		var w = window_create('lainExplorer'+wNum,{wodTitle:'Lain File Explorer','wContainer':wContainer,
			beforeRemove:function(){VAR_apps.lainExplorer.wList_removeElem(w);},
			onDropElement:function(elem){VAR_apps.lainExplorer.onDropElement(elem,this);},
			getIconCanvas: function(){return iconCanvas;},
			getFileRoute: function(){return w.getAttribute('data-fileRoute');},
			setFileRoute: function(fileRoute){if(fileRoute[fileRoute.length-1] != '/'){fileRoute = fileRoute+'/';}return w.setAttribute('data-fileRoute',fileRoute);},
			getIconParams: function(p){var p = w.getAttribute('data-iconParams');return jsonDecode(p);},
			setIconParams: function(p){if(p.fileRoute){this.setFileRoute(p.fileRoute);}return w.setAttribute('data-iconParams',jsonEncode(p));}
		},VAR_apps.lainExplorer.vars.wHolder);

		this.list(iconCanvas,params);
		VAR_apps.lainExplorer.vars.wList.push(w);

		bt_uponelevel.onclick = function(){this.list_upOneLevel(iconCanvas);}.bind(this);
	},
	list: function(iconCanvas,path){
//FIXME: mal entera
		var title = false;
		if(typeof path == 'string'){
			//FIXME: parsepath
			var path = (path ? path : '/');
			var reveal = path.match(/^(reveal|ubuone)/);
			if(path != '/' && path[path.length-1] != '/'){path += '/';};
			//if(!reveal && path != '/' && path[0] != '/'){path = '/'+path;}
			title = path;
		}else{
			if(path.fileRoute != '/' && path.fileRoute[path.fileRoute.length-1] != '/'){path.fileRoute += '/';};
			title = path.fileRoute+path.fileName;
			path = path.fileRoute+((path.fileAlias) ? path.fileAlias : path.fileName);
		}

//FIXME: hacer un método parse
if(path[path.length-1] != '/'){path = path+'/';}

		var w = iconCanvas.$P({'className':'wodern'});

		//var t = $_('wod_lainExplorer'+wNum+'_title',{innerHTML:'Lain File Explorer - '+title});
//FIXME: mal
		ajaxPetition(this.vars.apiURL,'subcommand=folder.list&fileRoute='+base64.encode(path),function(ajax){
			var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
			iconCanvas.setIconParams(r.folder);
			if(w){w.setIconParams(r.folder);}

//FIXME: innerPath no debe existir
			iconCanvas.empty();
			iconCanvas.innerPath = path;
			$A(r.files).each(function(elem){_icon.create(elem,iconCanvas);});
		});
	},
	list_upOneLevel: function(iconCanvas){
//FIXME: no basarse en esto
		if(iconCanvas.innerPath == ''){return;}
		var baseName = iconCanvas.innerPath.replace(/\/[^\/]*\/$/,'/');
		if(baseName == '/'){baseName = '';}
		this.list(iconCanvas,baseName);
	},
	sidePanel_create: function(){
		var sidePanel = $C('UL',{className:'lainExplorer_sidePanel'});
//FIXME: terminar
$A($_('lainPlacesMenu_itemList').childNodes).each(function(el){
	if(el.nodeType != 1){return;};
	if(el.className.match(/dropLeyend/)){return;}
	var li = el.cloneNode(true);
	sidePanel.appendChild(li);
});
		return sidePanel;
	},
	menu_edit_paste: function(){
//FIXME: fake select
return;
		_desktop.fs_paste();
	},
	dragIconStart: function(e){
		var elem = e.target;while(elem.parentNode && !elem.className.match(/dragable/)){elem = elem.parentNode;}
		elem = $fix(elem,{'.opacity':.5,onmouseup:function(){this.$B({'.opacity':1});_littleDrag.vars.applyLimits = true;}});

		_littleDrag.vars.applyLimits = false;
		_littleDrag.onMouseDown(e);
	},
	onDropElement: function(iconElem,w){
		var iconCanvas = w.iconCanvas;
		if(!iconElem.$B){el = $fix(el);}
		/* Si el elemento pertenece a la misma ventana, no hacemos nada */
		if(iconElem.isChildNodeOf(iconCanvas)){return;}
return false;
		var destPath = iconCanvas.innerPath.replace(/[\/]*$/,'')+'/';
//FIXME:hack
if(destPath[0] == '/'){destPath = 'native:drive:'+destPath;}
		var origPath = iconElem.parentNode.innerPath.replace(/[\/]*$/,'')+'/';
		/* if the paths are the same, no op is needed */
		if(destPath == origPath){return;}

		var iProp = _desktop.icon_getProperties(iconElem);
		var elemName = iProp.fileName;

		//FIXME: quiza hacerlo por api del sistema
		//alert("from " + origPath + " to " + destPath);
		var files = [];
		files.push(iProp);
		//FIXME: solo enviar fileName y fileRoute por cada file
		ajaxPetition(this.vars.apiURL,'subcommand=file_move&files='+base64.encode(jsonEncode(files))+'&destRoute='+base64.encode(destPath),function(ajax){
			var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
//FIXME: cambiar el sistema
//alert(print_r(r));
			//_desktop.ico//n_move(iconElem,iconCanvas);
		}.bind(this));
	}
};
