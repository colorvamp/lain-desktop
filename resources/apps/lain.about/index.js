VAR_apps.lain.about = {
	init: function(holder,params){
		if(!VAR_apps.lain.about.vars){VAR_apps.lain.about.vars = {wHolder:holder};}
		if(params && params.tagName && params.tagName == 'LI'){var iProp = _icon.getProperties(params);return VAR_apps.lain.about.client(iProp);}
		VAR_apps.lain.about.client(params);
	},
	client: function(params){
		var wodern = _wodern.window_create('lain.about',{},VAR_apps.lain.about.vars.wHolder);
		wodern.set.title('<i class="icon-info"></i> About ...');
		var wContainer = wodern.windowContainer;


		wodern.show();
	}
};
