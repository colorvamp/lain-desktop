VAR_apps.lain.config = {
	init: function(holder,params){
		if(!VAR_apps.lain.config.vars){VAR_apps.lain.config.vars = {wHolder:holder};}
		if(params && params.tagName && params.tagName == 'LI'){var iProp = _icon.getProperties(params);return VAR_apps.lain.config.client(iProp);}
		VAR_apps.lain.config.client(params);
	},
	client: function(params){
		var wodern = _wodern.window_create('lain.config',{},VAR_apps.lain.config.vars.wHolder);
		wodern.set.title('<i class="icon-cog"></i> Lain configuration');
		var wContainer = wodern.windowContainer;


		wodern.show();
	}
};
