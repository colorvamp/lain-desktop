VAR_apps.synaptic = {
	init: function(holder,params){
		if(!VAR_apps.synaptic.vars){VAR_apps.synaptic.vars = {wCounter:0,wHolder:holder,wContainer:false,isOpen:false};}
		if(!VAR_apps.synaptic.vars.isOpen){setTimeout(function(){VAR_apps.synaptic.client();},1);}
		return true;
	},
	client: function(){
		var w = window_create('synaptic',{wodTitle:'Synaptic - Package Manager',
			beforeRemove:function(){},
			onDropElement:function(elem){}
		},VAR_apps.synaptic.vars.wHolder);
		/* app conteniner */
		h = VAR_apps.synaptic.vars.wContainer = w.windowContainer;

		/* INI-MENU */
		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},h);
		var wodMenu = new widget('widgets.wodMenu',{'title':'File'});
		wodMenu.item.add('<i class="icon-search"></i> Search',function(){VAR_apps.synaptic.client_search();});
		wodMenu.item.add('<i class="icon-refresh"></i> Reload',function(){VAR_apps.synaptic.menu_reload();});
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'Edit'});
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'View'});
		wodMenuHolder.appendChild(wodMenu);
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

		var btnGroup = $C('UL',{className:'btn-group'},h);
		var btn = $C('DIV',{className:'btn',innerHTML:'Cancel'},btnGroup);
		btn.addEventListener('mouse.down.left',function(e){info_destroy(h);});
		var btn = $C('DIV',{className:'btn',innerHTML:'OK'},btnGroup);
		btn.addEventListener('mouse.down.left',function(e){ok();});

		function ok(){
			ajaxPetition('api/apt','subcommand=packageSearch&searchString='+base64.encode(i.value),function(ajax){
				var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
				var wContainer = VAR_apps.synaptic.vars.wContainer;if(!wContainer){return false;}
				var tbody = wContainer.$T('TBODY')[0];
				$A(r).each(function(elem){VAR_apps.synaptic.client_addRow(tbody,elem);});
			});
		}
	},
	menu_reload: function(){
		_tasks.taskAdd({'name':'Synaptic - Reload Sources','href':'api/apt','params':{'subcommand':'sourcesReload'}});
	}
}
