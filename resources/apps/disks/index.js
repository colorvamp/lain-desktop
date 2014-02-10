VAR_apps.disks = {
	init: function(holder,params){
		if(!VAR_apps.disks.vars){VAR_apps.disks.vars = {wCounter:0,wHolder:holder,wContainer:false,isOpen:false};}
		if(!VAR_apps.disks.vars.isOpen){setTimeout(function(){VAR_apps.disks.client();},1);}
		return true;
	},
	client: function(){
		var wContainer = window_container();

		/* INI-MENU */
//FIXME: deprecated
		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},wContainer);
		var ul = $C('UL',{},$C('LI',{className:'wodMenuItem',innerHTML:'File'},wodMenuHolder));
		$C('LI',{innerHTML:'<i class="icon-plus"></i> Add a new user',onclick:function(){VAR_apps.disks.client_disks_create(cont);}},ul);
		$C('LI',{innerHTML:'<i class="icon-plus"></i> View users list',onclick:function(){VAR_apps.disks.client_disks_list(cont);}},ul);
		var ul = $C('UL',{},$C('LI',{className:'wodMenuItem',innerHTML:'Edit'},wodMenuHolder));
		$C('LI',{innerHTML:'<i class="icon-remove"></i> Remove selected users',onclick:function(){VAR_apps.disks.menu_edit_remove_checkeds(wContainer);}},ul);
		/* END-MENU */

		var w = window_create('disks',{wodTitle:'Volume manager','wContainer':wContainer},VAR_apps.disks.vars.wHolder);
		/* app container */
		h = VAR_apps.disks.vars.wContainer = w.windowContainer;
		w.buttons.add('Close');

		var cont = new widget('widgets.wodContainer',{'holder':wContainer});


		/* Load the users list */
		VAR_apps.disks.client_disks_list(cont);
		//VAR_apps.disks.client_users_add(cont);
	},
	client_disks_list: function(cont){
		cont.empty();
		var wodList = new widget('widgets.wodList',{'listMode':'wodCheck'});
		var menu = [
			{'text':'<i class="icon-refresh"></i> Open','callback':function(e,params){var disk = params.target;return VAR_apps.disks.commands.open(disk);}},
			{'text':'<i class="icon-refresh"></i> Approve','callback':function(e,params){return VAR_apps.disks.approve(params.target,cont);}}
		];
		wodList.set.contextmenu(menu);
		cont.add(wodList);

//FIXME: hay que hacerlo en otro sitio para tener este dato globalmente
		var params = {'subcommand':'status'};
		$ajax('api/drives',params,{
			'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}
				$each(r.drives,function(k,v){
					var d = $C('DIV',{innerHTML:'<div class="bold">'+k+'</div><p>Información</p>'});
					var btnHolder = $C('DIV',{className:'btn-group'},d);
					if(v.driveStatus == 'init' || v.driveStatus == 'ready'){
						var btn = $C('DIV',{className:'btn mini',innerHTML:'<i class="icon-folder-open"></i> Open'},btnHolder);
						btn.addEventListener('mouse.down.left',function(e){return VAR_apps.disks.commands.open(wodItem);});
						var btn = $C('DIV',{className:'btn mini',innerHTML:'<i class="icon-refresh"></i> Sync'},btnHolder);
						btn.addEventListener('mouse.down.left',function(e){return VAR_apps.disks.commands.sync(wodItem);});
					}
					if(v.driveStatus == 'unknown'){
						var btn = $C('DIV',{className:'btn mini',innerHTML:'Approve'},btnHolder);
						btn.addEventListener('mouse.down.left',function(e){return VAR_apps.disks.approve(wodItem,cont);});
					}
					var wodItem = wodList.item.add(d);
					wodItem.setAttribute('data-driveID',k);
				});
				//alert(print_r(r));
			}
		});
	},
	client_disks_create: function(cont){
		cont.empty();
		$C('H1',{className:'header',innerHTML:'Mount a new disk in your system'},cont);
		$C('P',{className:'header',innerHTML:'File management.'},cont);
		$C('HR',{},cont);

		var form = $C('form',{className:'wodForm'},cont);
		var l = $C('DIV',{className:'table'},form);

		var row = $C('DIV',{innerHTML:''},l);
		$C('DIV',{innerHTML:'Client ID'},row);
		var inputDriveClient = $C('INPUT',{'name':'driveClient','placeholder':'Client ID'},$C('DIV',{},row));

		var row = $C('DIV',{innerHTML:''},l);
		$C('SPAN',{innerHTML:'Secret'},row);
		var inputDriveSecret = $C('INPUT',{'name':'driveSecret','placeholder':'Secret'},$C('DIV',{},row));

		//FIXME: crear widget
		var btGroup = $C('DIV',{className:'btn-group'},form);
		$C('DIV',{className:'btn',innerHTML:'Create',
			onmouseup: function(){

var params = {'subcommand':'create','driveClient':base64.encode(inputDriveClient.value),'driveSecret':base64.encode(inputDriveSecret.value)};
$ajax('api/drives',params,{
	'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}
alert(print_r(r));
}
});
			}
		},btGroup);
	},
	commands: {
		open: function(disk){
			if(!$is.string(disk)){disk = disk.getAttribute('data-driveID');}
			if(!disk){return false;}
			launchApp('lainExplorer',disk+':/');
		},
		sync: function(disk){
			if(!$is.string(disk)){disk = disk.getAttribute('data-driveID');}
			if(!disk){return false;}
			var params = {'subcommand':'sync','driveID':base64.encode(disk)};
			$ajax('api/drives',params,{
				'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}
					alert(print_r(r));
				}
			});
		}
	},
	approve: function(disk,cont){
//FIXME: enviar eventos
		if(!$is.string(disk)){disk = disk.getAttribute('data-driveID');}
		if(!disk){return false;}
		cont.empty();

		var wodIframe = new widget('widgets.wodIframe');
		wodIframe.set.src('api/drives/code/'+disk);
		cont.add(wodIframe);
		//FIXME: TODO
	}
}
