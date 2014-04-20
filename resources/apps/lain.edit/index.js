VAR_apps.lain.edit = {
	init: function(holder,params){
		if(!VAR_apps.lain.edit.vars){VAR_apps.lain.edit.vars = {wHolder:holder};}
		if(params && params.tagName && params.tagName == 'LI'){var iProp = _icon.getProperties(params);return VAR_apps.lain.edit.client(iProp);}
		return VAR_apps.lain.edit.client(params);
	},
	client: function(params){
		var wodern = _wodern.window_create('lain.edit',{},VAR_apps.lain.edit.vars.wHolder);
		wodern.set.title('<i class="icon-file-text"></i> No title - editor');
		var wContainer = wodern.windowContainer;

		var textCanvas = new widget('widgets.wodTextCanvas');
		wContainer.appendChild(textCanvas);

		wodern.show();
	}
};
