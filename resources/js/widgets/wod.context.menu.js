widgets.wodContextMenu = {
	init: function(params){
//FIXME: cambiar la clase
		var wodContextMenu = $C('UL',{className:'contextMenu'});
		if(params.holder){params.holder.appendChild(wodContextMenu);}
		else{$_('lainFlowIcon').appendChild(wodContextMenu);}
		wodContextMenu.$B({
			'vars': {'params':false},
			'set': {
				/* Params is a generic extra info that will be pased to the callback on click, f.e. the item the contextmenu references */
				'params': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodContextMenu);return widgets.wodContextMenu.set.params.apply({},args);},
			},
			'item': {
				'add': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodContextMenu);return widgets.wodContextMenu.item.add.apply({},args);}
			},
			'items': {
				'load': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodContextMenu);return widgets.wodContextMenu.items.load.apply({},args);}
			}
		});
		/* Positioning the menu */
		if(params.event && params.event.detail.clientX && params.event.detail.clientY){wodContextMenu.$B({'.top':params.event.detail.clientY+'px','.left':params.event.detail.clientX+'px'});}

		_desktop.contextMenu_close();
		_desktop.vars.currentContextMenu = wodContextMenu;
		_desktop.vars.currentContextMenuClick = true;
		return wodContextMenu;
	},
	set: {
		params: function(wodContextMenu,params){wodContextMenu.vars.params = params;}
	},
	item: {
		add: function(wodContextMenu,item,callback){
			if($is.string(item)){item = new widget('widgets.wodContextMenuItem',{'text':item,'callback':callback,'params':wodContextMenu.vars.params});}
			wodContextMenu.appendChild(item);
		}
	},
	items: {
		load: function(wodContextMenu,items){$each(items,function(k,v){wodContextMenu.item.add(v.text,v.callback);});}
	}
};

widgets.wodContextMenuItem = {
	init: function(params){
		var separator = (params.text && params.text == '-') ? ' separator' : '';
		var wodContextMenuItem = $C('LI',{className:'wodContextMenuItem'+separator,innerHTML:(params.text ? params.text : '')});
		if(params.holder){params.holder.appendChild(wodContextMenu);}
		if(params.callback){
			if(!params.params){params.params = [];}
			wodContextMenuItem.addEventListener('mouse.down.left',function(e){
				if($is.string(params.callback)){var func = $F.find(params.callback);if(!func){return false;}return func(e,params.params);}
				//FIXME: if $is.function
				return params.callback(e,params.params);
			});
		}
		return wodContextMenuItem;
	}
}
