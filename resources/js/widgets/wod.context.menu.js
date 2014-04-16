widgets.wodContextMenu = {
	init: function(params){
//FIXME: cambiar la clase
		var wodContextMenu = $C('UL',{className:'wodContextMenu wodMenu'});
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
		if(params.event && params.event.clientX && params.event.clientY){wodContextMenu.$B({'.top':params.event.clientY+'px','.left':params.event.clientX+'px'});}
		if(params.top){wodContextMenu.style.top = parseInt(params.top)+'px';}
		if(params.left){wodContextMenu.style.left = parseInt(params.left)+'px';}
		if(params.target){
			var pos = $getOffsetPosition(params.target);
			wodContextMenu.style.top = pos.top+'px';
			wodContextMenu.style.left = pos.left+params.target.offsetWidth+4+'px';
		}
		/* Eventos */
		wodContextMenu.addEventListener('mouse.down.left',function(e){e.stopPropagation();e.preventDefault();});

		//FIXME: bueno, no se si esto es asi
		_desktop.contextMenu_close();
		_desktop.vars.currentContextMenu = wodContextMenu;
		_desktop.vars.currentContextMenuClick = true;
		return wodContextMenu;
	},
	reflow: function(wodContextMenu){
//FIXME: recalcular el ancho en las diferentes modalidades
	},
	set: {
		params: function(wodContextMenu,params){wodContextMenu.vars.params = params;}
	},
	item: {
		add: function(wodContextMenu,item,callback){
			//if($is.string(item)){item = new widget('widgets.wodContextMenuItem',{'text':item,'callback':callback,'params':wodContextMenu.vars.params});}
			//wodContextMenu.appendChild(item);
			//FIXME: hacer reflow de alguna manera


			var wodItem = new widget('widgets.wodItem',{'text':item,'callback':callback,'params':wodContextMenu.vars.params});
			wodContextMenu.appendChild(wodItem);
			return wodItem;
		}
	},
	items: {
		load: function(wodContextMenu,items){
			$each(items,function(k,v){wodContextMenu.item.add(v.text,v.callback);});
			//FIXME: hacer reflow
		}
	}
};
