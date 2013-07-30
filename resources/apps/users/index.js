VAR_apps.users = {
	init: function(holder,params){
		if(!VAR_apps.users.vars){VAR_apps.users.vars = {wCounter:0,wHolder:holder,wContainer:false,isOpen:false};}
		if(!VAR_apps.users.vars.isOpen){setTimeout(function(){VAR_apps.users.client();},1);}
		return true;
	},
	client: function(){
		var wContainer = window_container();
		/* INI-MENU */
		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},wContainer);
		var ul = $C('UL',{},$C('LI',{className:'wodMenuItem',innerHTML:'File'},wodMenuHolder));
		$C('LI',{innerHTML:'<i class="icon-plus"></i> Add a new user',onclick:function(){VAR_apps.users.client_users_add(cont);}},ul);
		$C('LI',{innerHTML:'<i class="icon-plus"></i> View users list',onclick:function(){VAR_apps.users.client_users_list(cont);}},ul);
		var ul = $C('UL',{},$C('LI',{className:'wodMenuItem',innerHTML:'Edit'},wodMenuHolder));
		$C('LI',{innerHTML:'<i class="icon-remove"></i> Remove selected users',onclick:function(){VAR_apps.users.menu_edit_remove_checkeds(wContainer);}},ul);
		/* END-MENU */

		var w = window_create('users',{wodTitle:'Users and Groups','wContainer':wContainer,
			beforeRemove:function(){},
			onDropElement:function(elem){}
		},VAR_apps.users.vars.wHolder);
		/* app container */
		h = VAR_apps.users.vars.wContainer = w.windowContainer;

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
				//alert(print_r(r));
				VAR_apps.users.client_users_list(cont);
			});
		};
	},
	client_users_list: function(cont){
		cont.empty();
		var table = new widget('_wodTable',{'tableMode':'wodCheck'});
		cont.appendChild(table);
		table.columns.add({'columnName':'Mail'},{'columnName':'Name'},{'columnName':'Registered'});
		table.rows.oncontextmenu = function(e,tr){
			var ctx = new widget('_wodContextMenu',{'target':tr});
			ctx.addItem('<i class="icon-copy"></i> Copy',function(){alert(1);});
			ctx.addSeparator();
			ctx.addItem('<i class="icon-trash"></i> Remove user',function(e,tr){
				var o = tr.getValue();if(!(length in o)){return false;}var mail = o[1];
				VAR_apps.users.action_user_removeByMail(mail,function(mails){VAR_apps.users.client_user_remove_callback(cont,mails);});
			});
		};

		ajaxPetition('api/users','subcommand=get',function(ajax){
			var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
			var wContainer = VAR_apps.users.vars.wContainer;if(!wContainer){return false;}
			$each(r,function(k,user){table.rows.add(false,user['userMail'],user['userName'],user['userRegistered']);});
		});
	},
	client_user_remove_callback: function(wContainer,mails){
		var wodTable = wContainer.$L('wodTable');if(!wodTable.length){return false;}
		wodTable = wodTable.item(0);
		var rows = wodTable.rows.childs;if(!rows.length){return false;}
		$each(rows,function(k,v){
			var o = v.getValue();var userMail = o[1];
			if(mails.indexOf(userMail) > -1){ eEaseLeave(v,{'callback':function(el){el.parentNode.removeChild(el);}}); }
		});
	},
	action_user_removeByMail: function(mails,callback){
		callback = typeof callback !== 'undefined' ? callback : false;
		var userMails = $is.string(mails) ? [mails] : mails;
		ajaxPetition('api/users','subcommand=remove&users='+base64.encode(jsonEncode(userMails)),function(ajax){
			var r = jsonDecode(ajax.responseText);if(r.errorDescription){alert(print_r(r));return;}
			if(callback){return callback(r);}
		});
	},
	menu_edit_remove_checkeds: function(wContainer){
		var wodTable = wContainer.$L('wodTable');if(!wodTable.length){return false;}
		wodTable = wodTable.item(0);
		var checkeds = wodTable.rows.getChecked();if(!checkeds.length){return false;}
		var userMails = [];
		$each(checkeds,function(k,v){var o = v.getValue();userMails.push(o[1]);});
		/* Comm to the server */
		VAR_apps.users.action_user_removeByMail(userMails,function(mails){VAR_apps.users.client_user_remove_callback(wContainer,mails);});
	},
	menu_reload: function(){
		//_tasks.taskAdd({'name':'Synaptic - Reload Sources','href':'api/apt','params':{'subcommand':'sourcesReload'}});
	}
}
