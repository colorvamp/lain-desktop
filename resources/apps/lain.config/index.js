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

		var wodSection = new widget('widgets.wodSection');
		wContainer.appendChild(wodSection);
		var d = $C('DIV',{innerHTML:'<div class="bold">Mouse</div><p>Click delay [<span class="mouse-click-delay"></span>]ms</p>'});
		var wodSlider = new widget('widgets.wodSlider',{'steps':5});
		wodSlider.addEventListener('slider.update',function(e){
			var indicator = wodSection.querySelector('.mouse-click-delay');
			indicator.innerHTML = parseInt(e.detail.percentage*18)+200;
		});
		wodSlider.addEventListener('slider.end',function(e){
			var data = parseInt(e.detail.percentage*18)+200;
			var params = {'subcommand':'data.set','name':'mouse.speed','value':data};
			$ajax('api/desktop',params,{
				'onEnd': function(text){var r = jsonDecode(text);if(r.errorDescription){alert(print_r(r));return;}
//alert(1);
}
			});
		});
		d.appendChild(wodSlider);

		var btnHolder = $C('DIV',{className:'btn-group'},d);
		var btn = $C('DIV',{className:'btn mini',innerHTML:'<i class="icon-save"></i> Save'},btnHolder);
		btn.addEventListener('mouse.down.left',function(e){alert('Not implemented');});
		wodSection.item.add(d);


		wodern.show();
	}
};
