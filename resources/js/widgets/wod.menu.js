widgets.wodMenu = {
	init: function(){
		var wodMenu = $C('UL',{className:'wodMenu',
			'item': {
				'add': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodMenu);return widgets.wodMenu.item.add.apply({},args);}
			}
		});
		return wodMenu;
	},
	item: {
		add: function(wodMenu,item){
			var wodItem = $C('LI',{className:'wodItem'},wodMenu);
			wodItem.appendChild(item);
			wodMenu.appendChild(wodItem);
			return wodItem;
		}
	}
}
