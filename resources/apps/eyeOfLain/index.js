VAR_apps.eyeOfLain = {
	init: function(holder,params){
		if(!VAR_apps.eyeOfLain.vars){VAR_apps.eyeOfLain.vars = {wCounter:0,wHolder:holder,wList:$A([]),cList:$A([])};}
		if(params && params.tagName && params.tagName == 'LI'){VAR_apps.eyeOfLain.client_createViewer(params);return;}
	},
	appKill: function(){VAR_apps.eyeOfLain.vars.wList.each(function(w){_wodern.window_destroy(w);});},
	wList_removeElem: function(el){this.vars.wList.each(function(w,n){if(w == el){this.vars.wList.splice(n,1);}}.bind(this));},
	wList_append: function(w){VAR_apps.eyeOfLain.vars.wList.push(w);},
	onDropElement: function(iconElem,w){
		var iProp = _icon.getProperties(iconElem);
//alert(print_r(iProp));
//FIXME: comprobar el mime
		this.viewer_registerNodes(iconElem,w);
		this.viewer_loadElement(iProp,w);
	},
	client_createViewer: function(iconElem){
		var iProp = _icon.getProperties(iconElem);
		var holder = VAR_apps.eyeOfLain.vars.wHolder;
		var wContainer = window_container();

		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},wContainer);
		var wodMenu = new widget('widgets.wodMenu',{'title':'File'});
		wodMenu.item.add('<i class="icon-desktop"></i> Set as wallpaper',function(){_desktop.background_set(iconElem);});
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'Edit'});
		wodMenu.item.add('Flip Horizontal',function(){this.image_flipHorizontal(imgSource);}.bind(this));
		wodMenu.item.add('Flip Vertical',function(){this.image_flipVertical(imgSource);}.bind(this));
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'View'});
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'Photo'});
		wodMenuHolder.appendChild(wodMenu);
		var wodMenu = new widget('widgets.wodMenu',{'title':'Help'});
		wodMenuHolder.appendChild(wodMenu);

		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},wContainer);

		var wNum = VAR_apps.eyeOfLain.vars.wCounter;
		var w = window_create('eyeOfLain'+wNum,{wodTitle:'Eye of Lain','wContainer':wContainer,
			beforeRemove:function(){VAR_apps.eyeOfLain.wList_removeElem(w);},
			onDropElement:function(elem){VAR_apps.eyeOfLain.onDropElement(elem,this);}
		},holder);
		VAR_apps.eyeOfLain.wList_append(w);/* register the window */
		_desktop.desktop_shorcutKey_register(w,[16,17,66],function(){ths.viewer_next(ths,w);});/* CONTROL+SHIFT+B */
		VAR_apps.eyeOfLain.viewer_registerNodes(iconElem,w);
		var h = w.windowContainer;

		VAR_apps.eyeOfLain.viewer_loadElement(iProp,w);

		VAR_apps.eyeOfLain.vars.wCounter++;
		return wNum;
		//ROTATE
		//ctx.translate(img.width-1,img.height-1);
		//ctx.rotate(Math.PI);
		//ctx.drawImage(img,0,0,img.width, img.height);
	},
	image_flipHorizontal: function(img){if(!img){return;}var canvas = $C('CANVAS',{'width':img.width,'height':img.height});var ctx = _lc.getContext(canvas).$drawImage(img,0,0,img.width,img.height).$scale(-1,1).$drawImage(canvas,-img.width,0,img.width,img.height);img.src = canvas.toDataURL('image/png');},
	image_flipVertical: function(img){if(!img){return;}var canvas = $C('CANVAS',{'width':img.width,'height':img.height});var ctx = _lc.getContext(canvas).$drawImage(img,0,0,img.width,img.height).$scale(1,-1).$drawImage(canvas,0,-img.height,img.width,img.height);img.src = canvas.toDataURL('image/png');},
	viewer_registerNodes: function(elem,w){
		w.storage_imageElements = [];var fileMimes = $A(['image/png','image/jpeg']);
		$A(elem.parentNode.childNodes).each(function(el){var iProp = _icon.getProperties(el);if(fileMimes.find(iProp.fileMime) < 0){return;}w.storage_imageElements.push(iProp);});
	},
	viewer_registerCurrent: function(iProp,w){w.storage_imageCurrent = iProp;},
	viewer_loadElement: function(iProp,w){
		var h = w.windowContainer;
		/* Remove the old image canvas */
		if(w.canvas_image){w.canvas_image.parentNode.removeChild(w.canvas_image);}

		var fileStream = 'api/fs/file_stream/'+base64.encode(iProp.fileName)+'/'+base64.encode(iProp.fileRoute);
		var size = h.offsetWidth;
		_lc.imageResize(fileStream,size,size,'max',function(img){w.canvas_image = $C('IMG',{src:img},h);});

		/* register the current Image */
		this.viewer_registerCurrent(iProp,w);
	},
	viewer_next: function(ths,w){
		if(w.storage_imageElements.length < 2){return;}
		var c = w.storage_imageCurrent;
		var find = -1;
		$A(w.storage_imageElements).each(function(el,i){if(el.fileName == c.fileName && el.filePath == c.filePath && el.fileMime == c.fileMime){find = i;}});
		
		var candidate = (w.storage_imageElements[find+1]) ? w.storage_imageElements[find+1] : w.storage_imageElements[0];
		this.viewer_loadElement(candidate,w);
	}
};
