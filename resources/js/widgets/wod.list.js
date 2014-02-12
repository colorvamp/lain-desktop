widgets.wodList = {
	init: function(params){
		var wodList = $C('DIV',{className:'wodList variable',
			'vars': {'contextmenu':false},
			'set': {
				'contextmenu': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodList);return widgets.wodList.set.contextmenu.apply({},args);},
			},
			'item': {
				'add': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodList);return widgets.wodList.item.add.apply({},args);},
				'remove': function(){return false;return _wodIconCanvas.icon.remove(wodIconCanvas,icons);}
			}
		});
		wodList.addEventListener('mouse.down.right',widgets.wodList.signals.mouseDownRight);
		return wodList;
	},
	set: {
		contextmenu: function(wodList,menu){wodList.vars.contextmenu = menu;}
	},
	item: {
		add: function(wodList,item){
			var wodItem = new widget('widgets.wodItem');
			if($is.string(item)){item = $C('SPAN',{innerHTML:item});}
			wodItem.appendChild(item);
			wodList.appendChild(wodItem);
			//FIXME: hacerlo con globales para evitar multiples declaraciones
			wodItem.addEventListener('mouse.down.left',function(e){widgets.wodList.item.select(wodList,this);});
			wodItem.addEventListener('mouse.down.right',function(e){widgets.wodList.item.select(wodList,this);});
			return wodItem;
		},
		select: function(wodList,item){
			if($E.classHas(item,'disabled')){return false;}
			$each(wodList.childNodes,function(k,v){$E.classRemove(v,'selected');});
			$E.classAdd(item,'selected');
		}
	},
	signals: {
		mouseDownRight: function(e){
//FIXME: ver en qué elemento ha caido
			var wodList = this;
			if(!wodList.vars.contextmenu || !$is.array(wodList.vars.contextmenu) || !wodList.vars.contextmenu.length){return false;}
			var x = e.detail.clientX;var y = e.detail.clientY;
			var candidate = document.elementFromPoint(x,y);
			if(candidate){candidate = $E.parent.find(candidate,{'className':'wodItem'});}
			if(candidate){
				wodContextMenu = new widget('widgets.wodContextMenu',{'event':e});
				wodContextMenu.set.params({'target':candidate});
				wodContextMenu.items.load(wodList.vars.contextmenu);
			}
		}
	}
};
