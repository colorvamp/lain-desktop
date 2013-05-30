VAR_apps.synaptic = {
	init: function(holder,params){
		if(!VAR_apps.synaptic.vars){VAR_apps.synaptic.vars = {wCounter:0,wHolder:holder,wContainer:false,isOpen:false};}
		if(!VAR_apps.synaptic.vars.isOpen){setTimeout(function(){VAR_apps.synaptic.client();},1);}
		return true;
	},
	client: function(){
		var wPos = _desktop.window_loadRelativePosition('synaptic');
		var w = window_create('synaptic',{wodTitle:'Synaptic - Package Manager','.width':'400px','.left':wPos.left+'px','.top':wPos.top+'px',
			beforeRemove:function(){},
			onDropElement:function(elem){}
		},VAR_apps.synaptic.vars.wHolder);
		/* app conteniner */
		h = VAR_apps.synaptic.vars.wContainer = w.windowContainer;

		/* INI-MENU */
		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},h);
		var ul = $C('UL',{},$C('LI',{innerHTML:'File',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
		$C('LI',{innerHTML:'Search',onclick:function(){VAR_apps.synaptic.client_search();}},ul);
		var ul = $C('UL',{},$C('LI',{innerHTML:'Edit',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
		var ul = $C('UL',{},$C('LI',{innerHTML:'View',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
		/* END-MENU */

		var list = $C('DIV',{'className':'lainList'},h);
		var table = $C('TABLE',{'className':'dataTable','cellPadding':0,'cellSpacing':0},list);
		var thead = $C('TR',{},$C('THEAD',{},table));
		var titles = ['Name','Installed Version','Last Version','Size','Description'];
		$each(titles,function(k,title){$C('TD',{innerHTML:title},thead);});
		var tbody = $C('TBODY',{},table);
	},
	client_addRow: function(tbody,row){
		var tr = $C('TR',{},tbody);
		var td = $C('TD',{innerHTML:row.package},tr);
		var td = $C('TD',{innerHTML:row.package},tr);
		var td = $C('TD',{innerHTML:row.version},tr);
		var td = $C('TD',{innerHTML:row.size},tr);
		var td = $C('TD',{innerHTML:row.description},tr);
	},
	client_search: function(menu){
		var h = info_create('synaptic_client_search',{},VAR_apps.synaptic.vars.wContainer).infoContainer;
		$C('DIV',{innerHTML:'Search'},h);
		var i = $C('INPUT',{},$C('DIV',{className:'inputText'},h));

		var btHolder = $C('UL',{className:'buttonHolder'},h);
		gnomeButton_create('Cancel',function(){info_destroy(h);},btHolder);
		gnomeButton_create('OK',function(){ok();},btHolder);

		function ok(){
			ajaxPetition('api/apt','subcommand=packageSearch&searchString='+base64.encode(i.value),function(ajax){
				var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
				var wContainer = VAR_apps.synaptic.vars.wContainer;if(!wContainer){return false;}
				var tbody = wContainer.$T('TBODY')[0];
				$A(r).each(function(elem){VAR_apps.synaptic.client_addRow(tbody,elem);});
//alert(ajax.responseText);
		return;
				
				iconCanvas.empty();
				iconCanvas.innerPath = path;
				$A(r.folders).each(function(elem){_desktop.icon_create(elem,iconCanvas);}.bind(this));
				$A(r.files).each(function(elem){_desktop.icon_create(elem,iconCanvas);}.bind(this));

				/* Calculate the height of an iconCanvas, if there is no icons */
				_desktop.iconCanvas_autoResize(iconCanvas);
			});
		}
	}
}
