var _wodern = {
	window_create: function(id,style,holder){
		if($_('wod_'+id)){return $_('wod_'+id);}
		if(!style){var style = {};}
		var wContainer = (style.wContainer) ? style.wContainer : false;if(style.wContainer){style.wContainer = false;}
		extend(style,{'id':'wod_'+id,className:'wodern dragable'+(style.className ? ' '+style.className : ''),'.zIndex':_wodern.window_getZ()});
		var w = $C('DIV',style);
		//FIXME: traer aquí
		w.onclick = function(e){_desktop.window_signals_click(e,w);};
		w.windowBorder = $C('DIV',{className:'wodThemeBorder'},w);
		$C('DIV',{className:'wodThemeResize',onmousedown:_wodern.resize_mousedown,'w':w},w.windowBorder);
		w.titleContainer = $C('DIV',{className:'wodThemeTitle'},w.windowBorder);
		w.titleContainer.onmousedown = _littleDrag.onMouseDown;
		if(style.wodTitle){$C('H1',{className:'wodTitle','id':'wod_'+id+'_title',innerHTML:style.wodTitle},w.titleContainer);}
		$C('IMG',{className:'wodThemeTitleButton wodButtonClose',src:'r/images/t.gif',onmousedown:function(e){e.stopPropagation();},onclick:function(){_wodern.window_destroy(w);}},w.titleContainer);
		if(wContainer){w.windowBorder.appendChild(wContainer);window_container_init(wContainer);}
		w.windowContainer = (wContainer) ? wContainer : window_container(w.windowBorder);
		_wodern.position_get(w);
		if(holder){holder.appendChild(w);}
		return w;
	},
	window_destroy: function(el,ev){
		while(el.parentNode && !el.className.match(/^wodern( |$)/)){el = el.parentNode;}if(!el.parentNode){return;}
		if(el.beforeRemove){el.beforeRemove();};var afterRemove = function(){};if(el.afterRemove){afterRemove=el.afterRemove;}
		el.parentNode.removeChild(el);if(ev){ev.stopPropagation();}afterRemove();
	},
	window_getZ: function(){return _desktop.vars.wHighestZ++;},
	window_findParent: function(el){while(el.parentNode && !el.className.match(/^wodern( |$)/)){el = el.parentNode;}if(!el.parentNode){return false;}return el;},
	resize_mousedown: function(e){
		e.stopPropagation();
		var el = e.target;
		var w = el.w;
		var wpos = $getOffsetPosition(w);
		extend(w,{'startLeft':wpos.left,'startTop':wpos.top,'startWidth':w.clientWidth,'startHeight':w.clientHeight});

		extend(el,{'moveLeft':false,'moveRight':false,'moveTop':false,'moveBottom':false});
		var epos = $getOffsetPosition(el);
		extend(el,{'startLeft':epos.left,'startTop':epos.top,'startWidth':el.clientWidth,'startHeight':el.clientHeight});

		el.startX = e.clientX;
		el.startY = e.clientY;

		var relativeX = e.clientX-el.startLeft;
		if(relativeX < 5){el.moveLeft = true;}
		if(relativeX > el.startWidth-5){el.moveRight = true;}
		var relativeY = e.clientY-el.startTop;
		if(relativeY < 5){el.moveTop = true;}
		if(relativeY > el.startHeight-5){el.moveBottom = true;}

		switch(true){
			case (el.moveTop):el.mousemovehandler = function(ev){return _wodern.resize_mousemove_top(ev,el,w);};break
			case (el.moveBottom):el.mousemovehandler = function(ev){return _wodern.resize_mousemove_bottom(ev,el,w);};break
			case (el.moveLeft):el.mousemovehandler = function(ev){return _wodern.resize_mousemove_left(ev,el,w);};break
			case (el.moveRight):el.mousemovehandler = function(ev){return _wodern.resize_mousemove_right(ev,el,w);};break
		}
		el.mouseuphandler = function(ev){return _wodern.resize_mouseup(ev,el);};

		document.addEventListener('mousemove',el.mousemovehandler,true);
		document.addEventListener('mouseup',el.mouseuphandler,true);
	},
	resize_mousemove_left: function(e,el,w){var eL = e.clientX-el.startX;w.style.width = (w.startWidth-eL)+'px';w.style.left = (w.startLeft+eL)+'px';},
	resize_mousemove_right: function(e,el,w){var eL = e.clientX-el.startX;w.style.width = (w.startWidth+eL)+'px';},
	resize_mousemove_top: function(e,el,w){var eT = e.clientY-el.startY;w.style.height = (w.startHeight-eT)+'px';w.style.top = (w.startTop+eT)+'px';},
	resize_mousemove_bottom: function(e,el,w){var eT = e.clientY-el.startY;w.style.height = (w.startHeight+eT)+'px';},
	resize_mouseup: function(e,el){
		document.removeEventListener('mousemove',el.mousemovehandler,true);document.removeEventListener('mouseup',el.mouseuphandler,true);_wodern.position_set(el.w);
		var _tables = el.w.windowContainer.$L('wodTable');$each(_tables,function(k,table){if(table.reflow){table.reflow();}});
	},
	position_set: function(w){
		var pos = $getOffsetPosition(w);
		//FIXME: en algún punto necesitaremos posicionamiento por zonas y necesitaremos los valores right y bottom
		pos = jsonEncode({'width':w.clientWidth,'height':w.clientHeight,'left':pos.left,'top':pos.top});
		cookieSet('position:'+w.id,pos,20);
	},
	position_get: function(w){
		var a = {'.width':'400px','.height':'auto','.left':( Math.random()*(_desktop.vars.bodyWidth-400) )+'px','.top':( Math.random()*(_desktop.vars.bodyHeight-100) )+'px'};
		var c = unescape(cookieTake('position:'+w.id));
		do{if(!c){c = a;break;}c = jsonDecode(c);if(!c){c = a;break;}if(!c.width){c = a;break;}
			if(c.left > (_desktop.vars.bodyWidth-20)){c.left = _desktop.vars.bodyWidth-c.width;}
			c = {'.width':(c.width) ? c.width+'px' : a.width,'.height':(c.height) ? c.height+'px' : a.height,'.left':(c.left) ? c.left+'px' : a.left,'.top':(c.top) ? c.top+'px' : a.top};
		}while(false);

		w.$B(c);
	}
};
