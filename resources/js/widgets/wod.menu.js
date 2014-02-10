widgets.wodMenu = {
	init: function(params){
		var wodMenu = $C('DIV',{className:'wodMenu',
			'vars': {'title':false},
			'set': {
				'title': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodMenu);return widgets.wodMenu.set.title.apply({},args);}
			},
			'item': {
				'add': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodMenu);return widgets.wodMenu.item.add.apply({},args);}
			}
		});
		$C('DIV',{className:'title'},wodMenu);
		$C('DIV',{className:'menu'},wodMenu);
		if(params.title){wodMenu.set.title(params.title);}
		wodMenu.addEventListener('mouse.down.left',function(e){
			if($E.class.exists(wodMenu,'open')){return $E.class.remove(wodMenu,'open');}
			return $E.class.add(wodMenu,'open');
		});
		return wodMenu;
	},
	set:{
		title: function(wodMenu,name){
			wodMenu.vars.title = name;
			var h = wodMenu.querySelector('.title');if(!h){return false;}
			h.innerHTML = name;
			return true;
		}
	},
	item: {
		add: function(wodMenu,item,callback){
			var h = wodMenu.querySelector('.menu');if(!h){return false;}
			var wodItem = new widget('widgets.wodItem');
			if($is.string(item)){item = $C('SPAN',{innerHTML:item});}
			wodItem.appendChild(item);
			if(callback && $is.string(callback)){callback = $F.find(callback);}
			if(callback){
				if($E.class.exists(wodMenu,'disabled')){return false;}
				wodItem.addEventListener('mouse.down.left',callback);
			}
			h.appendChild(wodItem);
			return wodItem;
		}
	}
}
