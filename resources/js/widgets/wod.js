widgets.wodContainer = {
	init: function(params){
		var wodContainer = $C('DIV',{className:'wodContainer'});
		if(params.holder){params.holder.appendChild(wodContainer);}
		wodContainer.$B({
			'add': function(){var args = Array.prototype.slice.call(arguments);args.unshift(wodContainer);return widgets.wodContainer.add.apply({},args);}
		});
		return wodContainer;
	},
	add: function(wodContainer,item){
		wodContainer.appendChild(item);
		widgets.wodContainer.reflow(wodContainer);
	},
	reflow: function(wodContainer){
		var spaceAvailable = wodContainer.clientHeight;
		var spaceFixed = 0;
		var countVariableElems = 0;
		$each(wodContainer.childNodes,function(k,v){
			if($E.classHas(v,'fixed')){spaceFixed += v.clientHeight;return;}
			countVariableElems++;
		});

		if(!countVariableElems){return false;}
		spaceAvailable -= spaceFixed;
		var percentage = (100/countVariableElems)/100;
		$each(wodContainer.childNodes,function(k,v){
			if($E.classHas(v,'fixed')){return;}
			v.style.height = 'calc('+percentage+' * (100% - '+spaceFixed+'px))';
		});
	}
};
