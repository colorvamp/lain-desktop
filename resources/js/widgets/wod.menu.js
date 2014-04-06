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
			$E.class.add(wodMenu,'open');
			var menu = wodMenu.querySelector('.menu');
			if(!menu){return wodMenu;}
			var pos = $getOffsetPosition(menu);
			if(window.innerWidth < pos.left+pos.width){menu.style.left = (window.innerWidth - (pos.left+pos.width))+'px';}
			return wodMenu;
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
		add: function(wodMenu,item,callback,params){
			var h = wodMenu.querySelector('.menu');if(!h){return false;}
			var wodItem = new widget('widgets.wodItem');
			if($is.string(item)){item = $C('SPAN',{innerHTML:item});}
			wodItem.appendChild(item);
			if(callback && $is.string(callback)){callback = $F.find(callback);}
			if(callback){
				wodItem.addEventListener('mouse.down.left',function(e){
					if($E.class.exists(wodItem,'disabled')){return false;}
					return callback(e);
				});
			}
			h.appendChild(wodItem);
			return wodItem;
		}
	}
}
