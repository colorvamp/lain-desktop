widgets.wodSection = {
	init: function(params){
		var wodSection = $C('DIV',{className:'wodSection',
			'vars': {'title':false},
			'set': {
				'title': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodSection);return widgets.wodSection.set.title.apply({},args);}
			},
			'item': {
				'add': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodSection);return widgets.wodSection.item.add.apply({},args);}
			}
		});
		if(!params){params = {};}
		$C('DIV',{className:'title'},wodSection);
		if(params.title){wodSection.set.title(params.title);}
		return wodSection;
	},
	item: {
		add: function(wodList,item){
			var wodItem = new widget('widgets.wodItem');
			if($is.string(item)){item = $C('SPAN',{innerHTML:item});}
			wodItem.appendChild(item);
			wodList.appendChild(wodItem);
			return wodItem;
		}
	}
}
