VAR_apps.users = {
	init: function(holder,params){
		if(!VAR_apps.users.vars){VAR_apps.users.vars = {wCounter:0,wHolder:holder,wContainer:false,isOpen:false};}
		if(!VAR_apps.users.vars.isOpen){setTimeout(function(){VAR_apps.users.client();},1);}
		return true;
	},
	client: function(){
		var w = window_create('users',{wodTitle:'Users and Groups',
			beforeRemove:function(){},
			onDropElement:function(elem){}
		},VAR_apps.users.vars.wHolder);
		/* app conteniner */
		h = VAR_apps.users.vars.wContainer = w.windowContainer;

		/* INI-MENU */
		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},h);
		var ul = $C('UL',{},$C('LI',{innerHTML:'File',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
		$C('LI',{innerHTML:'<i class="icon-plus"></i> Add a new user',onclick:function(){VAR_apps.users.client_users_add(cont);}},ul);
		$C('LI',{innerHTML:'<i class="icon-plus"></i> View users list',onclick:function(){VAR_apps.users.client_users_list(cont);}},ul);
		/* END-MENU */
		var cont = $C('DIV',{className:'wodContainer'},h);

		/* Load the users list */
		VAR_apps.users.client_users_list(cont);
		//VAR_apps.users.client_users_add(cont);
	},
	client_users_add: function(cont){
		cont.empty();
		$C('H1',{className:'header',innerHTML:'Create a new user'},cont);
		$C('P',{className:'header',innerHTML:'Users can log into Lain system.'},cont);
		$C('HR',{},cont);

		var form = $C('form',{className:'wodForm'},cont);
		var l = $C('DIV',{},form);
		$C('SPAN',{innerHTML:'Name'},l);
		$C('INPUT',{'name':'userName','placeholder':'User name'},$C('DIV',{},l));
		var l = $C('DIV',{},form);
		$C('SPAN',{innerHTML:'Mail'},l);
		$C('INPUT',{'name':'userMail','placeholder':'Mail address'},$C('DIV',{},l));
		var l = $C('DIV',{},form);
		$C('SPAN',{innerHTML:'Password'},l);
		$C('INPUT',{'name':'userPass','placeholder':'Password'},$C('DIV',{},l));
		var l = $C('DIV',{},form);
		$C('SPAN',{innerHTML:'Repeat Password'},l);
		$C('INPUT',{'name':'userPassR','placeholder':'Repeat Password'},$C('DIV',{},l));

		var btHolder = $C('UL',{className:'buttonHolder'},form);
		gnomeButton_create('Create',function(){$ok(form);},btHolder);

		var $ok = function(form){
			var params = extend($parseForm(form),{'subcommand':'create'});
			ajaxPetition('api/users',$toUrl(params),function(ajax){
				var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
alert(print_r(r));
			});
		};
	},
	client_users_addRow: function(tbody,row){
		var tr = $C('TR',{},tbody);
		var td = $C('TD',{innerHTML:row.userMail},tr);
		var td = $C('TD',{innerHTML:row.userName},tr);
		var td = $C('TD',{innerHTML:row.userRegistered},tr);
	},
	client_users_list: function(cont){
		cont.empty();
		var table = $C('TABLE',{'className':'dataTable','cellPadding':0,'cellSpacing':0},cont);
		var thead = $C('TR',{},$C('THEAD',{},table));
		var titles = ['Mail','Name','Registered'];
		$each(titles,function(k,title){$C('TD',{innerHTML:title},thead);});
		var tbody = $C('TBODY',{},table);

		ajaxPetition('api/users','subcommand=get',function(ajax){
			var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
			var wContainer = VAR_apps.users.vars.wContainer;if(!wContainer){return false;}
			var tbody = wContainer.$T('TBODY')[0];
			$each(r,function(k,user){VAR_apps.users.client_users_addRow(tbody,user);});
		});
	},
	menu_reload: function(){
		//_tasks.taskAdd({'name':'Synaptic - Reload Sources','href':'api/apt','params':{'subcommand':'sourcesReload'}});
	}
}
