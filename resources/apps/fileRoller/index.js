VAR_apps.fileRoller = {
	init: function(holder,params){
		if(!VAR_apps.fileRoller.vars){VAR_apps.fileRoller.vars = {wHolder:holder};}
		if(params && params.tagName && params.tagName == 'LI'){var iProp = _icon.getProperties(params);return VAR_apps.fileRoller.client(iProp);}
		VAR_apps.fileRoller.client();
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
		var buttonHolder = $C("DIV",{className:"wodButtonMenu"},cont);
		cont.appendChild(iconCanvas);

		var w = window_create('fileRoller'+(new Date().getTime()),{
			wodTitle:'Lain File Explorer','wContainer':wContainer,
			beforeRemove:function(){VAR_apps.lainExplorer.wList_removeElem(w);},
			onDropElement:function(elem){VAR_apps.lainExplorer.onDropElement(elem,this);},
			getIconCanvas: function(){return iconCanvas;},
			getFileRoute: function(){return w.getAttribute('data-fileRoute');},
			setFileRoute: function(fileRoute){if(fileRoute[fileRoute.length-1] != '/'){fileRoute = fileRoute+'/';}return w.setAttribute('data-fileRoute',fileRoute);},
			getIconParams: function(p){var p = w.getAttribute('data-iconParams');return jsonDecode(p);},
			setIconParams: function(p){if(p.fileRoute){this.setFileRoute(p.fileRoute);}return w.setAttribute('data-iconParams',jsonEncode(p));}
		},VAR_apps.fileRoller.vars.wHolder);
	}
};
