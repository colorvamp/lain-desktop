VAR_apps.lainExplorer = {
	init: function(holder,params){
		if(!VAR_apps.lainExplorer.vars){VAR_apps.lainExplorer.vars = {wCounter:0,wHolder:holder,wList:[],cList:$A([])};}
		if(params && params.tagName && params.tagName == 'LI'){var iProp = _icon.getProperties(params);return VAR_apps.lainExplorer.client(iProp);}
		if(params && params.constructor == String){VAR_apps.lainExplorer.client(params);return;}
	},
	appKill: function(){this.vars.wList.each(function(w){_wodern.window_destroy(w);}.bind(this));},
	windows_get: function(){return VAR_apps.lainExplorer.vars.wList;},
	client: function(params){
		var wNum = VAR_apps.lainExplorer.vars.wCounter++;
		var wodern = _wodern.window_create('lainExplorer'+wNum,{},VAR_apps.lainExplorer.vars.wHolder);
		wodern.set.title('Lain File Explorer');
		var wContainer = wodern.windowContainer;
		var iconCanvas = new widget('widgets.wodIconCanvas');


		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},wContainer);
		var wodMenu = new widget('widgets.wodMenu',{'title':'File'});
		wodMenu.item.add('<i class="icon-folder-open"></i> Create new folder',function(){iconCanvas.folder.create();});
		wodMenu.item.add('<i class="icon-remove"></i> Exit',function(){wodern.close();});
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'Edit'});
		wodMenu.item.add('<i class="icon-cut"></i> Cut',function(){/*FIXME*/});
		wodMenu.item.add('<i class="icon-copy"></i> Copy',function(){/*FIXME*/});
		wodMenu.item.add('<i class="icon-paste"></i> Paste',function(){/*FIXME*/});
		wodMenu.item.add('-');
		wodMenu.item.add('Select all',function(){/*FIXME*/});
		wodMenu.item.add('Unselect all',function(){/*FIXME*/});
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'View'});
		wodMenuHolder.appendChild(wodMenu);


		var cont = $C('DIV',{className:'wodVContainer'},wContainer);
		/* INI-left-panel */
		var panelLeft = $C('DIV',{className:'wodHContainer','.width':'140px'},cont);
		var storagePlaces = document.querySelector('.lainStorage > .places');
		if(storagePlaces){
			storagePlaces = $json.decode(storagePlaces.innerHTML);
			var wodList = new widget('widgets.wodList');
			$E.class.add(wodList,'grey');
			panelLeft.appendChild(wodList);
			$each(storagePlaces,function(k,v){
				var wodItem = wodList.item.add('<span class="icon16 icon_'+v.placeType+'"></span>'+v.placeName,function(e){launchApp('lainExplorer',v.placeRoute);});
				if(v.placeStatus && v.placeStatus == 'disabled'){wodItem.disable();}
			});
		}
		/* END-left-panel */

		var panelRight = $C('DIV',{className:'wodHContainer','.width':'calc(100% - 140px)'},cont);
//FIXME:
		var btnGroup = $C('DIV',{className:'btn-group wodButtonMenu'},panelRight);
		var btn = $C('DIV',{className:'btn',innerHTML:'<i class="icon-arrow-up"></i>'},btnGroup);
		btn.addEventListener('mouse.down.left',function(){wodern.api.navigation.up();});
		$C('INPUT',{type:'text',className:'navigation'},btnGroup);

		panelRight.appendChild(iconCanvas);

//FIXME: dar soporte a estas cosas correctamente
		this.vars.cList.push(iconCanvas);
		VAR_apps.lainExplorer.vars.wList.push(wodern);

		extend(wodern.api,{
			'get': {
				'route': function(){var iProp = iconCanvas.getIconParams();return iProp.fileRoute+iProp.fileName+'/';}
			},
			'navigation': {
				'location': function(location){return VAR_apps.lainExplorer.navigation.location(wodern,location);},
				'up': function(){return VAR_apps.lainExplorer.navigation.up(wodern);}
			}
		});

		if($is.string(params)){wodern.api.navigation.location(params);}
		else{wodern.api.navigation.location(params.fileRoute+params.fileName+'/');}
		wodern.show();
	},
	navigation: {
		location: function(wodern,location){
			var iconCanvas = wodern.querySelector('.wodIconCanvas');if(!iconCanvas){return false;}
			var navigation = wodern.querySelector('input.navigation');if(navigation){navigation.value = location;}
			var params = {'subcommand':'folder.list','fileRoute':base64.encode(location)};
			$ajax('api/fs',params,{
				'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}
					iconCanvas.empty();
					iconCanvas.setIconParams(r.folder);
					iconCanvas.icon.add(r.files);
				}
			});
		},
		up: function(wodern){
			var route = wodern.api.get.route();
			var driveType = route.substr(0,route.indexOf(':'));
			route = route.substr(route.indexOf(':')+1);
			var driveHash = route.substr(0,route.indexOf(':'));
			route = route.substr(route.indexOf(':')+1);
			route = route.replace(/\/[^\/]*\/$/,'/');
			route = driveType+':'+driveHash+':'+route;
			return VAR_apps.lainExplorer.navigation.location(wodern,route);
		}
	},
	menu_edit_paste: function(){
//FIXME: fake select
	}
};
