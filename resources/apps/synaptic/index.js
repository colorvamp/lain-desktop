VAR_apps.synaptic = {
	init: function(holder,params){
		if(!VAR_apps.synaptic.vars){VAR_apps.synaptic.vars = {wCounter:0,wHolder:holder,isOpen:false};}
		if(!VAR_apps.synaptic.vars.isOpen){setTimeout(function(){VAR_apps.synaptic.client();},1);}
		return true;
	},
	client: function(){
		var wPos = _desktop.window_loadRelativePosition('synaptic');
		var w = window_create('synaptic',{wodTitle:'Synaptic - Package Manager','.width':'400px','.left':wPos.left+'px','.top':wPos.top+'px',
			beforeRemove:function(){},
			onDropElement:function(elem){}
		},VAR_apps.synaptic.vars.wHolder);
		/* app conteniner */
		h = w.windowContainer;
		
	}
}
