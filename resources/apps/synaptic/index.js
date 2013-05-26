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

		var list = $C('DIV',{'className':'lainList'},h);
		var table = $C('TABLE',{'className':'dataTable','cellPadding':0,'cellSpacing':0},list);
		var thead = $C('TR',{},$C('THEAD',{},table));
		var titles = ['Name','Installed Version','Last Version','Size','Description'];
		$each(titles,function(k,title){$C('TD',{innerHTML:title},thead);});
		var tbody = $C('TBODY',{},table);
VAR_apps.synaptic.client_addRow(tbody,{'packetName':'0Ad'});
VAR_apps.synaptic.client_addRow(tbody,{'packetName':'0Ad'});
	},
	client_addRow: function(tbody,row){
		var tr = $C('TR',{},tbody);
		var td = $C('TD',{innerHTML:row.packetName},tr);
		var td = $C('TD',{innerHTML:row.packetName},tr);
		var td = $C('TD',{innerHTML:row.packetName},tr);
		var td = $C('TD',{innerHTML:row.packetName},tr);
		var td = $C('TD',{innerHTML:row.packetName},tr);
	}
}
