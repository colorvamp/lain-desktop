VAR_apps.eyeOfLain = {
	init: function(holder,params){
		if(!VAR_apps.eyeOfLain.vars){VAR_apps.eyeOfLain.vars = {wCounter:0,wHolder:holder,wList:$A([]),cList:$A([])};}
		if(params && params.tagName && params.tagName == 'LI'){VAR_apps.eyeOfLain.createViewer(params);return;}
	},
	appKill: function(){VAR_apps.eyeOfLain.vars.wList.each(function(w){window_destroy(w);});},
	wList_removeElem: function(el){this.vars.wList.each(function(w,n){if(w == el){this.vars.wList.splice(n,1);}}.bind(this));},
	onDropElement: function(iconElem,w){
		var iProp = _desktop.icon_getProperties(iconElem);
//alert(print_r(iProp));
//FIXME: comprobar el mime
		this.viewer_registerNodes(iconElem,w);
		this.viewer_loadElement(iProp,w);
	},
	createViewer: function(iconElem){
		var ths = this;
		var iProp = _desktop.icon_getProperties(iconElem);

		holder = this.vars.wHolder;

		var wNum = this.vars.wCounter;
		var wPos = _desktop.window_loadRelativePosition('eyeOfLain'+wNum);
		var w = window_create('eyeOfLain'+wNum,{wodTitle:'Eye of Lain','.width':'400px','.left':wPos.left+'px','.top':wPos.top+'px',
			beforeRemove:function(){this.wList_removeElem(w);}.bind(this),
			onDropElement:function(elem){ths.onDropElement(elem,this);}
		},holder);
		_desktop.desktop_shorcutKey_register(w,[16,17,66],function(){ths.viewer_next(ths,w);});/* CONTROL+SHIFT+B */
		this.viewer_registerNodes(iconElem,w);
		/* register the window */
		this.vars.wList.push(w);
		h = w.windowContainer;

		var imgSource = false;
		var wodMenuHolder = $C('UL',{className:'wodMenuHolder'},h);
		var ul = $C('UL',{},$C('LI',{innerHTML:'File',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
//$C('LI',{innerHTML:'Save',onclick:function(){alert(1);}.bind(this)},ul);
//$C('LI',{innerHTML:'Save as',onclick:function(){alert(2);}.bind(this)},ul);
			$C('LI',{innerHTML:'Set as wallpaper',onclick:function(){_desktop.background_set(iconElem);}},ul);
		var ul = $C('UL',{},$C('LI',{innerHTML:'Edit',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
//$C('LI',{innerHTML:'Undo',onclick:function(){alert(3);}.bind(this)},ul);
//$C('LI',{innerHTML:'Redo',onclick:function(){alert(4);}.bind(this)},ul);
			$C('LI',{className:'icon_object_flip_horizontal',innerHTML:'Flip Horizontal',onclick:function(){this.image_flipHorizontal(imgSource);}.bind(this)},ul);
			$C('LI',{className:'icon_object_flip_vertical',innerHTML:'Flip Vertical',onclick:function(){this.image_flipVertical(imgSource);}.bind(this)},ul);
		var ul = $C('UL',{},$C('LI',{innerHTML:'View',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
		var ul = $C('UL',{},$C('LI',{innerHTML:'Photo',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));
		var ul = $C('UL',{},$C('LI',{innerHTML:'Help',onclick:function(){_desktop.menu_show(this);}},wodMenuHolder));

		this.viewer_loadElement(iProp,w);

		this.vars.wCounter++;
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
		$A(elem.parentNode.childNodes).each(function(el){var iProp = _desktop.icon_getProperties(el);if(fileMimes.find(iProp.fileMime) < 0){return;}w.storage_imageElements.push(iProp);});
	},
	viewer_registerCurrent: function(iProp,w){w.storage_imageCurrent = iProp;},
	viewer_loadElement: function(iProp,w){
		var h = w.windowContainer;
		if(w.canvas_image){
			w.canvas_image.parentNode.removeChild(w.canvas_image);
		}

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
